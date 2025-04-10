# ETerm: Terminal 3D/2D Graphics Engine

ETerm is a powerful 2D and 3D rendering engine for the terminal, written in TypeScript. It provides a simple API for creating and manipulating 3D and 2D graphics directly in your terminal.

## Features

- 3D and 2D primitive rendering
- Camera and perspective controls
- Z-buffering for proper depth handling
- Matrix transformations
- Vector math utilities
- Simple and intuitive API

## Primitives

- Line
- Rectangle (wireframe or filled)
- Sphere (wireframe or filled)
- Cube (wireframe or filled)

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Run the demo

```bash
npm run start
```

## Usage

```typescript
import { Engine, Cube, Vector3 } from 'eterm';

// Create an engine instance
const engine = new Engine({
    width: 80,  // Terminal width
    height: 24, // Terminal height
    backgroundColor: ' ',
    targetFPS: 30
});

// Create a cube
const cube = new Cube(
    new Vector3(0, 0, 0), // Position
    1,                    // Size
    true,                 // Wireframe mode
    '#'                   // Character to use for rendering
);

// Add the cube to the engine
engine.add(cube);

// Set the camera position
engine.setCamera(
    new Vector3(0, 0, 5), // Camera position
    new Vector3(0, 0, 0)  // Look at position
);

// Animate the cube
let angle = 0;
setInterval(() => {
    cube.setRotation(new Vector3(angle, angle, 0));
    angle += 0.05;
}, 1000 / 30);

// Start the engine
engine.start();
```

## License

ISC 