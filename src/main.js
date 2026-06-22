import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { EcoDruidVFXManager } from './EcoDruidVFXManager.js';
import { initializeEcoDruidSkillRuntime } from './skills/skillRegistry.js';
import { createCameraHandTracker } from './skills/mediapipeHandRuntime.js';
import { requestCameraStream, XRHandGestureController } from './xrHandGestures.js';
import './styles.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="eco-druid-landing" aria-label="Eco-Druid Synesthesia AR landing">
    <section class="ambient-background" aria-hidden="true">
      <div class="mist mist-a"></div>
      <div class="mist mist-b"></div>
      <div class="vine-shadow vine-shadow-a"></div>
      <div class="vine-shadow vine-shadow-b"></div>
      ${Array.from({ length: 28 }, (_, index) => `<span class="spore spore-${index + 1}"></span>`).join('')}
    </section>

    <section class="hero-copy" aria-labelledby="hero-title">
      <p class="kicker">✧ AR GESTURE EXPERIMENT · BOTANICAL RITUAL</p>
      <h1 id="hero-title">
        <span class="title-cn">生态德鲁伊</span>
        <span class="title-en">Eco-Druid Synesthesia</span>
      </h1>
      <h2>
        <span class="subtitle-cn">植物拟态 AR 手势特效</span>
        <span class="subtitle-en">Botanical gestures in augmented reality.</span>
      </h2>
      <div class="hero-divider" aria-hidden="true"><span></span></div>
      <p class="poem">
        <span class="poem-cn">掌心开花，指尖生苔，双手牵引孢子之网。</span>
        <span class="poem-en">Bloom with your palm. Seed with your touch. Weave with both hands.</span>
      </p>
    </section>

    <section class="ar-viewport-shell" aria-label="AR preview viewport">
      <div class="glow-aura" aria-hidden="true"></div>
      <div class="moss-glow" aria-hidden="true"></div>
      <div class="soft-grid-floor" aria-hidden="true"></div>
      <div class="viewport" id="viewport"></div>
      <div class="viewport-vignette" aria-hidden="true"></div>
      <div class="seed-preview" aria-hidden="true">
        <img src="/assets/ui/eco-seed.png" alt="" />
      </div>
      <div class="ar-state-card" id="arStateCard">
        <p class="state-label" id="arStateLabel">Preview Mode</p>
        <p class="state-copy" id="arStateCopy">
          Enter AR Garden opens realtime camera mode. Desktop Preview is available without camera access.<br>
          进入生态花园将优先打开实时摄像头模式，桌面预览无需摄像头权限。
        </p>
      </div>
    </section>

    <aside class="gesture-dock" aria-label="Gesture selection dock">
      <span class="dock-star" aria-hidden="true">✦</span>
      <div class="dock-head">
        <p>Gesture Dock</p>
        <span id="status">初始化 WebXR 场景中</span>
      </div>
      <button class="gesture-card active" id="demoBloom" type="button" data-gesture="bloom">
        <span class="gesture-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 21c-1.9-3.1-2.8-5.7-2.8-7.9C9.2 9.8 10.4 7 12 3c1.6 4 2.8 6.8 2.8 10.1 0 2.2-.9 4.8-2.8 7.9Z"/><path d="M12 14.8c-3.8-.4-6.4-2.1-8-5 3.8-.7 6.5.2 8 2.7 1.5-2.5 4.2-3.4 8-2.7-1.6 2.9-4.2 4.6-8 5Z"/></svg>
        </span>
        <span class="gesture-text">
          <strong>掌心绽放</strong>
          <em>Palm Bloom</em>
          <span class="gesture-description">Open your palm to awaken a glowing bud.</span>
        </span>
      </button>
      <button class="gesture-card" id="demoTap" type="button" data-gesture="moss">
        <span class="gesture-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 20c4.2 0 7.6-2.1 7.6-4.7S16.2 10.6 12 10.6 4.4 12.7 4.4 15.3 7.8 20 12 20Z"/><path d="M12 16.6c2.3 0 4.2-.7 4.2-1.6s-1.9-1.6-4.2-1.6-4.2.7-4.2 1.6 1.9 1.6 4.2 1.6Z"/><path d="M12 4c1.1 2.2 1.1 4.1 0 5.8C10.9 8.1 10.9 6.2 12 4Z"/></svg>
        </span>
        <span class="gesture-text">
          <strong>指尖苔痕</strong>
          <em>Moss Touch</em>
          <span class="gesture-description">Touch the air to seed moss and ripples.</span>
        </span>
      </button>
      <button class="gesture-card" id="demoStretch" type="button" data-gesture="web">
        <span class="gesture-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 12c4-4.7 12-4.7 16 0-4 4.7-12 4.7-16 0Z"/><path d="M5.5 12c3.4 1.9 9.6 1.9 13 0"/><path d="M5.5 12c3.4-1.9 9.6-1.9 13 0"/><path d="M8 9.2 16 14.8M16 9.2 8 14.8"/></svg>
        </span>
        <span class="gesture-text">
          <strong>菌丝拉伸</strong>
          <em>Spore Web</em>
          <span class="gesture-description">Pull your hands apart to weave a living spore web.</span>
        </span>
      </button>
      <div class="dock-actions">
        <button id="enterGarden" class="primary-cta" type="button">
          <span>Enter AR Garden</span>
          <small>进入生态花园</small>
        </button>
        <button id="desktopRitual" class="secondary-cta" type="button">
          <span>Watch Desktop Preview</span>
          <small>观看桌面预览</small>
        </button>
      </div>
    </aside>

    <footer class="footer-hint">
      <span>Enter AR Garden opens the realtime camera gesture experience. Desktop preview is available without camera access.</span>
      <span>进入生态花园将打开实时摄像头手势体验，桌面预览无需摄像头权限。</span>
    </footer>

    <section class="camera-experience" id="cameraExperience" hidden aria-label="Camera gesture experience">
      <video id="cameraVideo" class="camera-video" autoplay muted playsinline></video>
      <div id="cameraVfxLayer" class="camera-vfx-layer" aria-hidden="true"></div>
      <div class="camera-shade" aria-hidden="true"></div>
      <div class="camera-hud">
        <div class="camera-status-panel">
          <p class="camera-eyebrow">Camera Gesture Mode</p>
          <h2>实时生态花园</h2>
          <span id="cameraStatus">Camera Ready / 摄像头待开启</span>
          <small id="cameraHint">摄像头启动后会尝试加载 MediaPipe Hands；也可使用下方按钮手动测试三个特效。</small>
        </div>
        <div class="camera-trigger-row" aria-label="Manual gesture effect triggers">
          <button id="cameraBloom" type="button">掌心绽放<br><span>Palm Bloom</span></button>
          <button id="cameraMoss" type="button">指尖苔痕<br><span>Moss Touch</span></button>
          <button id="cameraWeb" type="button">菌丝拉伸<br><span>Spore Web</span></button>
        </div>
        <button id="exitGarden" class="exit-garden" type="button">Exit Garden / 退出生态花园</button>
      </div>
    </section>

    <div id="modeNotice" class="mode-notice" role="status" aria-live="polite" hidden></div>
  </main>
`;

const viewport = document.querySelector('#viewport');
const status = document.querySelector('#status');
const arStateLabel = document.querySelector('#arStateLabel');
const arStateCopy = document.querySelector('#arStateCopy');
const arStateCard = document.querySelector('#arStateCard');
const enterGarden = document.querySelector('#enterGarden');
const desktopRitual = document.querySelector('#desktopRitual');
const cameraExperience = document.querySelector('#cameraExperience');
const cameraVideo = document.querySelector('#cameraVideo');
const cameraVfxLayer = document.querySelector('#cameraVfxLayer');
const cameraStatus = document.querySelector('#cameraStatus');
const cameraHint = document.querySelector('#cameraHint');
const exitGarden = document.querySelector('#exitGarden');
const modeNotice = document.querySelector('#modeNotice');
const cameraBloom = document.querySelector('#cameraBloom');
const cameraMoss = document.querySelector('#cameraMoss');
const cameraWeb = document.querySelector('#cameraWeb');

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(65, viewport.clientWidth / viewport.clientHeight, 0.01, 100);
camera.position.set(0, 1.25, 2.3);
camera.lookAt(0, 0.75, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true;
viewport.appendChild(renderer.domElement);
let renderHost = viewport;
let cameraStream = null;
let cameraHandTracker = null;
let experienceMode = 'landing';

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

  const demoHand = {
    palmPosition: new THREE.Vector3(0, 0.92, 0.36),
    quaternion: new THREE.Quaternion()
  };

  const setActiveGesture = (gesture) => {
    document.body.classList.add('ritual-active');
    document.querySelectorAll('.gesture-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.gesture === gesture);
    });
    cameraStatus.textContent = getGestureStatus(gesture);
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
    await handleEnterARGarden();
  });

  desktopRitual.addEventListener('click', () => {
    burst(desktopRitual);
    runDesktopRitual(skills, demoHand, setExperienceMode);
  });

  cameraBloom.addEventListener('click', () => {
    setActiveGesture('bloom');
    skills.invoke('palm-open-bloom', demoHand, true);
  });

  cameraMoss.addEventListener('click', () => {
    setActiveGesture('moss');
    skills.invoke('finger-tap-moss-ripple', new THREE.Vector3(0.08, 0.04, 0.28));
  });

  cameraWeb.addEventListener('click', () => {
    setActiveGesture('web');
    const leftPalm = new THREE.Vector3(-0.38, 0.86, 0.28);
    const rightPalm = new THREE.Vector3(0.38, 0.88, 0.28);
    skills.invoke('two-hand-mycelium-stretch', leftPalm, rightPalm, leftPalm.distanceTo(rightPalm));
  });

  exitGarden.addEventListener('click', () => {
    stopCameraExperience();
    setRenderHost(viewport);
    setExperienceMode('landing');
    status.textContent = arSupported
      ? 'Camera Gesture Mode 已退出；WebXR AR 可作为增强模式使用'
      : 'Camera Gesture Mode 已退出；可继续使用桌面演示模式';
  });

  window.addEventListener('pagehide', stopCameraExperience);
  window.addEventListener('beforeunload', stopCameraExperience);

  async function handleEnterARGarden() {
    setExperienceMode('checking-camera');
    clearModeNotice();
    status.textContent = '正在请求摄像头权限，准备进入 Camera Gesture Mode';
    cameraStatus.textContent = 'Checking Camera / 正在请求摄像头权限';
    cameraHint.textContent = 'Safari / Chrome / Edge 会优先进入实时摄像头模式，WebXR 只作为增强能力。';

    try {
      const stream = await requestCameraStream();
      await startCameraGestureExperience(stream);
    } catch (error) {
      stopCameraExperience();
      setRenderHost(viewport);
      const message = `摄像头无法启动：${error.message || error}`;
      status.textContent = `${message}，已切换到 Desktop Preview Mode`;
      showModeNotice(`${message}<br>已自动降级到桌面演示模式。`);
      setExperienceMode('camera-error');
      window.setTimeout(() => runDesktopRitual(skills, demoHand, setExperienceMode), 360);
    }
  }

  async function startCameraGestureExperience(stream) {
    stopCameraExperience();
    cameraStream = stream;
    cameraVideo.srcObject = stream;
    cameraVideo.muted = true;
    cameraVideo.playsInline = true;
    setRenderHost(cameraVfxLayer);
    setExperienceMode('camera-gesture');
    document.body.classList.add('ritual-active');

    await waitForVideo(cameraVideo);
    await cameraVideo.play();

    resizeRendererToHost();
    status.textContent = 'Camera Active / 摄像头已开启';
    cameraStatus.textContent = 'Camera Active / 摄像头已开启';
    cameraHint.textContent = '正在加载 MediaPipe Hands；若加载失败，可继续使用下方手动触发按钮。';
    arStateCard.classList.add('permission-granted');

    try {
      cameraHandTracker = await createCameraHandTracker({
        video: cameraVideo,
        skills,
        status: cameraStatus,
        onGesture: setActiveGesture
      });
      cameraHandTracker.start();
      status.textContent = 'Tracking Hands / 正在识别手势';
      cameraHint.textContent = '自动手势识别已启用：张开手掌、捏合指尖、双手拉开即可触发生态特效。';
    } catch (error) {
      cameraStatus.textContent = 'Camera Active / 摄像头已开启';
      cameraHint.textContent = `自动手势识别暂不可用：${error.message || error}。请使用下方三个按钮手动测试特效。`;
    }
  }

  function stopCameraExperience() {
    if (cameraHandTracker) {
      cameraHandTracker.stop();
      cameraHandTracker = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }

    cameraVideo.pause();
    cameraVideo.srcObject = null;
  }

  function setExperienceMode(nextMode) {
    experienceMode = nextMode;
    document.body.dataset.experience = nextMode;
    cameraExperience.hidden = nextMode !== 'camera-gesture' && nextMode !== 'checking-camera';
    document.body.classList.toggle('camera-mode', nextMode === 'camera-gesture' || nextMode === 'checking-camera');
    document.body.classList.toggle('desktop-preview-mode', nextMode === 'desktop-preview');
    document.body.classList.toggle('camera-error-mode', nextMode === 'camera-error');
  }

  function setRenderHost(host) {
    if (renderHost === host) return;
    renderHost = host;
    renderHost.appendChild(renderer.domElement);
    resizeRendererToHost();
  }

  function resizeRendererToHost() {
    const width = Math.max(1, renderHost.clientWidth || window.innerWidth);
    const height = Math.max(1, renderHost.clientHeight || window.innerHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function showModeNotice(message) {
    modeNotice.innerHTML = message;
    modeNotice.hidden = false;
    window.setTimeout(clearModeNotice, 5200);
  }

  function clearModeNotice() {
    modeNotice.hidden = true;
    modeNotice.textContent = '';
  }

  function waitForVideo(video) {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA && video.videoWidth > 0) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', handleLoaded);
        video.removeEventListener('error', handleError);
      };
      const handleLoaded = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error('摄像头视频流加载失败。'));
      };
      video.addEventListener('loadedmetadata', handleLoaded, { once: true });
      video.addEventListener('error', handleError, { once: true });
    });
  }

  function getGestureStatus(gesture) {
    if (gesture === 'bloom') return 'Palm Bloom / 掌心绽放';
    if (gesture === 'moss') return 'Moss Touch / 指尖苔痕';
    if (gesture === 'web') return 'Spore Web / 菌丝拉伸';
    return 'Tracking Hands / 正在识别手势';
  }

  if (arButton) {
    arButton.addEventListener('click', async () => {
      if (experienceMode !== 'camera-gesture') return;
      status.textContent = 'WebXR AR enhanced mode requested / 正在尝试 WebXR 增强模式';
    });
  }

  window.ecoDruidOptionalWebXR = () => {
    if (!arSupported) {
      showModeNotice('当前浏览器不支持 WebXR AR，Camera Gesture Mode 仍可使用。');
      return;
    }

    arButton.click();
  };

  window.addEventListener('resize', () => {
    resizeRendererToHost();
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
    arStateLabel.textContent = 'Camera Ready';
    arStateCopy.innerHTML = 'Enter AR Garden will open the realtime camera gesture experience. WebXR AR is available as enhanced mode.<br>进入生态花园将打开实时摄像头手势体验，WebXR AR 可作为增强模式。';
    status.textContent = 'Camera Ready，可进入实时摄像头手势体验';
    return;
  }

  arStateLabel.textContent = 'Preview Mode';
  arStateCopy.innerHTML = 'Enter AR Garden opens realtime camera mode. Desktop Preview is available without camera access.<br>进入生态花园将优先打开实时摄像头模式，桌面预览无需摄像头权限。';
  status.textContent = 'Camera Mode Ready，WebXR 不支持也可进入体验';
}

function runDesktopRitual(skills, demoHand, setExperienceMode = () => {}) {
  setExperienceMode('desktop-preview');
  document.body.classList.add('ritual-active');
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
