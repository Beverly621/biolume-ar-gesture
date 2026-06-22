# Eco-Druid Synesthesia 开发技术文档

文档存放目标路径：`/Users/beverlykim/1-use/5-biolume/BIOLUME_AR_GESTURE_TECHNICAL_GUIDE.md`

当前项目名称：`biolume-ar-gesture`

视觉入口版本：`Eco-Druid Synesthesia / 生态德鲁伊：植物拟态与绽放`

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

3. 在入口页使用沉浸式 `Gesture Dock` 和 CTA 校验核心逻辑：

- `Enter AR Garden / 进入生态花园`：先调用浏览器 `navigator.mediaDevices.getUserMedia` 完成摄像头授权预检；若浏览器支持 WebXR AR，则继续进入 AR session。
- `Launch Desktop Ritual / 启动桌面演示`：不进入 AR，按顺序触发掌心绽放、指尖苔痕和菌丝拉伸。
- `Palm Bloom / 掌心绽放`：调用 `handlePalmOpen(hand, true)`，花朵 0.5s 放大，100 个粒子 2s 消散。
- `Moss Touch / 指尖苔痕`：调用 `handleFingerTap(tipPosition)`，苔藓实例 0.3s 淡入，并扩散水波纹 Shader。
- `Spore Web / 菌丝拉伸`：调用 `handleTwoHandStretch(leftPalm, rightPalm, distance)`，双手距离大于 15cm 时生成 5 条三维贝塞尔菌丝流。

4. 真机 AR 校验：

- 使用支持 WebXR AR 与 HTTPS/安全上下文的 Android Chrome 或兼容浏览器。
- 页面会创建 Three.js `ARButton`，可请求 `hit-test`，并将 `hand-tracking` 作为可选能力。
- AR session 中会读取 `XRHand` 关节：掌心张开触发花朵，食指与拇指捏合触发指尖苔痕，双手掌心距离大于 15cm 触发菌丝拉伸。
- 若设备不支持手势追踪，可先使用页面演示按钮验证 VFX 管线。

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

## 2. 项目使用完整技术栈清单

- 前端框架与构建：Vite 5。
- UI 层：原生 HTML/CSS/JavaScript，沉浸式双语入口页 `EcoDruidLanding`。
- 图形渲染：Three.js 0.166。
- AR 能力：WebXR，Three.js `ARButton`。
- 摄像头权限：用户点击 CTA 后调用 `navigator.mediaDevices.getUserMedia` 做授权预检，真实 AR 相机画面由 WebXR session 接管。
- 手势输入：WebXR Hand Input joints，读取 wrist、thumb-tip、index-finger-tip 等关节。
- Shader：WebGL GLSL，自定义 `ShaderMaterial`。
- 粒子系统：`THREE.Points` + 自定义 vertex/fragment shader。
- 苔藓实例：`THREE.InstancedMesh` + `instanceOpacity` 自定义实例属性。
- 贝塞尔曲线：`THREE.CubicBezierCurve3`。
- 噪声：Three.js `ImprovedNoise`，用于菌丝曲线扰动与粒子漂移。
- 资产来源：`/Users/beverlykim/1-use/5-biolume/eco_druid_assets`。
- 运行时资产目录：`/Users/beverlykim/3-program-v2/biolume-ar-gesture/public/assets/eco_druid_assets`。
- UI 复刻背景资产：`/Users/beverlykim/3-program-v2/biolume-ar-gesture/public/assets/ui/eco-druid-reference.png`，来自 `/Users/beverlykim/1-use/5-biolume/2.png`，用于入口页首屏完全复刻视觉。
- UI 种子资产：`/Users/beverlykim/3-program-v2/biolume-ar-gesture/public/assets/ui/eco-seed.png`，由 `/Users/beverlykim/1-use/5-biolume/2.png` 裁切生成，保留给后续非复刻式动态入口使用。
- 打包输出目录：`/Users/beverlykim/3-program-v2/biolume-ar-gesture/dist`。
- Git 协议：SSH。
- Git 仓库：`git@github.com:Beverly621/biolume-ar-gesture.git`。
- 本地开发端口：`5174`。
- SSH 端口：`443`。
- 环境变量文件：`/Users/beverlykim/1-use/5-biolume/.env`。

## 2.1 UI 模块结构

- `AmbientBackground`：通过 CSS 深绿到墨蓝渐变、流动雾气、藤蔓暗影和 28 个漂浮孢子构成氛围背景。
- `HeroCopy`：中英文分层标题、副标题和诗意说明，中文主标题占主视觉，英文退为辅助层级。
- `ImmersiveViewport`：承载透明 Three.js/WebXR canvas、无边界柔和网格地面、苔藓光斑、图像种子与 AR Ready / Preview Mode 状态。
- `GestureDock`：更轻的玻璃拟态悬浮手势选择面板，包含 Palm Bloom、Moss Touch、Spore Web 三个生态符文卡片；active 状态使用左侧柔光竖线而非厚重整块描边。
- `FooterHint`：浏览器兼容、摄像头权限和桌面预览提示。

## 2.2 本次视觉重构记录

- 按用户最新要求撤回上一版偏移布局，改为完全复刻 `/Users/beverlykim/1-use/5-biolume/2.png`。
- `2.png` 已复制为 `public/assets/ui/eco-druid-reference.png` 并作为首屏视觉复刻层。
- 页面保留真实 DOM、AR/WebXR、摄像头授权、手势卡片和桌面预览事件；视觉上通过透明热区覆盖在复刻图对应位置。
- 初始状态隐藏 Three.js canvas，以保持首屏与参考图一致；用户点击手势卡或桌面预览后添加 `ritual-active` class 并显示 VFX 层。
- README 项目截图已替换为 `docs/landing-preview.png`。

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
2. 执行 `npm run dev`，使用桌面浏览器打开 `http://localhost:5174/` 校验入口页和桌面预览。
3. 打开浏览器 DevTools，检查是否有 texture 404、WebGL shader compile error 或 CORS 报错。
4. 点击 `Enter AR Garden`，确认浏览器会弹出摄像头权限授权；桌面端不支持 WebXR AR 时会保留在 Preview Mode。
5. 点击 `Launch Desktop Ritual`，确认三组桌面预览特效会按顺序触发。
6. 执行 `npm run build`，确认生产构建通过。
7. 真机 WebXR 调试时优先确认 HTTPS、安全上下文、浏览器 WebXR flags 与设备 ARCore 支持状态。

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

上传前必须执行：

```bash
git status --short
```

若看到 `.env` 或任何密钥文件，必须移出源码目录后再提交。

### 4.3 异常排查

- 依赖安装失败：确认 Node.js >= 18.18，npm 可访问 registry。
- 素材缺失：确认 `/Users/beverlykim/1-use/5-biolume/eco_druid_assets` 存在并包含四个素材目录。
- 水波纹贴图 404：补充 `ripple_normal.png`，或保留现有 `water_ripple_normal_map_preview.jpg` 回退文件。
- WebXR 按钮不可用：确认浏览器、设备与安全上下文支持 WebXR AR。
- SSH 推送失败：确认 GitHub SSH Key 已配置，并使用 `ssh -p 443` 可连接 GitHub。

## 核心源码入口

- `src/EcoDruidVFXManager.js`：核心 Three.js/WebXR 手势 VFX 管理类。
- `src/skills/skillRegistry.js`：前端技能模块注册与运行时校验。
- `src/xrHandGestures.js`：摄像头授权预检与 WebXR Hand Input 手势映射。
- `src/main.js`：沉浸式入口页结构、场景初始化、ARButton、CTA 与渲染循环。
- `src/styles.css`：Eco-Druid Synesthesia 入口页视觉复刻层、透明交互热区、WebXR/Three.js VFX reveal 状态。
- `public/assets/ui/eco-druid-reference.png`：入口页首屏完整视觉复刻背景。
- `public/assets/ui/eco-seed.png`：入口页中央沉睡发光种子图像资产。
- `scripts/ensure-environment.mjs`：依赖、素材、外部 `.env`、Git remote 初始化。
- `scripts/sync-assets.mjs`：素材同步。
- `scripts/deploy-ssh.mjs`：先构建校验，再通过 SSH 443 推送。
