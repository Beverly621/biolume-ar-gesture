import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

const SOURCE_ASSET_ROOT = '/Users/beverlykim/1-use/5-biolume/eco_druid_assets';
const COLORS = Object.freeze({
  cyanGlow: '#7EF6E7',
  mossSoftGreen: '#8FD6A3',
  pollenWarmYellow: '#F8D879',
  lavenderAura: '#A78BFA'
});

const DEFAULT_ASSET_BASE_URL = '/assets/eco_druid_assets';
const RIPPLE_NORMAL_PRIMARY = '03_water_ripple_textures/ripple_normal.png';
const RIPPLE_NORMAL_FALLBACK = '03_water_ripple_textures/water_ripple_normal_map_preview.jpg';
const FLOWER_REFERENCE_TEXTURE = '01_bioluminescent_plants/bioluminescent_fungi_reference_01.jpg';

class TimedPool {
  constructor(createItem, initialSize = 0) {
    this.createItem = createItem;
    this.free = [];
    this.active = new Set();

    for (let i = 0; i < initialSize; i += 1) {
      this.free.push(createItem());
    }
  }

  acquire() {
    const item = this.free.pop() ?? this.createItem();
    this.active.add(item);
    return item;
  }

  release(item) {
    if (!item || !this.active.has(item)) return;
    this.active.delete(item);
    this.free.push(item);
  }
}

/**
 * EcoDruidVFXManager
 *
 * 统一管理「生态德鲁伊：植物拟态与绽放」AR 手势特效：
 * - 统一 BufferGeometry，降低运行时频繁创建几何体带来的 GC 抖动。
 * - 用对象池复用花朵、粒子、水波、菌丝网络对象。
 * - 将所有颜色规范以 uniform / material 参数注入，方便后续艺术调优。
 * - WebXR 手势输入只要求传入标准 THREE.Vector3 / Quaternion，便于适配不同手势 SDK。
 */
export class EcoDruidVFXManager {
  constructor({
    scene,
    renderer,
    camera,
    assetBaseUrl = DEFAULT_ASSET_BASE_URL,
    env = {},
    maxMossInstances = 320,
    maxBloomParticles = 100
  }) {
    if (!scene || !renderer || !camera) {
      throw new Error('EcoDruidVFXManager 需要 scene、renderer、camera。');
    }

    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.assetBaseUrl = assetBaseUrl.replace(/\/$/, '');
    this.env = env;

    this.clock = new THREE.Clock();
    this.tmpVec3 = new THREE.Vector3();
    this.tmpVec3B = new THREE.Vector3();
    this.tmpMat4 = new THREE.Matrix4();
    this.tmpQuat = new THREE.Quaternion();
    this.tmpScale = new THREE.Vector3();
    this.noise = new ImprovedNoise();

    this.palette = {
      cyanGlow: new THREE.Color(COLORS.cyanGlow),
      mossSoftGreen: new THREE.Color(COLORS.mossSoftGreen),
      pollenWarmYellow: new THREE.Color(COLORS.pollenWarmYellow),
      lavenderAura: new THREE.Color(COLORS.lavenderAura)
    };

    this.maxMossInstances = maxMossInstances;
    this.maxBloomParticles = maxBloomParticles;
    this.sharedGeometries = {};
    this.sharedMaterials = {};
    this.mixers = [];
    this.activeTweens = [];
    this.ripples = [];
    this.myceliumFlows = [];
    this.mossSlots = [];
    this.mossCursor = 0;
    this.now = 0;

    this.flowerPool = null;
    this.bloomParticlePool = null;
    this.ripplePool = null;
  }

  async init() {
    this.createSharedGeometries();
    await this.loadTextures();
    this.createSharedMaterials();
    this.flowerPool = new TimedPool(() => this.createFlowerProxy(), 6);
    this.bloomParticlePool = new TimedPool(() => this.createBloomParticleSystem(), 4);
    this.ripplePool = new TimedPool(() => this.createRippleMesh(), 8);
    this.createMossField();
  }

  /**
   * 生成所有高频复用的几何体。
   * AR 手势特效的对象生命周期很短，统一几何体可以明显减少移动端 WebGL 资源分配。
   */
  createSharedGeometries() {
    this.sharedGeometries.flowerPetal = new THREE.PlaneGeometry(0.12, 0.24, 1, 1);
    this.sharedGeometries.flowerCore = new THREE.IcosahedronGeometry(0.055, 2);
    this.sharedGeometries.bloomParticles = new THREE.BufferGeometry();
    this.sharedGeometries.rippleCircle = new THREE.CircleGeometry(1, 96);
    this.sharedGeometries.mossTuft = new THREE.ConeGeometry(0.018, 0.08, 5, 1, true);
    this.sharedGeometries.myceliumLine = new THREE.BufferGeometry();

    const positions = new Float32Array(this.maxBloomParticles * 3);
    const colors = new Float32Array(this.maxBloomParticles * 3);
    const sizes = new Float32Array(this.maxBloomParticles);
    const life = new Float32Array(this.maxBloomParticles);

    this.sharedGeometries.bloomParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sharedGeometries.bloomParticles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.sharedGeometries.bloomParticles.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.sharedGeometries.bloomParticles.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
  }

  async loadTextures() {
    const loader = new THREE.TextureLoader();
    this.textures = {};

    this.textures.flowerReference = await this.loadTextureWithFallback(loader, [
      `${this.assetBaseUrl}/${FLOWER_REFERENCE_TEXTURE}`
    ]);
    this.textures.flowerReference.colorSpace = THREE.SRGBColorSpace;

    this.textures.rippleNormal = await this.loadTextureWithFallback(loader, [
      `${this.assetBaseUrl}/${RIPPLE_NORMAL_PRIMARY}`,
      `${this.assetBaseUrl}/${RIPPLE_NORMAL_FALLBACK}`
    ]);
    this.textures.rippleNormal.wrapS = THREE.RepeatWrapping;
    this.textures.rippleNormal.wrapT = THREE.RepeatWrapping;
    this.textures.rippleNormal.colorSpace = THREE.NoColorSpace;
  }

  loadTextureWithFallback(loader, urls) {
    return new Promise((resolve, reject) => {
      const tryLoad = (index) => {
        if (index >= urls.length) {
          reject(new Error(`纹理加载失败：${urls.join(', ')}`));
          return;
        }

        loader.load(
          urls[index],
          (texture) => resolve(texture),
          undefined,
          () => tryLoad(index + 1)
        );
      };

      tryLoad(0);
    });
  }

  createSharedMaterials() {
    this.sharedMaterials.flowerPetal = new THREE.MeshBasicMaterial({
      map: this.textures.flowerReference,
      color: this.palette.cyanGlow,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.sharedMaterials.flowerCore = new THREE.MeshStandardMaterial({
      color: this.palette.pollenWarmYellow,
      emissive: this.palette.pollenWarmYellow,
      emissiveIntensity: 2.4,
      roughness: 0.42,
      metalness: 0.0
    });

    this.sharedMaterials.bloomParticles = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        u_time: { value: 0 },
        u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        attribute float aSize;
        attribute float aLife;
        varying vec3 vColor;
        varying float vLife;

        void main() {
          vColor = color;
          vLife = aLife;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (180.0 / max(0.001, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vLife;

        void main() {
          vec2 p = gl_PointCoord - vec2(0.5);
          float d = length(p);
          float softDisc = smoothstep(0.5, 0.08, d);
          float alpha = softDisc * smoothstep(0.0, 0.22, vLife) * smoothstep(1.0, 0.72, vLife);
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    this.sharedMaterials.ripple = this.createRippleShaderMaterial();
  }

  /**
   * 自定义水波纹 Shader。
   * Fragment Shader 会采样真实水波纹 normal map，结合径向 mask 做半径扩张、法线扰动和边缘淡出。
   */
  createRippleShaderMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_progress: { value: 0 },
        u_normalMap: { value: this.textures.rippleNormal },
        u_cyanGlow: { value: this.palette.cyanGlow },
        u_mossSoftGreen: { value: this.palette.mossSoftGreen }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorldPosition = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float u_time;
        uniform float u_progress;
        uniform sampler2D u_normalMap;
        uniform vec3 u_cyanGlow;
        uniform vec3 u_mossSoftGreen;

        varying vec2 vUv;

        void main() {
          vec2 centered = vUv - vec2(0.5);
          float radius = length(centered) * 2.0;

          // progress 控制扩散环的位置：0.0 从中心开始，1.0 扩散到外缘。
          float ringCenter = mix(0.08, 1.0, u_progress);
          float ringWidth = mix(0.18, 0.055, u_progress);
          float ring = 1.0 - smoothstep(ringWidth, ringWidth + 0.045, abs(radius - ringCenter));

          // 使用真实 normal map 做两层流动采样，制造水面法线扰动。
          vec2 flowA = centered * 1.8 + vec2(u_time * 0.055, -u_time * 0.035);
          vec2 flowB = centered * 3.2 + vec2(-u_time * 0.03, u_time * 0.05);
          vec3 normalA = texture2D(u_normalMap, flowA).xyz * 2.0 - 1.0;
          vec3 normalB = texture2D(u_normalMap, flowB).xyz * 2.0 - 1.0;
          vec3 normalMix = normalize(normalA + normalB * 0.55);

          float disturbance = dot(normalMix.xy, normalize(centered + 0.0001));
          float shimmer = 0.55 + 0.45 * sin((radius - u_progress) * 34.0 + disturbance * 5.5 - u_time * 4.0);
          float edgeFade = smoothstep(1.0, 0.72, radius);
          float centerFade = smoothstep(0.02, 0.18, radius);
          float lifetimeFade = smoothstep(0.0, 0.12, u_progress) * smoothstep(1.0, 0.72, u_progress);

          vec3 color = mix(u_mossSoftGreen, u_cyanGlow, 0.68 + disturbance * 0.18);
          float alpha = ring * shimmer * edgeFade * centerFade * lifetimeFade;
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
  }

  createFlowerProxy() {
    const group = new THREE.Group();
    group.visible = false;

    // 当前资产文件夹提供的是花卉/菌类视觉参考图，不是 glTF 模型。
    // 这里用 7 个贴图花瓣 + 发光花蕊构建程序化花朵代理，后续可替换为真实模型。
    for (let i = 0; i < 7; i += 1) {
      const petal = new THREE.Mesh(this.sharedGeometries.flowerPetal, this.sharedMaterials.flowerPetal);
      const angle = (i / 7) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.07, Math.sin(angle) * 0.07, 0);
      petal.rotation.z = angle;
      group.add(petal);
    }

    const core = new THREE.Mesh(this.sharedGeometries.flowerCore, this.sharedMaterials.flowerCore);
    core.position.z = 0.018;
    group.add(core);

    group.scale.setScalar(0);
    this.scene.add(group);
    return group;
  }

  createBloomParticleSystem() {
    const geometry = this.sharedGeometries.bloomParticles.clone();
    const points = new THREE.Points(geometry, this.sharedMaterials.bloomParticles);
    points.visible = false;
    points.userData.velocities = Array.from({ length: this.maxBloomParticles }, () => new THREE.Vector3());
    points.userData.origin = new THREE.Vector3();
    points.userData.startedAt = 0;
    points.userData.duration = 2;
    this.scene.add(points);
    return points;
  }

  createRippleMesh() {
    const material = this.sharedMaterials.ripple.clone();
    material.uniforms = THREE.UniformsUtils.clone(this.sharedMaterials.ripple.uniforms);
    material.uniforms.u_normalMap.value = this.textures.rippleNormal;

    const mesh = new THREE.Mesh(this.sharedGeometries.rippleCircle, material);
    mesh.rotation.x = -Math.PI * 0.5;
    mesh.visible = false;
    mesh.userData.startedAt = 0;
    mesh.userData.duration = 1.35;
    this.scene.add(mesh);
    return mesh;
  }

  createMossField() {
    const material = new THREE.MeshStandardMaterial({
      color: this.palette.mossSoftGreen,
      emissive: this.palette.mossSoftGreen,
      emissiveIntensity: 0.35,
      roughness: 0.82,
      transparent: true,
      opacity: 1
    });

    // 为 InstancedMesh 注入 instanceOpacity 属性，实现每个苔藓实例独立 0.3s 淡入。
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float instanceOpacity;\nvarying float vInstanceOpacity;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvInstanceOpacity = instanceOpacity;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vInstanceOpacity;')
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( diffuse, opacity * vInstanceOpacity );');
    };

    this.mossMesh = new THREE.InstancedMesh(this.sharedGeometries.mossTuft, material, this.maxMossInstances);
    this.mossMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mossMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.maxMossInstances * 3), 3);

    const opacity = new Float32Array(this.maxMossInstances);
    this.mossMesh.geometry.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(opacity, 1));

    for (let i = 0; i < this.maxMossInstances; i += 1) {
      this.tmpMat4.compose(
        new THREE.Vector3(0, -10, 0),
        new THREE.Quaternion(),
        new THREE.Vector3(0.001, 0.001, 0.001)
      );
      this.mossMesh.setMatrixAt(i, this.tmpMat4);
      this.mossMesh.setColorAt(i, this.palette.mossSoftGreen);
      this.mossSlots[i] = {
        active: false,
        startedAt: 0,
        duration: 0.3,
        position: new THREE.Vector3(),
        scale: 1
      };
    }

    this.mossMesh.instanceMatrix.needsUpdate = true;
    this.mossMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.mossMesh);
  }

  /**
   * 手势 1：掌心打开。
   * 当 isOpening 为真时，花朵在 0.5s 内从 0 缩放到 1，并从掌心发射 100 个暖黄到蓝绿的粒子。
   */
  handlePalmOpen(hand, isOpening) {
    if (!isOpening) return;

    const palmPosition = this.readPalmPosition(hand, this.tmpVec3);
    const palmQuaternion = this.readPalmQuaternion(hand, this.tmpQuat);

    const flower = this.flowerPool.acquire();
    flower.visible = true;
    flower.position.copy(palmPosition);
    flower.quaternion.copy(palmQuaternion);
    flower.scale.setScalar(0);

    this.addTween({
      target: flower.scale,
      duration: 0.5,
      from: 0,
      to: 1,
      onUpdate: (scale, t) => {
        const eased = this.easeOutBack(t);
        flower.scale.setScalar(scale * eased);
      },
      onComplete: () => {
        this.addTween({
          target: flower.scale,
          duration: 0.35,
          from: 1,
          to: 0,
          delay: 1.65,
          onUpdate: (scale) => flower.scale.setScalar(scale),
          onComplete: () => {
            flower.visible = false;
            this.flowerPool.release(flower);
          }
        });
      }
    });

    const particles = this.bloomParticlePool.acquire();
    this.spawnBloomParticles(particles, palmPosition);
  }

  spawnBloomParticles(points, origin) {
    const geometry = points.geometry;
    const positions = geometry.getAttribute('position');
    const colors = geometry.getAttribute('color');
    const sizes = geometry.getAttribute('aSize');
    const life = geometry.getAttribute('aLife');
    const velocities = points.userData.velocities;

    points.visible = true;
    points.userData.origin.copy(origin);
    points.userData.startedAt = this.now;
    points.userData.duration = 2;

    for (let i = 0; i < this.maxBloomParticles; i += 1) {
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 1.2 + 0.25,
        Math.random() * 2 - 1
      ).normalize();
      velocities[i].copy(dir).multiplyScalar(0.22 + Math.random() * 0.38);

      positions.setXYZ(i, origin.x, origin.y, origin.z);

      const mix = i / Math.max(1, this.maxBloomParticles - 1);
      const color = this.palette.pollenWarmYellow.clone().lerp(this.palette.cyanGlow, mix);
      colors.setXYZ(i, color.r, color.g, color.b);
      sizes.setX(i, 0.014 + Math.random() * 0.018);
      life.setX(i, 1);
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
    sizes.needsUpdate = true;
    life.needsUpdate = true;
  }

  /**
   * 手势 2：食指轻点。
   * 在指尖触碰点激活 InstancedMesh 苔藓实例，并释放一圈采样真实 normal map 的水波纹。
   */
  handleFingerTap(tipPosition) {
    const position = this.toVector3(tipPosition, this.tmpVec3);
    this.activateMoss(position);
    this.spawnRipple(position);
  }

  activateMoss(position) {
    const index = this.mossCursor;
    this.mossCursor = (this.mossCursor + 1) % this.maxMossInstances;

    const slot = this.mossSlots[index];
    slot.active = true;
    slot.startedAt = this.now;
    slot.duration = 0.3;
    slot.position.copy(position);
    slot.scale = 0.72 + Math.random() * 0.65;

    const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      (Math.random() - 0.5) * 0.25,
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.25
    ));
    slot.rotation = rotation;

    this.updateMossSlot(index, 0);
  }

  spawnRipple(position) {
    const ripple = this.ripplePool.acquire();
    ripple.visible = true;
    ripple.position.copy(position);
    ripple.position.y += 0.006;
    ripple.scale.setScalar(0.08);
    ripple.material.uniforms.u_time.value = this.now;
    ripple.material.uniforms.u_progress.value = 0;
    ripple.userData.startedAt = this.now;
    ripple.userData.duration = 1.35;
    this.ripples.push(ripple);
  }

  /**
   * 手势 3：双手拉伸。
   * 当左右手掌距离大于 15cm 时，构建 5 条带轻微柏林噪声扰动的三维贝塞尔曲线，
   * 并让薰衣草紫粒子沿 u_progress 平滑流动，形成菌丝网络被拉开的视觉。
   */
  handleTwoHandStretch(leftPalm, rightPalm, distance) {
    if (distance <= 0.15) return;

    const start = this.toVector3(leftPalm, new THREE.Vector3());
    const end = this.toVector3(rightPalm, new THREE.Vector3());
    const group = new THREE.Group();
    const curves = [];
    const particles = [];

    for (let i = 0; i < 5; i += 1) {
      const offset = (i - 2) * 0.035;
      const mid = start.clone().lerp(end, 0.5);
      const normal = end.clone().sub(start).cross(new THREE.Vector3(0, 1, 0)).normalize();
      if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);

      const n = this.noise.noise(i * 0.41, this.now * 0.2, distance * 2.0);
      const controlA = start.clone().lerp(end, 0.33).addScaledVector(normal, offset + n * 0.025).add(new THREE.Vector3(0, 0.05 + i * 0.006, 0));
      const controlB = mid.clone().lerp(end, 0.66).addScaledVector(normal, -offset + n * 0.02).add(new THREE.Vector3(0, -0.035 + i * 0.004, 0));
      const curve = new THREE.CubicBezierCurve3(start, controlA, controlB, end);
      curves.push(curve);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(42));
      const line = new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: this.palette.lavenderAura,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending
        })
      );
      group.add(line);
    }

    const particleCount = 90;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      positions.set([start.x, start.y, start.z], i * 3);
      seeds[i] = Math.random();
      sizes[i] = 0.01 + Math.random() * 0.018;
      particles.push({
        curveIndex: i % curves.length,
        seed: seeds[i],
        speed: 0.28 + Math.random() * 0.36
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_color: { value: this.palette.lavenderAura },
        u_progress: { value: 0 }
      },
      vertexShader: `
        attribute float aSeed;
        attribute float aSize;
        uniform float u_progress;
        varying float vAlpha;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (150.0 / max(0.001, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = 0.45 + 0.55 * sin((u_progress + aSeed) * 6.28318);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float vAlpha;

        void main() {
          vec2 p = gl_PointCoord - vec2(0.5);
          float d = length(p);
          float alpha = smoothstep(0.5, 0.05, d) * vAlpha;
          gl_FragColor = vec4(u_color, alpha);
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    group.add(points);
    this.scene.add(group);

    this.myceliumFlows.push({
      group,
      curves,
      particles,
      points,
      startedAt: this.now,
      duration: 2.4
    });
  }

  update(time) {
    this.now = time;
    this.sharedMaterials.bloomParticles.uniforms.u_time.value = time;
    this.updateTweens(time);
    this.updateBloomParticles(time);
    this.updateMoss(time);
    this.updateRipples(time);
    this.updateMycelium(time);
  }

  updateTweens(time) {
    for (let i = this.activeTweens.length - 1; i >= 0; i -= 1) {
      const tween = this.activeTweens[i];
      const local = time - tween.startedAt - tween.delay;
      if (local < 0) continue;

      const t = Math.min(1, local / tween.duration);
      const value = THREE.MathUtils.lerp(tween.from, tween.to, tween.ease(t));
      tween.onUpdate(value, t);

      if (t >= 1) {
        this.activeTweens.splice(i, 1);
        tween.onComplete?.();
      }
    }
  }

  updateBloomParticles(time) {
    for (const points of this.bloomParticlePool.active) {
      const elapsed = time - points.userData.startedAt;
      const progress = elapsed / points.userData.duration;
      if (progress >= 1) {
        points.visible = false;
        this.bloomParticlePool.release(points);
        continue;
      }

      const geometry = points.geometry;
      const positions = geometry.getAttribute('position');
      const life = geometry.getAttribute('aLife');
      const velocities = points.userData.velocities;
      const origin = points.userData.origin;

      for (let i = 0; i < this.maxBloomParticles; i += 1) {
        const swirl = this.noise.noise(i * 0.11, elapsed * 0.6, progress * 2.0) * 0.08;
        this.tmpVec3B.copy(velocities[i])
          .multiplyScalar(elapsed)
          .add(new THREE.Vector3(Math.sin(elapsed + i) * swirl, -0.08 * elapsed * elapsed, Math.cos(elapsed + i) * swirl));
        positions.setXYZ(i, origin.x + this.tmpVec3B.x, origin.y + this.tmpVec3B.y, origin.z + this.tmpVec3B.z);
        life.setX(i, 1 - progress);
      }

      positions.needsUpdate = true;
      life.needsUpdate = true;
    }
  }

  updateMoss(time) {
    for (let i = 0; i < this.mossSlots.length; i += 1) {
      const slot = this.mossSlots[i];
      if (!slot.active) continue;
      const progress = Math.min(1, (time - slot.startedAt) / slot.duration);
      this.updateMossSlot(i, this.easeOutCubic(progress));
    }
  }

  updateMossSlot(index, opacity) {
    const slot = this.mossSlots[index];
    const heightScale = Math.max(0.001, opacity) * slot.scale;
    this.tmpScale.set(slot.scale, heightScale, slot.scale);
    this.tmpMat4.compose(slot.position, slot.rotation ?? new THREE.Quaternion(), this.tmpScale);
    this.mossMesh.setMatrixAt(index, this.tmpMat4);

    const opacityAttr = this.mossMesh.geometry.getAttribute('instanceOpacity');
    opacityAttr.setX(index, opacity);
    opacityAttr.needsUpdate = true;
    this.mossMesh.instanceMatrix.needsUpdate = true;
  }

  updateRipples(time) {
    for (let i = this.ripples.length - 1; i >= 0; i -= 1) {
      const ripple = this.ripples[i];
      const progress = (time - ripple.userData.startedAt) / ripple.userData.duration;
      if (progress >= 1) {
        ripple.visible = false;
        this.ripples.splice(i, 1);
        this.ripplePool.release(ripple);
        continue;
      }

      ripple.material.uniforms.u_time.value = time;
      ripple.material.uniforms.u_progress.value = progress;
      ripple.scale.setScalar(0.08 + this.easeOutCubic(progress) * 0.9);
    }
  }

  updateMycelium(time) {
    for (let i = this.myceliumFlows.length - 1; i >= 0; i -= 1) {
      const flow = this.myceliumFlows[i];
      const elapsed = time - flow.startedAt;
      const progress = elapsed / flow.duration;

      if (progress >= 1) {
        flow.group.traverse((child) => {
          child.geometry?.dispose?.();
          child.material?.dispose?.();
        });
        this.scene.remove(flow.group);
        this.myceliumFlows.splice(i, 1);
        continue;
      }

      const positions = flow.points.geometry.getAttribute('position');
      flow.points.material.uniforms.u_progress.value = progress;

      for (let p = 0; p < flow.particles.length; p += 1) {
        const particle = flow.particles[p];
        const u = (particle.seed + elapsed * particle.speed) % 1;
        const curve = flow.curves[particle.curveIndex];
        const point = curve.getPoint(u);
        const noise = this.noise.noise(p * 0.07, elapsed * 0.5, u * 2.0) * 0.012;
        point.y += noise;
        positions.setXYZ(p, point.x, point.y, point.z);
      }

      positions.needsUpdate = true;

      const fade = Math.min(1, progress / 0.22) * Math.min(1, (1 - progress) / 0.24);
      flow.group.children.forEach((child) => {
        if (child.material?.opacity !== undefined) {
          child.material.opacity = child.isLine ? 0.28 * fade : child.material.opacity;
        }
      });
    }
  }

  addTween({ target, duration, from, to, delay = 0, ease = this.easeOutCubic, onUpdate, onComplete }) {
    this.activeTweens.push({
      target,
      duration,
      from,
      to,
      delay,
      ease,
      onUpdate,
      onComplete,
      startedAt: this.now
    });
  }

  readPalmPosition(hand, target) {
    if (hand?.palmPosition) return target.copy(hand.palmPosition);
    if (hand?.position) return target.copy(hand.position);
    if (hand?.matrixWorld) return target.setFromMatrixPosition(hand.matrixWorld);
    return target.set(0, 1, -0.55);
  }

  readPalmQuaternion(hand, target) {
    if (hand?.quaternion) return target.copy(hand.quaternion);
    if (hand?.matrixWorld) return hand.matrixWorld.decompose(this.tmpVec3B, target, this.tmpScale), target;
    return target.identity();
  }

  toVector3(value, target) {
    if (value instanceof THREE.Vector3) return target.copy(value);
    if (Array.isArray(value)) return target.set(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
    if (value && typeof value === 'object') return target.set(value.x ?? 0, value.y ?? 0, value.z ?? 0);
    return target.set(0, 0, 0);
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  dispose() {
    Object.values(this.sharedGeometries).forEach((geometry) => geometry.dispose());
    Object.values(this.sharedMaterials).forEach((material) => material.dispose());
    Object.values(this.textures ?? {}).forEach((texture) => texture.dispose());
  }
}

export const EcoDruidPalette = COLORS;
export const EcoDruidAssetConfig = {
  sourceRoot: SOURCE_ASSET_ROOT,
  runtimeBaseUrl: DEFAULT_ASSET_BASE_URL,
  rippleNormalPrimary: RIPPLE_NORMAL_PRIMARY,
  rippleNormalFallback: RIPPLE_NORMAL_FALLBACK,
  flowerReferenceTexture: FLOWER_REFERENCE_TEXTURE
};
