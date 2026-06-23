# 🌿 Eco-Druid Synesthesia / 生态德鲁伊

<p align="center">
  <strong>植物拟态绽放手势特效</strong>
</p>

<p align="center">
  <a href="./README_ZH.md">中文</a> · <a href="./README.md">English</a>
</p>

<p align="center">
  <img src="./docs/landing-preview.png" alt="Eco-Druid Synesthesia Landing Preview" width="880" />
</p>

<p align="center">
  <strong>掌心开花，指尖生苔，菌丝随手势生长。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WebXR-AR%20Gesture-7EF6E7?style=for-the-badge" alt="WebXR AR Gesture" />
  <img src="https://img.shields.io/badge/Three.js-Interactive%203D-0D241E?style=for-the-badge" alt="Three.js Interactive 3D" />
  <img src="https://img.shields.io/badge/WebXR%20Hand-Input-A8F5C8?style=for-the-badge" alt="WebXR Hand Input" />
  <img src="https://img.shields.io/badge/Original%20Concept-Eco--Druid-F7D774?style=for-the-badge" alt="Original Concept Eco-Druid" />
</p>

---

## ✨ 项目概览

**Eco-Druid Synesthesia / 生态德鲁伊** 是一个以实时摄像头为主入口的原创 AR 手势交互实验项目。它将真实手部动作转译为具有生命感的植物拟态反馈：掌心绽放半透明荧光花朵、指尖生成苔藓生境、双手牵引出发光菌丝花枝。

不同于常见的赛博霓虹 HUD、机械式手势识别界面或短视频滤镜，本项目尝试建立一种更柔和、更自然、更具叙事感的 AR 交互语言。它把浏览器、摄像头、手势输入、三维图形和植物生长意象结合在一起，让用户像进行一场轻量的数字植物仪式。

项目不需要安装本地 AI 运行环境。当前主入口是 **Camera Gesture Mode / 实时摄像头手势模式**：点击 `Enter AR Garden / 进入生态花园` 后，页面会请求摄像头权限，在实时摄像头画面上叠加 Three.js 植物特效层，并尝试在浏览器端加载 MediaPipe Hands 进行实时手部追踪。WebXR 仅作为可选增强能力，不再是进入体验的阻塞条件。

## 🌱 核心交互

| 手势 | 英文名称 | 视觉反馈 |
| --- | --- | --- |
| 张开手掌 | Palm Bloom | 掌心生成半透明荧光花朵，并释放柔和花粉粒子 |
| 指尖轻触 | Moss Touch | 指尖在空间中生成发光苔藓生境 |
| 双手拉开 | Mycelium Stretch | 随手势牵引出发光菌丝花枝 |

项目提供两种体验路径：

| 模式 | 说明 |
| --- | --- |
| Camera Gesture Mode | 主体验。使用实时摄像头画面、Three.js 叠加特效，并在可用时加载 MediaPipe Hands |
| Optional WebXR AR Mode | 仅在浏览器支持 WebXR immersive AR 时可用；不是进入体验的必要条件 |

## 🛠️ 技术栈

| 模块 | 技术 |
| --- | --- |
| 页面框架 | Vite |
| 图形渲染 | Three.js |
| 摄像头输入 | `navigator.mediaDevices.getUserMedia`、`video.srcObject`、`autoplay`、`muted`、`playsInline` |
| 手势输入 | 浏览器端 MediaPipe Hands，WebXR Hand Input 作为可选增强 |
| AR 能力 | Camera Gesture Mode 优先，WebXR 可选增强 |
| 视觉效果 | 抠图荧光植物素材、粒子、Shader、曲线、植物拟态动效 |
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
http://localhost:5174/
```

如果 `5174` 端口被占用，可以指定其他端口：

```bash
npm start -- --port 3001
```

然后访问：

```text
http://localhost:3001/
```

## 📥 下载纯净安装包

最新版压缩包：

[biolume-ar-gesture-v1.0.1.zip](https://github.com/Beverly621/biolume-ar-gesture/releases/download/v1.0.1/biolume-ar-gesture-v1.0.1.zip)

所有历史版本：

[前往 Releases 页面](https://github.com/Beverly621/biolume-ar-gesture/releases)

## 💻 使用方式

使用 Safari、Chrome、Edge 或其他现代浏览器打开页面，点击 `Enter AR Garden / 进入生态花园`，并允许浏览器访问摄像头。授权后页面会进入实时摄像头手势模式，保留轻量状态栏、底部三手势 Dock 与植物特效层。

进入实时摄像头手势模式前请确认：

1. 页面通过 `localhost` 或 HTTPS 访问；
2. 摄像头权限已开启；
3. 手部完整出现在摄像头画面中；
4. 当前网络可以加载 `cdn.jsdelivr.net` 上的 MediaPipe Hands 资源；
5. 互动素材必须由手势触发后出现，底部手势 Dock 仅作为模式指引，不再自动演示素材。

WebXR AR 可在浏览器支持时作为增强模式使用，但不支持 WebXR 不会阻止摄像头体验启动。

进入可选 WebXR AR 前请确认：

1. 浏览器支持 WebXR immersive AR；
2. 页面通过 `localhost` 或 HTTPS 访问；
3. 摄像头权限已开启；
4. 手部完整出现在摄像头画面中；
5. 当前网络可以正常加载浏览器端资源。

## ❓ 常见问题

### Q1：可以直接双击打开 `index.html` 吗？

不建议。摄像头权限、WebXR、WASM 资源与浏览器端模型加载在 `file://` 本地文件协议下可能不稳定。推荐使用：

```bash
npm start
```

然后通过 `http://localhost:5174/` 访问页面。

### Q2：为什么进入页面后自动变成 Preview Mode？

通常是因为摄像头权限被拒绝、摄像头设备不可用、被其他应用占用，或页面没有运行在 HTTPS / localhost 安全上下文中。WebXR 支持是可选项，不是进入 Camera Gesture Mode 的前置条件。

### Q3：摄像头无法打开怎么办？

请按顺序检查：

1. 访问地址是否为 `http://localhost:<端口>/` 或 HTTPS；
2. 浏览器地址栏中的摄像头权限是否允许；
3. 系统隐私设置是否允许浏览器访问摄像头；
4. 摄像头是否被其他软件占用；
5. 浏览器是否支持 `navigator.mediaDevices.getUserMedia`。

### Q4：手势没有被识别怎么办？

请确保手部完整进入画面，并保持较好的光线条件。自动手势识别依赖从 `cdn.jsdelivr.net` 加载的 MediaPipe Hands；如果资源无法加载或追踪不稳定，请检查摄像头权限和网络后刷新页面。

### Q5：页面打开了，但视觉效果加载较慢怎么办？

浏览器端模型、Three.js 场景和相关资源可能需要一定加载时间。可以尝试刷新页面、更换网络环境，或等待资源加载完成后再进行交互。

## 📄 License

本项目采用 **GNU Affero General Public License v3.0 or later（AGPL-3.0-or-later）** 许可证开源。

**核心约束：**

- 任何人对本项目代码进行修改、衍生并部署为可通过网络访问的服务（包括 VR/AR 云端交互、WebXR 体验等），必须以同一许可证公开其完整对应源代码。
- 不得将本项目核心交互逻辑、植物拟态特效、Shader 与原创美术逻辑代码直接打包进闭源商业项目或资产商店进行二次售卖。
- 详情请参阅 [LICENSE](./LICENSE) 文件。

AGPL-3.0 适用于本仓库中的原创源代码与创作实现；第三方 SDK、运行时或素材仍遵循其各自许可证。

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

**Copyright (c) 2026 Beverly / @Beverly621. All rights reserved.**

**本项目核心交互逻辑与视觉特效由作者原创。未经授权，禁止将本项目用于任何商业用途、录制付费教程或在资产商店（如 Unity Asset Store / Unreal Marketplace）二次售卖。**
