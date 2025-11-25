# 🌱 Grass Simulator --- Vue.js + Vite + Three.js

![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)

**Grass Simulator** is a WebGL-powered simulation that visualizes
dynamic grass movement using **three.js**, **custom shaders**, and a
modern **Vue + Vite** environment.\
This project demonstrates how real-time GPU animation, procedural
geometry, and shader-based rendering can create natural, life-like
effects directly in the browser.

------------------------------------------------------------------------

## ✨ Features

-   🌬️ **Dynamic grass animation** with wind-based motion\
-   🌾 **Procedural geometry** for each grass blade (no models
    required)\
-   ⚡ **High-performance rendering** using indexed BufferGeometry\
-   🎛️ **Customizable parameters** for wind, blade count, ground size,
    randomness, and more\
-   🧩 **Built with Vue 3 + Vite + three.js** for a fast and modern
    development experience

------------------------------------------------------------------------

## 📦 Prerequisites

Make sure you have:

-   **Node.js** v16 or higher\
-   **npm** package manager

------------------------------------------------------------------------

## 🚀 Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/DeepankarGupta13/grassSimulator.git
cd grassSimulator
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Start development server

``` bash
npm run dev
```

### 4. Build for production

``` bash
npm run build
```

------------------------------------------------------------------------

# 🌿 Procedural Grass Geometry

Grass blades are not imported --- they are generated mathematically for
efficiency and control.

## 📐 1. Vertex Height Normalization

Every vertex receives a normalized height `t`:

    t = i / ((numVertices - 1) * slimScale)

This ensures consistent mapping from bottom (0) to top (1).

------------------------------------------------------------------------

## 🌙 2. Natural Curvature via Sine Wave

A half-sine wave forms the classic grass blade curve:

    y = sin(t * slimScale * PI)

Produces a smooth vertical bend.

------------------------------------------------------------------------

## ↔️ 3. Horizontal Thickening

To avoid a paper-thin appearance:

    x = t * 0.6

A slight offset adds depth and volume.

------------------------------------------------------------------------

## 🔺 4. Triangle Construction (Indexed)

Blades are built using mirrored indices:

    i, i+1, numVertices - i - 1
    i+1, numVertices - i - 1, numVertices - i - 2

This builds a full 3D blade using efficient GPU-friendly indexing.

------------------------------------------------------------------------

# 🎨 Shader System (Animation + Color)

## 🌀 Vertex Shader: Wind Animation

Each vertex moves using a sine-wave animation based on index and time:

    float t = float(vertexIndex) / float(numVertices - 1);
    t /= slimScale;

    float wave = sin(uTime * speed + t * frequency);
    position.y += wave * amplitude;

### Why it works

-   `t` creates staggered motion\
-   `sin()` produces soft natural waves\
-   `uTime` drives continuous animation

------------------------------------------------------------------------

## 🌈 Fragment Shader: Gradient + Pulse Effect

A vertical color blend gives natural shading:

    vec3 baseColor = mix(colorA, colorB, t);

A subtle brightness pulse adds life:

    float pulse = 0.5 + 0.5 * sin(uTime + t * 3.0);
    vec3 finalColor = baseColor * pulse;

Produces glowing, lively-looking blades.

------------------------------------------------------------------------

# 🤝 Contributing

Contributions are welcome!

1.  Fork this repository\
2.  Create a new branch\
3.  Commit your changes with clear messages\
4.  Push your branch\
5.  Open a pull request

------------------------------------------------------------------------

# 📬 Contact

**Deepankar Gupta**\
GitHub: **DeepankarGupta13**\
Email: **deepankarsama@gmail.com**

------------------------------------------------------------------------

🌱 *Enjoy simulating and experimenting with dynamic grass animations!*
