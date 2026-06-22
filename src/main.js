import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { EcoDruidVFXManager } from './EcoDruidVFXManager.js';
import { initializeEcoDruidSkillRuntime } from './skills/skillRegistry.js';
import { requestCameraPermission, XRHandGestureController } from './xrHandGestures.js';
import './styles.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="eco-druid-landing" aria-label="Eco-Druid Synesthesia AR landing">
    <section class="ambient-background" aria-hidden="true">
      <div class="mist mist-a"></div>
      <div class="mist mist-b"></div>
      <div class="sleeping-seed"></div>
      <span class="spore spore-1"></span>
      <span class="spore spore-2"></span>
      <span class="spore spore-3"></span>
      <span class="spore spore-4"></span>
      <span class="spore spore-5"></span>
      <span class="spore spore-6"></span>
      <span class="spore spore-7"></span>
      <span class="spore spore-8"></span>
    </section>

    <section class="hero-copy" aria-labelledby="hero-title">
      <p class="kicker">Botanical AR ritual</p>
      <h1 id="hero-title">
        <span>生态德鲁伊</span>
        <span>Eco-Druid Synesthesia</span>
      </h1>
      <h2>
        <span>植物拟态与绽放 AR 手势特效</span>
        <span>Botanical mimicry and blooming gestures in augmented reality.</span>
      </h2>
      <p class="poem">
        <span>用手掌唤醒花朵，用指尖种下苔藓，用双手拉开一张会呼吸的孢子网。</span>
        <span>Awaken a flower in your palm, seed moss with your fingertip, and stretch a living spore web between your hands.</span>
      </p>
    </section>

    <section class="ar-viewport-shell" aria-label="AR preview viewport">
      <div class="viewport" id="viewport"></div>
      <div class="viewport-vignette" aria-hidden="true"></div>
      <div class="seed-preview" aria-hidden="true">
        <span></span>
      </div>
      <div class="ar-state-card" id="arStateCard">
        <p class="state-label" id="arStateLabel">Preview Mode</p>
        <p class="state-copy" id="arStateCopy">
          当前浏览器暂不支持 WebXR AR，可先使用桌面演示模式。<br>
          Your browser does not support WebXR AR. You can still explore the desktop preview.
        </p>
      </div>
    </section>

    <aside class="gesture-dock" aria-label="Gesture selection dock">
      <div class="dock-head">
        <p>Gesture Dock</p>
        <span id="status">初始化 WebXR 场景中</span>
      </div>
      <button class="gesture-card active" id="demoBloom" type="button" data-gesture="bloom">
        <span class="gesture-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 21c-1.9-3.1-2.8-5.7-2.8-7.9C9.2 9.8 10.4 7 12 3c1.6 4 2.8 6.8 2.8 10.1 0 2.2-.9 4.8-2.8 7.9Z"/><path d="M12 14.8c-3.8-.4-6.4-2.1-8-5 3.8-.7 6.5.2 8 2.7 1.5-2.5 4.2-3.4 8-2.7-1.6 2.9-4.2 4.6-8 5Z"/></svg>
        </span>
        <span class="gesture-text">
          <strong>掌心绽放 <em>Palm Bloom</em></strong>
          <span>张开手掌，唤醒掌心花苞。</span>
          <span>Open your palm to awaken a glowing bud.</span>
        </span>
      </button>
      <button class="gesture-card" id="demoTap" type="button" data-gesture="moss">
        <span class="gesture-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 20c4.2 0 7.6-2.1 7.6-4.7S16.2 10.6 12 10.6 4.4 12.7 4.4 15.3 7.8 20 12 20Z"/><path d="M12 16.6c2.3 0 4.2-.7 4.2-1.6s-1.9-1.6-4.2-1.6-4.2.7-4.2 1.6 1.9 1.6 4.2 1.6Z"/><path d="M12 4c1.1 2.2 1.1 4.1 0 5.8C10.9 8.1 10.9 6.2 12 4Z"/></svg>
        </span>
        <span class="gesture-text">
          <strong>指尖苔痕 <em>Moss Touch</em></strong>
          <span>轻触空间，种下一圈苔藓与水纹。</span>
          <span>Touch the air to seed moss and ripples.</span>
        </span>
      </button>
      <button class="gesture-card" id="demoStretch" type="button" data-gesture="web">
        <span class="gesture-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 12c4-4.7 12-4.7 16 0-4 4.7-12 4.7-16 0Z"/><path d="M5.5 12c3.4 1.9 9.6 1.9 13 0"/><path d="M5.5 12c3.4-1.9 9.6-1.9 13 0"/><path d="M8 9.2 16 14.8M16 9.2 8 14.8"/></svg>
        </span>
        <span class="gesture-text">
          <strong>菌丝拉伸 <em>Spore Web</em></strong>
          <span>合十再拉开，牵引一张会呼吸的孢子网。</span>
          <span>Pull your hands apart to weave a living spore web.</span>
        </span>
      </button>
      <div class="dock-actions">
        <button id="enterGarden" class="primary-cta" type="button">
          <span>Enter AR Garden</span>
          <small>进入生态花园</small>
        </button>
        <button id="desktopRitual" class="secondary-cta" type="button">
          <span>Launch Desktop Ritual</span>
          <small>启动桌面演示</small>
        </button>
      </div>
    </aside>

    <footer class="footer-hint">
      <span>WebXR AR requires a compatible mobile browser and camera permission.</span>
      <span>桌面端可使用预览模式；进入 AR 前请先允许摄像头权限。</span>
    </footer>
  </main>
`;

const viewport = document.querySelector('#viewport');
const status = document.querySelector('#status');
const arStateLabel = document.querySelector('#arStateLabel');
const arStateCopy = document.querySelector('#arStateCopy');
const arStateCard = document.querySelector('#arStateCard');
const enterGarden = document.querySelector('#enterGarden');
const desktopRitual = document.querySelector('#desktopRitual');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07110f);

const camera = new THREE.PerspectiveCamera(65, viewport.clientWidth / viewport.clientHeight, 0.01, 100);
camera.position.set(0, 1.25, 2.3);
camera.lookAt(0, 0.75, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true;
viewport.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0x7ef6e7, 0x123029, 1.1);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xf8d879, 2.4);
key.position.set(1.2, 2.5, 1.1);
scene.add(key);

const anchorGrid = new THREE.GridHelper(3, 24, 0x274842, 0x132a26);
anchorGrid.position.y = -0.01;
scene.add(anchorGrid);

const vfx = new EcoDruidVFXManager({
  scene,
  renderer,
  camera,
  assetBaseUrl: '/assets/eco_druid_assets',
  env: {
    // 第三方 API 只允许从环境注入；当前工程未硬编码任何密钥。
    optionalApiEndpoint: import.meta.env.VITE_BIOLUME_API_ENDPOINT ?? ''
  }
});

async function bootstrap() {
  await vfx.init();
  const skills = initializeEcoDruidSkillRuntime(vfx);
  const handGestures = new XRHandGestureController({ renderer, skills, status });
  status.textContent = '正在检测 AR 支持状态';

  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['hand-tracking', 'dom-overlay'],
    domOverlay: { root: document.body }
  });
  arButton.classList.add('ar-button');
  document.body.appendChild(arButton);

  const arSupported = await detectARSupport();
  updateARState(arSupported);

  async function grantCameraAccess() {
    try {
      await requestCameraPermission();
      status.textContent = '摄像头授权完成，可进入 AR 手势模式';
      arStateCard.classList.add('permission-granted');
      return true;
    } catch (error) {
      status.textContent = `摄像头授权失败：${error.message}`;
      return false;
    }
  }

  const demoHand = {
    palmPosition: new THREE.Vector3(0, 0.92, 0.36),
    quaternion: new THREE.Quaternion()
  };

  const setActiveGesture = (gesture) => {
    document.querySelectorAll('.gesture-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.gesture === gesture);
    });
  };

  const burst = (source) => {
    const rect = source.getBoundingClientRect();
    const root = document.createElement('span');
    root.className = 'cta-burst';
    root.style.left = `${rect.left + rect.width / 2}px`;
    root.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(root);
    window.setTimeout(() => root.remove(), 360);
  };

  document.querySelector('#demoBloom').addEventListener('click', () => {
    setActiveGesture('bloom');
    skills.invoke('palm-open-bloom', demoHand, true);
  });

  document.querySelector('#demoTap').addEventListener('click', () => {
    setActiveGesture('moss');
    const p = new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.02, 0.36 + (Math.random() - 0.5) * 0.45);
    skills.invoke('finger-tap-moss-ripple', p);
  });

  document.querySelector('#demoStretch').addEventListener('click', () => {
    setActiveGesture('web');
    const leftPalm = new THREE.Vector3(-0.42, 0.92, 0.36);
    const rightPalm = new THREE.Vector3(0.42, 0.95, 0.36);
    skills.invoke('two-hand-mycelium-stretch', leftPalm, rightPalm, leftPalm.distanceTo(rightPalm));
  });

  enterGarden.addEventListener('click', async () => {
    burst(enterGarden);
    const granted = await grantCameraAccess();
    if (!granted) return;

    if (arSupported) {
      arButton.click();
      return;
    }

    runDesktopRitual(skills, demoHand);
  });

  desktopRitual.addEventListener('click', () => {
    burst(desktopRitual);
    runDesktopRitual(skills, demoHand);
  });

  window.addEventListener('resize', () => {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  renderer.setAnimationLoop((time, frame) => {
    const seconds = time * 0.001;
    handGestures.update(seconds, frame);
    vfx.update(seconds, frame);
    renderer.render(scene, camera);
  });
}

async function detectARSupport() {
  if (!navigator.xr?.isSessionSupported) return false;
  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    return false;
  }
}

function updateARState(isReady) {
  document.body.classList.toggle('ar-ready', isReady);
  if (isReady) {
    arStateLabel.textContent = 'AR Ready';
    arStateCopy.innerHTML = '可进入增强现实体验<br>Ready to enter the augmented garden.';
    status.textContent = 'AR Ready，可进入增强现实体验';
    return;
  }

  arStateLabel.textContent = 'Preview Mode';
  arStateCopy.innerHTML = '当前浏览器暂不支持 WebXR AR，可先使用桌面演示模式。<br>Your browser does not support WebXR AR. You can still explore the desktop preview.';
  status.textContent = 'Preview Mode，可使用桌面演示模式';
}

function runDesktopRitual(skills, demoHand) {
  skills.invoke('palm-open-bloom', demoHand, true);
  window.setTimeout(() => {
    skills.invoke('finger-tap-moss-ripple', new THREE.Vector3(0.05, 0.02, 0.36));
  }, 280);
  window.setTimeout(() => {
    const leftPalm = new THREE.Vector3(-0.42, 0.92, 0.36);
    const rightPalm = new THREE.Vector3(0.42, 0.95, 0.36);
    skills.invoke('two-hand-mycelium-stretch', leftPalm, rightPalm, leftPalm.distanceTo(rightPalm));
  }, 560);
}

bootstrap().catch((error) => {
  console.error(error);
  status.textContent = `初始化失败：${error.message}`;
});
