# 🌿 Eco-Druid Synesthesia

<p align="center">
  <strong>Botanical mimicry and blooming AR gesture effects</strong>
</p>

<p align="center">
  <a href="./README_ZH.md">中文</a> · <a href="./README.md">English</a>
</p>

<p align="center">
  <img src="./docs/landing-preview.png" alt="Eco-Druid Synesthesia Landing Preview" width="880" />
</p>

<p align="center">
  <strong>Awaken a flower in your palm. Seed moss with your fingertip. Stretch a living spore web between your hands.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WebXR-AR%20Gesture-7EF6E7?style=for-the-badge" alt="WebXR AR Gesture" />
  <img src="https://img.shields.io/badge/Three.js-Interactive%203D-0D241E?style=for-the-badge" alt="Three.js Interactive 3D" />
  <img src="https://img.shields.io/badge/WebXR%20Hand-Input-A8F5C8?style=for-the-badge" alt="WebXR Hand Input" />
  <img src="https://img.shields.io/badge/Original%20Concept-Eco--Druid-F7D774?style=for-the-badge" alt="Original Concept Eco-Druid" />
</p>

---

## ✨ Overview

**Eco-Druid Synesthesia** is an original WebXR / AR gesture interaction experiment. It translates hand movement into living botanical feedback: a glowing bud blooming in the palm, fingertip moss and ripple marks growing in space, and a breathing spore-mycelium web stretched between two hands.

Instead of following the common cyber-neon HUD style, mechanical gesture interface, or short-video filter logic, this project explores a softer and more narrative AR interaction language. It combines browser-based camera input, gesture interaction, 3D graphics, and botanical growth metaphors into a lightweight digital plant ritual.

The project does not require a local AI runtime. Gesture recognition, segmentation, and visual processing are handled through browser-side components. After starting the local development server, open the page in a browser to experience camera-based gesture interaction, desktop preview mode, and botanical AR effects.

## 🌱 Core Interactions

| Gesture | Name | Visual Feedback |
| --- | --- | --- |
| Open palm | Palm Bloom | A glowing flower bud appears in the palm and releases soft pollen particles |
| Fingertip pinch / touch | Moss Touch | Moss grows from the fingertip and spreads with ripple shaders |
| Hands pull apart | Spore Web | A Bezier mycelium network forms between the hands with flowing spore particles |

The project provides two experience paths:

| Mode | Description |
| --- | --- |
| AR Mode | Uses a WebXR-compatible mobile browser and camera for real AR gesture interaction |
| Preview Mode | Uses desktop preview buttons to simulate the three botanical gesture effects for demonstration and testing |

## 🛠️ Tech Stack

| Module | Technology |
| --- | --- |
| App Framework | Vite |
| 3D Rendering | Three.js |
| AR Capability | WebXR |
| Hand Input | WebXR Hand Input / browser-side gesture recognition |
| Visual Effects | Particles, shaders, ripples, Bezier curves, botanical motion |
| Runtime | Node.js 18+ |
| Supported Platforms | Windows / macOS / Linux |

## 🚀 Quick Start

### 1. Install Node.js

Install Node.js `18.x` or later.

Check your versions:

```bash
node --version
npm --version
```

### 2. Clone the Repository

```bash
git clone git@github.com:Beverly621/biolume-ar-gesture.git
cd biolume-ar-gesture
```

You can also click `Code` on the GitHub page and choose `Download ZIP`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Project

```bash
npm start
```

Default local URL:

```text
http://localhost:5173/
```

If port `5173` is already in use, choose another port:

```bash
npm start -- --port 5174
```

Then open:

```text
http://localhost:5174/
```

## 💻 Usage

### Desktop Preview Mode

Open the page in a desktop browser and use the preview controls in the `Gesture Dock` to experience the three botanical gesture effects. This mode does not require a real AR environment and is suitable for demos, screenshots, and basic interaction testing.

### Mobile AR Mode

Open the page in a WebXR-compatible mobile browser, click `Enter AR Garden`, and allow camera permission. After permission is granted, you can enter the AR gesture experience.

Before entering AR, make sure:

1. Your browser supports WebXR;
2. The page is served through `localhost` or HTTPS;
3. Camera permission is enabled;
4. Your hands are fully visible in the camera frame;
5. Browser-side models and resources can load correctly.

## ❓ FAQ

### Q1: Can I open `index.html` directly?

Not recommended. Camera permissions, WebXR, WASM resources, and browser-side model loading may be unstable under the `file://` protocol. Use:

```bash
npm start
```

Then open `http://localhost:5173/`.

### Q2: Why does the page enter Preview Mode automatically?

This usually means the current device or browser does not support WebXR, or the page is not running in a secure HTTPS / localhost context. Preview Mode is provided so that the core visual effects can still be experienced.

### Q3: What should I do if the camera does not open?

Check the following:

1. The page is opened from `http://localhost:<port>/` or HTTPS;
2. Camera permission is allowed in the browser address bar;
3. System privacy settings allow the browser to access the camera;
4. The camera is not being used by another application;
5. The browser supports the required WebXR / camera capabilities.

### Q4: What if gestures are not detected?

Make sure your hands are fully visible in the camera frame and that the lighting is clear. Browser and device support for WebXR Hand Input may vary. If real hand input is not available, use Desktop Preview Mode to experience the three effects.

### Q5: What if the visual effects load slowly?

Browser-side models, Three.js scenes, and related resources may take some time to load. Try refreshing the page, changing the network environment, or waiting until all resources are ready before interacting.

## 📄 License

This project is released under the MIT License. You may study, modify, and build upon it while respecting the license and attribution requirements.

## 🌿 Originality & Reuse Notice

The project name, visual system, interaction narrative, botanical gesture mechanisms, page structure, and front-end implementation in this repository were redesigned and developed by the project author as the original derivative work of **Eco-Druid Synesthesia**.

The project was initially inspired by public AR gesture-filter directions, but this repository does not copy code from any non-open-source repository and does not include third-party private assets. Its core expression is not a cyber HUD or a traditional overlay filter; it is an independent interaction concept built around botanical mimicry, organic life-like motion, fluid ripples, and dynamic mycelium networks.

If you modify, demonstrate, distribute, or open-source a derivative version based on this project, please keep the following attribution:

```text
Original project: Eco-Druid Synesthesia
Repository: https://github.com/Beverly621/biolume-ar-gesture
Original author: Beverly / @kimbeverly629
```

If you publish a derivative version, clearly state that your version is based on this project and include the original repository URL and original author information.
