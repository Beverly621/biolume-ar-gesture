# Eco-Druid Synesthesia 开发技术文档

文档存放目标路径：`/Users/beverlykim/1-use/5-biolume/BIOLUME_AR_GESTURE_TECHNICAL_GUIDE.md`

当前项目名称：`biolume-ar-gesture`

视觉入口版本：`Eco-Druid Synesthesia / 生态德鲁伊 V2：夜光森林与植物拟态手势`

## 1. 项目整体操作步骤说明书

### 1.1 项目启动

1. 进入项目目录：

```bash
cd /Users/beverlykim/3-program-v2/biolume-ar-gesture
```

2. 初始化环境、依赖、素材与 Git SSH remote：

```bash
npm run setup
```

该命令会自动完成：

- 检测 Node.js 与 npm 版本。
- 检测并安装 `three`、`vite` 等依赖。
- 从 `/Users/beverlykim/1-use/5-biolume/eco_druid_assets` 同步运行时素材到 `public/assets/eco_druid_assets`。
- 创建外部环境变量文件 `/Users/beverlykim/1-use/5-biolume/.env`，不会在项目源码目录创建 `.env`。
- 初始化 Git 仓库，并将 `origin` 固定为 `git@github.com:Beverly621/biolume-ar-gesture.git`。

### 1.2 技能加载与本地运行校验

1. 启动本地开发服务：

```bash
npm run dev
```

2. 浏览器打开 Vite 输出的本地地址，本项目默认端口为：

```text
http://localhost:5174
```

5173 已保留给其他项目，本项目不占用该端口。

```text
http://localhost:5174
```

3. 在入口页使用沉浸式 `Gesture Dock`、Camera Gesture Mode 和 CTA 校验核心逻辑：

- `Enter AR Garden / 进入生态花园`：优先进入 Camera Gesture Mode，调用 `navigator.mediaDevices.getUserMedia` 请求摄像头权限，将实时 `MediaStream` 绑定到 `video.srcObject`，并在视频层上叠加 Three.js 植物特效。
- `Camera Gesture Mode / 实时摄像头手势模式`：视频元素使用 `autoplay`、`muted`、`playsInline`；摄像头启动后尝试从 `cdn.jsdelivr.net` 动态加载 MediaPipe Hands，并通过 `handsModel.send({ image: video })` 在视频帧上执行手势识别。
- `Exit Garden / 退出生态花园`：停止 MediaPipe 帧循环，并执行 `cameraStream.getTracks().forEach(track => track.stop())` 关闭摄像头。
- `Palm Bloom / 掌心绽放`：调用 `handlePalmOpen(hand, isOpening)`，实时读取 `openingRatio`，手掌张开时花朵按比例盛放，收拢时同步闭合；无手势时不显示互动素材。
- `Moss Touch / 指尖生境`：调用 `handleFingerTap(tipPosition)`，在指尖位置生成独立生命周期的荧光植物生境，高亮停留约 1 秒后快速消失。
- `Mycelium Stretch / 菌丝牵引`：调用 `handleTwoHandStretch(leftPalm, rightPalm, distance)`，双手距离大于 15cm 时生成彩色菌丝枝、花点节点与孢子流。

4. 真机与浏览器校验：

- Safari、Chrome、Edge 等普通浏览器优先进入 Camera Gesture Mode，不再因为 WebXR 不支持而阻塞体验。
- 页面必须通过 `localhost` 或 HTTPS 访问，摄像头请求必须由用户点击 `Enter AR Garden` 触发。
- 如果 MediaPipe Hands 加载失败或网络不可用，页面会保留实时摄像头画面与手动特效触发按钮，不进入白屏。
- 如果摄像头权限失败，页面只显示明确错误提示，不再自动加载桌面演示素材。
- 支持 WebXR AR 的浏览器仍会创建 Three.js `ARButton`，可请求 `hit-test`，并将 `hand-tracking` 作为可选增强能力。
- AR session 中会读取 `XRHand` 关节：掌心张开触发花朵，食指与拇指捏合触发指尖生境，双手掌心距离大于 15cm 触发菌丝牵引。
- 若设备不支持 WebXR 或 WebXR Hand Input，可使用 Camera Gesture Mode 或页面演示按钮验证 VFX 管线。

### 1.3 打包

项目打包输出目录固定为：

```text
/Users/beverlykim/3-program-v2/biolume-ar-gesture/dist
```

执行：

```bash
npm run build
```

打包前会先执行 `npm run setup`，确保依赖、素材、外部 `.env`、Git remote 均符合规范。

### 1.4 SSH 上传

仓库地址固定为：

```text
git@github.com:Beverly621/biolume-ar-gesture.git
```

SSH 固定官方端口：

```text
443
```

执行自动化部署脚本：

```bash
npm run deploy:ssh
```

部署脚本执行顺序：

1. 检查项目源码目录内是否误放 `.env`，如存在则立即中止。
2. 执行 `npm run build`，保证先本地校验可打包。
3. 初始化或修正 Git remote 为 SSH 地址。
4. 使用 `GIT_SSH_COMMAND="ssh -p 443"` 提交并推送当前分支。

### 1.5 GitHub Actions 自动打包 Release

本项目新增云端自动打包工作流：

```text
.github/workflows/release-build.yml
```

触发方式：

- 推送 `v*` 版本标签，例如 `v1.0.0`。
- 在 GitHub 网页手动进入 `Actions -> Auto Build Release Zip -> Run workflow`。

本地创建版本标签并推送：

```bash
git tag v1.0.0
GIT_SSH_COMMAND="ssh -p 443" git push origin v1.0.0
```

GitHub Actions 会自动执行：

1. 拉取仓库代码。
2. 使用 Node.js 20。
3. 执行 `npm run setup`，在 GitHub Actions 环境中跳过本机外部 `.env` 创建，并使用仓库内运行时素材。
4. 执行 `npm run build`，先验证生产构建可通过。
5. 生成纯净源码压缩包 `biolume-ar-gesture-${{ github.ref_name }}.zip`。
6. 通过仓库内置 `GITHUB_TOKEN` 创建 Release 并挂载 zip 附件。

固定下载路径：

```text
https://github.com/Beverly621/biolume-ar-gesture/releases/download/v1.0.0/biolume-ar-gesture-v1.0.0.zip
```

历史版本页面：

```text
https://github.com/Beverly621/biolume-ar-gesture/releases
```

压缩包会自动排除：

- `node_modules/`
- `.git/`
- `.github/workflows/`
- `dist/`
- `*.log`
- `.DS_Store`
- `.env`、`.env.*`、`env/`
- `*example*`

## 2. 项目使用完整技术栈清单

- 前端框架与构建：Vite 5。
- UI 层：原生 HTML/CSS/JavaScript，沉浸式双语入口页 `EcoDruidLanding`，V2 采用夜光森林背景、右侧拉长 Gesture Dock、底部摄像头权限提示与 @Beverly 署名。
- 图形渲染：Three.js 0.166。
- 主体验：Camera Gesture Mode，使用实时摄像头视频与 Three.js 透明特效层叠加。
- 摄像头权限：用户点击 CTA 后调用 `navigator.mediaDevices.getUserMedia`，将返回的 `MediaStream` 绑定到 `video.srcObject`；退出体验时停止全部 track。
- 手势输入：MediaPipe Hands 浏览器端动态加载与视频帧识别；WebXR Hand Input joints 作为可选增强，读取 wrist、thumb-tip、index-finger-tip 等关节。
- AR 能力：WebXR 与 Three.js `ARButton` 保留为可选增强，不再作为主入口依赖。
- Shader：WebGL GLSL，自定义 `ShaderMaterial`，保留粒子与菌丝流动逻辑。
- 粒子系统：`THREE.Points` + 自定义 vertex/fragment shader。
- 苔藓/植物生境：透明 PNG sprite、光晕 sprite、粒子对象池与独立生命周期数组。
- 贝塞尔曲线：`THREE.CubicBezierCurve3`。
- 噪声：Three.js `ImprovedNoise`，用于菌丝曲线扰动与粒子漂移。
- 资产来源：`/Users/beverlykim/1-use/5-biolume/eco_druid_assets` 与本次提供的抠图素材目录 `/Users/beverlykim/1-use/5-biolume/sucai/yi `。
- 运行时资产目录：`/Users/beverlykim/3-program-v2/biolume-ar-gesture/public/assets/eco_druid_assets`。
- V2 视觉资产目录：`/Users/beverlykim/3-program-v2/biolume-ar-gesture/public/assets/eco-vfx`，包含夜光森林背景、半透明百合、苔藓植株、菌丝枝与边框植物 PNG。
- 统一资产入口：`src/assetManifest.js`，集中维护 `backgroundForest`、`glowingLily`、`mossCluster`、`myceliumBranch`、`borderPlants`、`leafGlow` 等路径，避免视觉素材散落在组件中。
- 打包输出目录：`/Users/beverlykim/3-program-v2/biolume-ar-gesture/dist`。
- Release 自动化：GitHub Actions，工作流文件 `.github/workflows/release-build.yml`。
- Release 附件：`biolume-ar-gesture-${{ github.ref_name }}.zip`，由 tag 或网页手动触发生成。
- Git 协议：SSH。
- Git 仓库：`git@github.com:Beverly621/biolume-ar-gesture.git`。
- 本地开发端口：`5174`。
- SSH 端口：`443`。
- 环境变量文件：`/Users/beverlykim/1-use/5-biolume/.env`。
- README 双语结构：`README.md` 为英文版，`README_ZH.md` 为中文版；两者需保持功能、运行方式、限制说明一致。

## 2.0 下载路径与发布入口

- 最新版示例压缩包：`https://github.com/Beverly621/biolume-ar-gesture/releases/download/v1.0.0/biolume-ar-gesture-v1.0.0.zip`
- 历史版本页面：`https://github.com/Beverly621/biolume-ar-gesture/releases`
- 工作流入口：GitHub 仓库 `Actions -> Auto Build Release Zip`。
- 手动触发：点击 `Run workflow`。
- 自动触发：推送 `v*` 标签。

## 2.1 UI 模块结构

- `AmbientBackground`：通过夜光森林背景图、12 层荧光植物 PNG、流动雾气和 42 个漂浮孢子构成入口页氛围。
- `HeroCopy`：中英文分层标题、副标题和诗意说明；`@Beverly` 署名移动到副标题右侧箭头标注区域附近。
- `ImmersiveViewport`：承载入口页预览层与可移动的透明 Three.js canvas；进入 Camera Gesture Mode 后 renderer canvas 会挂载到摄像头视频上方作为特效 overlay。
- `GestureDock`：右侧拉长并右移的玻璃拟态导航 Dock，包含 Palm Bloom、Moss Touch、Mycelium Stretch 三个生态符文卡片，以及唯一入口 `Enter AR Garden`。
- `CameraGestureExperience`：包含实时 `video`、Three.js VFX overlay、左上轻量状态栏、底部三手势 Dock、右上 `Exit Garden` 和 `made by @Beverly`。
- `FooterHint`：首页底部摄像头权限提示，保留但不作为遮挡画面的说明卡片。

## 2.2 V2 视觉重构记录

- 本次 V2 不再使用单张复刻截图作为主视觉，而是使用真实 DOM、透明 PNG 植物、森林背景、雾气、粒子和 Three.js overlay 组合出可维护的夜光森林入口。
- 首页删除中央 `Preview Mode` 说明卡片，恢复底部摄像头权限提示，避免遮挡中央荧光花。
- 右侧 `Gesture Dock` 按用户标注拉长并右移，保持轻量玻璃拟态，减少对背景植物的遮挡。
- `@Beverly` 署名从页面底部移动到副标题右侧标注区域附近，视觉上更接近作品信息而非页脚版权。
- 进入生态花园页面保留左上状态栏和底部三手势按钮，但缩小尺寸，降低背景面积，避免遮挡摄像头主体画面。
- `Exit Garden / 退出生态花园` 固定于右上角小型胶囊按钮。
- `Palm Bloom` 从简化模型升级为半透明荧光百合 sprite、花蕊核心和花粉粒子。
- `Moss Touch` 从水纹主视觉改为多株独立生命周期的荧光植物生境。
- `Mycelium Stretch` 从细线孢子网升级为彩色菌丝枝、分叉和花点节点。
- V2.1 删除 `Watch Desktop Preview` 与自动 `runDesktopRitual` fallback；互动素材必须由真实手势识别触发，底部三按钮仅作为手势模式指引和 active 状态提示。
- V2.1 将无贴图 Sprite 光晕替换为径向渐隐 CanvasTexture，交互 PNG 由 AdditiveBlending 改为 NormalBlending + alphaTest，解决过曝光与图像四角显形问题。
- V2.1 压暗并缩小 AR 花园四周静态植物边框，隐藏标注区域中过大的四朵装饰花；只有 Palm Bloom、Moss Touch、Mycelium Stretch 等交互素材保留更明显的发光表现。
- 摄像头或 MediaPipe 不可用时，页面保留明确状态提示；不会自动展示交互素材。

## 3. 跨 Windows 适配改造完整开发过程记录

### 3.1 路径差异

当前规范要求使用 macOS 绝对路径：

```text
/Users/beverlykim/1-use/5-biolume/eco_druid_assets
/Users/beverlykim/3-program-v2/biolume-ar-gesture
```

Windows 环境没有该路径格式，因此工程采用两层策略：

1. `scripts/sync-assets.mjs` 将外部素材复制到项目内 `public/assets/eco_druid_assets`。
2. 浏览器运行时代码只访问 `/assets/eco_druid_assets`，避免前端直接依赖本机绝对路径。
3. GitHub Actions 环境没有本机 `/Users/...` 素材路径时，`npm run setup` 会使用仓库内已同步的 `public/assets/eco_druid_assets`，从而保证云端 Release 打包不依赖本机目录。
4. Camera Gesture Mode 使用浏览器标准 `getUserMedia` 与 `video` 元素，Windows、macOS、Linux 的差异主要来自浏览器摄像头权限和系统隐私设置。

迁移到 Windows 时，仅需在脚本中将源素材目录替换为同等含义的 Windows 路径；前端运行时路径不用变。

### 3.2 Shell 与环境变量差异

macOS/Linux 可使用：

```bash
GIT_SSH_COMMAND="ssh -p 443" git push
```

Windows PowerShell 可使用：

```powershell
$env:GIT_SSH_COMMAND="ssh -p 443"
git push
```

本项目通过 Node.js `spawnSync` 的 `env` 参数设置 `GIT_SSH_COMMAND`，避免依赖 Bash 语法，因此更容易跨平台。

### 3.3 文件权限差异

macOS 可以用 `mode: 0o600` 创建外部 `.env`。Windows 对 POSIX mode 支持有限，但 Node.js 会尽力应用权限；安全策略仍然以“不放入项目目录、不提交仓库”为主。

### 3.4 纹理资源差异

设计指定主贴图来源为：

```text
/Users/beverlykim/1-use/5-biolume/ripple_normal.png
```

规范运行目录中的主贴图为：

```text
03_water_ripple_textures/ripple_normal.png
```

如果规范运行目录中的主贴图不存在，代码会回退到当前素材目录内的 preview 文件：

```text
03_water_ripple_textures/water_ripple_normal_map_preview.jpg
```

当前已将用户指定 PNG 安装到 `eco_druid_assets/03_water_ripple_textures/ripple_normal.png`，运行时代码会优先加载它。

### 3.5 调试流程

1. 执行 `npm run setup`，确认依赖与素材同步成功。
2. 执行 `npm run dev` 或 `npm start`，使用桌面浏览器打开 `http://localhost:5174/` 校验入口页、Camera Gesture Mode 和摄像头权限提示。
3. 打开浏览器 DevTools，检查是否有 texture 404、WebGL shader compile error 或 CORS 报错。
4. 点击 `Enter AR Garden`，确认浏览器会弹出摄像头权限授权；授权成功后应显示实时摄像头画面与 Three.js 特效 overlay。
5. 观察状态面板：MediaPipe Hands 加载成功时显示 Tracking Hands；加载失败时显示原因并保留下方三个手动特效按钮。
6. 点击 `Exit Garden`，确认摄像头关闭；浏览器地址栏或系统摄像头指示灯应停止显示占用。
7. 在 Camera Gesture Mode 中进行真实手势测试：张开手掌控制 Palm Bloom，指尖捏合/轻触生成 Moss Touch，双手拉开触发 Mycelium Stretch。
8. 执行 `npm run build`，确认生产构建通过。
9. 推送版本标签前执行 `git status --short --ignored`，确认只有需要提交的源码、文档、图片和工作流文件被跟踪。
10. 真机 WebXR 调试时优先确认 HTTPS、安全上下文、浏览器 WebXR flags 与设备 ARCore 支持状态；WebXR 仅作为增强模式。

## 4. 环境配置与安全说明

### 4.1 `.env` 使用规范

`.env` 必须存放在：

```text
/Users/beverlykim/1-use/5-biolume/.env
```

禁止放入：

```text
/Users/beverlykim/3-program-v2/biolume-ar-gesture/.env
```

第三方 API Key、接口地址、访问参数必须通过 `process.env` 或 Vite 的 `import.meta.env` 注入。当前代码只保留了 `VITE_BIOLUME_API_ENDPOINT` 占位入口，没有硬编码任何密钥。

### 4.2 仓库上传注意事项

`.gitignore` 已过滤：

- 隐藏文件。
- `.gitignore` 本身。
- `.env`、`.env.*`、`env/`。
- `example`、`examples` 与相关示例文件。
- `node_modules/`、`dist/`、日志和临时目录。

唯一允许提交的隐藏目录例外是：

```text
.github/workflows/release-build.yml
```

该文件是 GitHub Actions 自动打包 Release 的必要入口；提交时需使用显式路径或 `git add -f .github/workflows/release-build.yml`，不要放宽 `.gitignore` 的隐藏文件过滤规则。

上传前必须执行：

```bash
git status --short
```

若看到 `.env` 或任何密钥文件，必须移出源码目录后再提交。

### 4.3 异常排查

- 依赖安装失败：确认 Node.js >= 18.18，npm 可访问 registry。
- 素材缺失：确认 `/Users/beverlykim/1-use/5-biolume/eco_druid_assets` 存在并包含四个素材目录。
- GitHub Actions 打包失败：确认 `public/assets/eco_druid_assets` 已在仓库中，且 `scripts/ensure-environment.mjs` 没有强制依赖本机 `/Users/...` 目录。
- 水波纹贴图 404：V2 的 `Moss Touch` 已不再以水纹作为主视觉，但保留 `ripple_normal.png` 兼容旧 Shader；如旧效果仍需启用，补充该贴图或保留回退文件。
- 摄像头无法启动：确认页面运行在 `localhost` 或 HTTPS，浏览器地址栏已允许摄像头权限，系统隐私设置允许当前浏览器访问摄像头，且摄像头没有被其他应用占用。
- MediaPipe Hands 加载失败：确认网络可访问 `https://cdn.jsdelivr.net/npm/@mediapipe/hands`；当前版本不再自动降级到桌面预览，需恢复摄像头/手势识别后才显示交互素材。
- WebXR 按钮不可用：确认浏览器、设备与安全上下文支持 WebXR AR；该能力仅作为增强模式，不影响 Camera Gesture Mode。
- SSH 推送失败：确认 GitHub SSH Key 已配置，并使用 `ssh -p 443` 可连接 GitHub。

## 核心源码入口

- `src/EcoDruidVFXManager.js`：核心 Three.js/WebXR 手势 VFX 管理类；V2 内含半透明荧光花、植物生境、菌丝牵引、对象池和粒子更新逻辑。
- `src/assetManifest.js`：V2 视觉资产统一映射，集中管理夜光森林背景、荧光百合、苔藓植物、菌丝枝和花园边框植物。
- `src/skills/skillRegistry.js`：前端技能模块注册与运行时校验。
- `src/skills/mediapipeHandRuntime.js`：Camera Gesture Mode 的 MediaPipe Hands 动态加载、视频帧识别和三种生态手势映射。
- `src/xrHandGestures.js`：`requestCameraStream` 摄像头流请求、摄像头授权预检与 WebXR Hand Input 手势映射。
- `src/main.js`：沉浸式入口页结构、V2 Gesture Dock、底部权限提示、Camera Gesture Mode、视频流绑定、ARButton 可选增强、CTA 与渲染循环。
- `src/styles.css`：Eco-Druid Synesthesia V2 夜光森林入口、右侧拉长 Dock、底部权限提示、花园页轻量 HUD、全屏视频与 Three.js VFX overlay 状态。
- `public/assets/eco-vfx/`：V2 夜光森林和抠图荧光植物资产目录。
- `public/assets/ui/eco-seed.png`：历史 UI 种子图像资产，当前 V2 首屏优先使用 `eco-vfx/glowing-lily.png`。
- `scripts/ensure-environment.mjs`：依赖、素材、外部 `.env`、Git remote 初始化。
- `scripts/sync-assets.mjs`：素材同步。
- `scripts/deploy-ssh.mjs`：先构建校验，再通过 SSH 443 推送。
- `.github/workflows/release-build.yml`：推送 `v*` 标签或网页手动触发后自动生成 GitHub Release zip 附件。
