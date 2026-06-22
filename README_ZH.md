# 🌿 Eco-Druid Synesthesia / 生态德鲁伊

<p align="center">
  <strong>植物拟态与绽放 AR 手势特效</strong>
</p>

<p align="center">
  <a href="./README_ZH.md">中文</a> · <a href="./README.md">English</a>
</p>

<p align="center">
  <img src="./docs/landing-preview.png" alt="Eco-Druid Synesthesia Landing Preview" width="880" />
</p>

<p align="center">
  <strong>用手掌唤醒花朵，用指尖种下苔藓，用双手拉开一张会呼吸的孢子网。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WebXR-AR%20Gesture-7EF6E7?style=for-the-badge" alt="WebXR AR Gesture" />
  <img src="https://img.shields.io/badge/Three.js-Interactive%203D-0D241E?style=for-the-badge" alt="Three.js Interactive 3D" />
  <img src="https://img.shields.io/badge/WebXR%20Hand-Input-A8F5C8?style=for-the-badge" alt="WebXR Hand Input" />
  <img src="https://img.shields.io/badge/Original%20Concept-Eco--Druid-F7D774?style=for-the-badge" alt="Original Concept Eco-Druid" />
</p>

---

## ✨ 项目概览

**Eco-Druid Synesthesia / 生态德鲁伊** 是一个原创 WebXR / AR 手势交互实验项目。它将真实手部动作转译为具有生命感的植物拟态反馈：掌心绽放花苞、指尖种下苔藓与水纹、双手拉伸出会呼吸的孢子菌丝网络。

不同于常见的赛博霓虹 HUD、机械式手势识别界面或短视频滤镜，本项目尝试建立一种更柔和、更自然、更具叙事感的 AR 交互语言。它把浏览器、摄像头、手势输入、三维图形和植物生长意象结合在一起，让用户像进行一场轻量的数字植物仪式。

项目不需要安装本地 AI 运行环境。手势识别、人物分割与相关视觉处理由浏览器端组件完成。启动本地服务后，在浏览器中打开页面，即可体验摄像头手势识别、桌面预览模式与植物拟态 AR 特效。

## 🌱 核心交互

| 手势 | 英文名称 | 视觉反馈 |
| --- | --- | --- |
| 张开手掌 | Palm Bloom | 掌心生成发光花苞，并释放柔和花粉粒子 |
| 指尖轻触 | Moss Touch | 指尖在空间中种下苔藓，并扩散水纹波动 |
| 双手拉开 | Spore Web | 双手之间生成贝塞尔菌丝网络，并流动孢子粒子 |

项目同时提供两种体验路径：

| 模式 | 说明 |
| --- | --- |
| AR Mode | 使用兼容 WebXR 的移动浏览器和摄像头，进入真实 AR 手势体验 |
| Preview Mode | 在桌面端通过预览按钮模拟三种植物手势效果，方便展示与调试 |

## 🛠️ 技术栈

| 模块 | 技术 |
| --- | --- |
| 页面框架 | Vite |
| 图形渲染 | Three.js |
| AR 能力 | WebXR |
| 手势输入 | WebXR Hand Input / 浏览器端手势识别 |
| 视觉效果 | 粒子、Shader、水纹、贝塞尔曲线、植物拟态动效 |
| 运行环境 | Node.js 18+ |
| 支持平台 | Windows / macOS / Linux |

## 🚀 快速开始

### 1. 安装 Node.js

请先安装 Node.js `18.x` 或更高版本。

安装完成后检查版本：

```bash
node --version
npm --version
```

### 2. 克隆项目

```bash
git clone git@github.com:Beverly621/biolume-ar-gesture.git
cd biolume-ar-gesture
```

也可以在 GitHub 页面点击 `Code`，选择 `Download ZIP` 下载后解压运行。

### 3. 安装依赖

```bash
npm install
```

### 4. 启动项目

```bash
npm start
```

默认访问地址：

```text
http://localhost:5173/
```

如果 `5173` 端口被占用，可以指定其他端口：

```bash
npm start -- --port 5174
```

然后访问：

```text
http://localhost:5174/
```

## 💻 使用方式

### 桌面预览模式

在桌面浏览器中打开页面后，可以使用右侧 `Gesture Dock` 中的预览按钮体验三种植物手势效果。该模式不依赖真实 AR 环境，适合演示、截图和基础交互体验。

### 移动端 AR 模式

使用支持 WebXR 的移动浏览器打开页面，点击 `Enter AR Garden`，并允许浏览器访问摄像头。授权后即可进入 AR 手势体验。

进入 AR 前请确认：

1. 浏览器支持 WebXR；
2. 页面通过 `localhost` 或 HTTPS 访问；
3. 摄像头权限已开启；
4. 手部完整出现在摄像头画面中；
5. 当前网络可以正常加载浏览器端模型与资源。

## ❓ 常见问题

### Q1：可以直接双击打开 `index.html` 吗？

不建议。摄像头权限、WebXR、WASM 资源与浏览器端模型加载在 `file://` 本地文件协议下可能不稳定。推荐使用：

```bash
npm start
```

然后通过 `http://localhost:5173/` 访问页面。

### Q2：为什么进入页面后自动变成 Preview Mode？

通常是因为当前设备或浏览器不支持 WebXR，或者页面没有运行在 HTTPS / localhost 安全上下文中。此时系统会自动提供桌面预览模式，保证仍然可以体验核心视觉效果。

### Q3：摄像头无法打开怎么办？

请按顺序检查：

1. 访问地址是否为 `http://localhost:<端口>/` 或 HTTPS；
2. 浏览器地址栏中的摄像头权限是否允许；
3. 系统隐私设置是否允许浏览器访问摄像头；
4. 摄像头是否被其他软件占用；
5. 浏览器是否支持当前 WebXR / 摄像头能力。

### Q4：手势没有被识别怎么办？

请确保手部完整进入画面，并保持较好的光线条件。部分浏览器或设备对 WebXR Hand Input 支持程度不同，如果无法使用真实手势输入，可以切换到桌面预览模式体验三种特效。

### Q5：页面打开了，但视觉效果加载较慢怎么办？

浏览器端模型、Three.js 场景和相关资源可能需要一定加载时间。可以尝试刷新页面、更换网络环境，或等待资源加载完成后再进行交互。

## 📄 License

本项目采用 MIT License。你可以在遵守许可证与署名要求的前提下进行学习、修改和二次开发。

## 🌿 原创性与二次开源说明

本仓库中的项目命名、视觉系统、交互叙事、植物拟态手势机制、页面结构与前端实现，均由本项目作者@Beverly 设计与开发，属于 **Eco-Druid Synesthesia / 生态德鲁伊** 项目的创作内容。

当前已经查询Instagram、X、YouTube、RED、TikTok等社交平台，，本仓库没有复制任何未开源仓库代码，也不附带第三方私有资源。本项目是围绕“植物拟态、自然生命感、流体波纹、动态菌丝网络”建立的独立交互方案。

如果你基于本项目继续修改、演示、分发或二次开源，请保留以下信息：

```text
Original project: Eco-Druid Synesthesia
Repository: https://github.com/Beverly621/biolume-ar-gesture
Original author:@ Beverly621 
```

如果你发布衍生版本，请明确说明你的版本是基于本项目的二次开发，并附上原仓库地址与原作者信息。
