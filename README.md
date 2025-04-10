# eterm - 3D Terminal Black Hole Simulation

![Terminal Black Hole Demo](https://i.imgur.com/XKfU8jW.png)

A stunning 3D ASCII physics-based black hole simulation that runs directly in your terminal. Watch as two black holes orbit each other following real gravitational physics, eventually colliding and flying apart with dramatic energy.

## ✨ Features

- **True 3D Rendering**: Spheres with proper lighting, shadows and perspective
- **Physics Simulation**: Accurate gravitational attraction between objects
- **Interactive Controls**: Adjust lighting parameters in real-time
- **Terminal UI**: Runs in any terminal with full keyboard controls
- **Realistic Collisions**: Watch dramatic collisions with momentum conservation
- **Orbital Trails**: Visual trails show the path of each sphere

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eterm.git
   cd eterm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## 🎮 Usage

Run the demo:
```bash
node dist/index.js
```

### Controls:

| Key | Action |
|-----|--------|
| 1/2 | Increase/Decrease light intensity |
| A/D | Move light left/right (X axis) |
| W/S | Move light up/down (Y axis) |
| Q/E | Move light in/out (Z axis) |
| R | Reset lighting to default |
| Ctrl+C | Exit |

## 🔍 How It Works

The simulation creates two 3D spheres with different masses that attract each other according to the law of universal gravitation (F = G × m₁m₂/r²). The spheres are rendered using ASCII characters with lighting and shading to create a 3D effect.

Each sphere is affected by the gravitational pull of the other, creating orbital motion. When they collide, momentum is conserved but additional energy is added to create a more dramatic visual effect.

### Rendering Engine

- Custom 3D primitive rendering system
- Depth buffer for proper 3D occlusion
- Character-based shading for lighting effects
- Split display with physics visualization and controls

### Physics System

- Custom gravitational physics
- Collision detection and response
- Momentum conservation
- Trail visualization

## 🧑‍💻 Development

### Folder Structure

```
eterm/
├── dist/             # Compiled JavaScript files
├── src/
│   ├── core/         # Core engine components
│   ├── math/         # Vector and matrix math
│   ├── primitives/   # 3D primitives (sphere, line, etc.)
│   ├── renderer/     # Terminal rendering system
│   └── index.ts      # Main entry point
├── package.json
└── tsconfig.json
```

### Building From Source

```bash
npm run build   # Build the project
npm start       # Run the project
```

## 📝 License

MIT

## 🙏 Acknowledgements

- Inspired by classic ASCII art and terminal demos
- Built with TypeScript and Node.js 