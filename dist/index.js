"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.PhysicsSystem = exports.Engine = exports.Renderer = exports.BlackHole = exports.Cube = exports.Sphere = exports.Rect = exports.Line = exports.BasePrimitive = exports.Matrix4 = exports.Vector3 = exports.Vector2 = void 0;
var vector_1 = require("./math/vector");
Object.defineProperty(exports, "Vector2", { enumerable: true, get: function () { return vector_1.Vector2; } });
Object.defineProperty(exports, "Vector3", { enumerable: true, get: function () { return vector_1.Vector3; } });
var matrix_1 = require("./math/matrix");
Object.defineProperty(exports, "Matrix4", { enumerable: true, get: function () { return matrix_1.Matrix4; } });
var base_1 = require("./primitives/base");
Object.defineProperty(exports, "BasePrimitive", { enumerable: true, get: function () { return base_1.BasePrimitive; } });
var line_1 = require("./primitives/line");
Object.defineProperty(exports, "Line", { enumerable: true, get: function () { return line_1.Line; } });
var rect_1 = require("./primitives/rect");
Object.defineProperty(exports, "Rect", { enumerable: true, get: function () { return rect_1.Rect; } });
var sphere_1 = require("./primitives/sphere");
Object.defineProperty(exports, "Sphere", { enumerable: true, get: function () { return sphere_1.Sphere; } });
var cube_1 = require("./primitives/cube");
Object.defineProperty(exports, "Cube", { enumerable: true, get: function () { return cube_1.Cube; } });
var blackhole_1 = require("./primitives/blackhole");
Object.defineProperty(exports, "BlackHole", { enumerable: true, get: function () { return blackhole_1.BlackHole; } });
var renderer_1 = require("./renderer/renderer");
Object.defineProperty(exports, "Renderer", { enumerable: true, get: function () { return renderer_1.Renderer; } });
var engine_1 = require("./core/engine");
Object.defineProperty(exports, "Engine", { enumerable: true, get: function () { return engine_1.Engine; } });
var physics_1 = require("./core/physics");
Object.defineProperty(exports, "PhysicsSystem", { enumerable: true, get: function () { return physics_1.PhysicsSystem; } });
exports.VERSION = '2.1.2';
if (require.main === module) {
    const demo = async () => {
        const { Engine, Sphere, Vector3, PhysicsSystem, Rect, Line, BasePrimitive } = require('./index');
        // Configure window and display
        const WINDOW_WIDTH = 80;
        const WINDOW_HEIGHT = 42;
        const DIVIDER_Y = 30;
        // Calculate aspect ratio to ensure spheres look proportional
        const aspectRatio = 0.25; // Terminal chars are roughly twice as tall as wide
        const engine = new Engine({
            width: WINDOW_WIDTH,
            height: WINDOW_HEIGHT,
            backgroundColor: ' ',
            targetFPS: 30,
            drawBorders: true,
            borderChar: '*'
        });
        // Create a divider line to separate rendering and controls
        const dividerLine = new Line(new Vector3(-WINDOW_WIDTH / 2, DIVIDER_Y, 1), new Vector3(WINDOW_WIDTH / 2, DIVIDER_Y, 1), '=');
        engine.add(dividerLine);
        // Add solid background for controls area
        const controlsBackground = new Rect(new Vector3(0, (DIVIDER_Y + WINDOW_HEIGHT) / 2, 2), WINDOW_WIDTH - 2, WINDOW_HEIGHT - DIVIDER_Y - 2, ' ');
        engine.add(controlsBackground);
        // Text display helper
        const createTextPrimitive = (text, x, y, zIndex = 0) => {
            // Create a visual text object with BasePrimitive
            const textObj = new BasePrimitive(new Vector3(x, y, zIndex), new Vector3(text.length, 1, 0), Vector3.zero(), text);
            textObj.render = (buffer, width, height, depthBuffer) => {
                const screenX = Math.round(x);
                const screenY = Math.round(y);
                if (screenY >= 0 && screenY < height) {
                    for (let i = 0; i < text.length; i++) {
                        const charX = screenX + i;
                        if (charX >= 0 && charX < width) {
                            buffer[screenY][charX] = text[i];
                        }
                    }
                }
            };
            return textObj;
        };
        // Create spheres for black holes
        const sphere1 = new Sphere(new Vector3(-2.0, 0, 0), 0.4, 40, true, '@');
        sphere1.setScale(new Vector3(1, aspectRatio, 1));
        const sphere2 = new Sphere(new Vector3(2.0, 0, 0), 0.3, 40, true, 'O');
        sphere2.setScale(new Vector3(1, aspectRatio, 1));
        // Add the spheres to the engine
        engine.add(sphere1);
        engine.add(sphere2);
        // Set up the camera
        engine.setCamera(new Vector3(0, 0.5, 10), new Vector3(0, 0, 0));
        // Add help text to the controls area
        const controlsText = [
            "=== BLACK HOLE LIGHTING CONTROLS ===",
            "",
            "Use keyboard to adjust lighting:",
            "1/2: Increase/Decrease light intensity",
            "A/D: Move light left/right (X axis)",
            "W/S: Move light up/down (Y axis)",
            "Q/E: Move light in/out (Z axis)",
            "R: Reset lighting to default",
            "Ctrl+C: Exit"
        ];
        // Add all the control text lines to the engine
        controlsText.forEach((line, index) => {
            engine.add(createTextPrimitive(line, 2, DIVIDER_Y + 2 + index, 3));
        });
        // Lighting status line - will be updated
        let statusText = createTextPrimitive("", 2, DIVIDER_Y + 14, 3);
        engine.add(statusText);
        // Implement custom physics with proper gravitational attraction
        class GravityPhysics {
            constructor(gravityConstant) {
                this.objects = [];
                this.G = gravityConstant;
            }
            addObject(obj) {
                this.objects.push(obj);
            }
            update(deltaTime) {
                // Apply gravitational forces between all pairs of objects
                for (let i = 0; i < this.objects.length; i++) {
                    for (let j = i + 1; j < this.objects.length; j++) {
                        const obj1 = this.objects[i];
                        const obj2 = this.objects[j];
                        // Calculate distance vector between objects
                        const distanceVec = new Vector3(obj2.position.x - obj1.position.x, obj2.position.y - obj1.position.y, obj2.position.z - obj1.position.z);
                        const distance = Math.sqrt(distanceVec.x * distanceVec.x +
                            distanceVec.y * distanceVec.y +
                            distanceVec.z * distanceVec.z);
                        // Check for collision (overlapping spheres)
                        if (distance < obj1.radius + obj2.radius) {
                            // Handle collision by combining velocities
                            const totalMass = obj1.mass + obj2.mass;
                            const v1Weight = obj1.mass / totalMass;
                            const v2Weight = obj2.mass / totalMass;
                            // Calculate combined velocity (conservation of momentum)
                            const newVelocity = new Vector3(obj1.velocity.x * v1Weight + obj2.velocity.x * v2Weight, obj1.velocity.y * v1Weight + obj2.velocity.y * v2Weight, obj1.velocity.z * v1Weight + obj2.velocity.z * v2Weight);
                            // Add significant extra energy to make it more dramatic
                            newVelocity.x *= 5.0;
                            newVelocity.y *= 5.0;
                            newVelocity.z *= 5.0;
                            obj1.velocity = newVelocity.clone();
                            obj2.velocity = newVelocity.clone();
                            // Push them slightly apart to prevent sticking
                            const pushDir = distanceVec.clone();
                            pushDir.x /= distance || 1;
                            pushDir.y /= distance || 1;
                            pushDir.z /= distance || 1;
                            obj1.position.x -= pushDir.x * 0.1;
                            obj1.position.y -= pushDir.y * 0.1;
                            obj1.position.z -= pushDir.z * 0.1;
                            obj2.position.x += pushDir.x * 0.1;
                            obj2.position.y += pushDir.y * 0.1;
                            obj2.position.z += pushDir.z * 0.1;
                            continue;
                        }
                        // Calculate gravitational force: F = G * (m1 * m2) / r^2
                        const forceMagnitude = this.G * obj1.mass * obj2.mass / (distance * distance);
                        // Direction of force (normalized distance vector)
                        const forceDirection = new Vector3(distanceVec.x / distance, distanceVec.y / distance, distanceVec.z / distance);
                        // Calculate force components
                        const forceX = forceDirection.x * forceMagnitude;
                        const forceY = forceDirection.y * forceMagnitude;
                        const forceZ = forceDirection.z * forceMagnitude;
                        // Apply acceleration to each object (F = ma, so a = F/m)
                        obj1.acceleration.x += forceX / obj1.mass;
                        obj1.acceleration.y += forceY / obj1.mass;
                        obj1.acceleration.z += forceZ / obj1.mass;
                        obj2.acceleration.x -= forceX / obj2.mass;
                        obj2.acceleration.y -= forceY / obj2.mass;
                        obj2.acceleration.z -= forceZ / obj2.mass;
                    }
                }
                // Update positions and velocities for all objects
                for (const obj of this.objects) {
                    // Update velocity based on acceleration
                    obj.velocity.x += obj.acceleration.x * deltaTime;
                    obj.velocity.y += obj.acceleration.y * deltaTime;
                    obj.velocity.z += obj.acceleration.z * deltaTime;
                    // Update position based on velocity
                    obj.position.x += obj.velocity.x * deltaTime;
                    obj.position.y += obj.velocity.y * deltaTime;
                    obj.position.z += obj.velocity.z * deltaTime;
                    // Reset acceleration for next frame
                    obj.acceleration.x = 0;
                    obj.acceleration.y = 0;
                    obj.acceleration.z = 0;
                    // Update the primitive position
                    obj.primitive.setPosition(obj.position);
                }
            }
        }
        // Create custom physics system with stronger gravity
        const gravityPhysics = new GravityPhysics(5.0); // Significantly increased gravity constant
        // Set up orbital mechanics
        const distance = 2.0;
        const orbitSpeed = 1.5; // Faster initial velocity
        // Add spheres to physics system
        const physicsObj1 = {
            primitive: sphere1,
            position: new Vector3(-distance, 0, 0),
            velocity: new Vector3(0, 0, orbitSpeed),
            acceleration: new Vector3(0, 0, 0),
            mass: 2.0,
            radius: 0.4
        };
        const physicsObj2 = {
            primitive: sphere2,
            position: new Vector3(distance, 0, 0),
            velocity: new Vector3(0, 0, -orbitSpeed),
            acceleration: new Vector3(0, 0, 0),
            mass: 1.0,
            radius: 0.3
        };
        gravityPhysics.addObject(physicsObj1);
        gravityPhysics.addObject(physicsObj2);
        let lastTime = Date.now();
        // Lighting controls
        let lightIntensity = 2.0;
        let lightX = -1.0;
        let lightY = 2.0;
        let lightZ = -4.0;
        // Function to update the status text
        const updateStatusText = () => {
            engine.remove(statusText);
            const newText = `Light: intensity=${lightIntensity.toFixed(1)}, position=(${lightX.toFixed(1)}, ${lightY.toFixed(1)}, ${lightZ.toFixed(1)})`;
            statusText = createTextPrimitive(newText, 2, DIVIDER_Y + 14, 3);
            engine.add(statusText);
        };
        // Initialize status text
        updateStatusText();
        // Add some orbital trails (lines of small spheres) for visual effect
        const trailCount = 15;
        const trails1 = [];
        const trails2 = [];
        for (let i = 0; i < trailCount; i++) {
            const trailSphere1 = new Sphere(new Vector3(-distance, 0, 0), 0.05, 5, true, '.');
            // Apply aspect ratio to trail spheres too
            trailSphere1.setScale(new Vector3(1, aspectRatio, 1));
            const trailSphere2 = new Sphere(new Vector3(distance, 0, 0), 0.05, 5, true, '.');
            // Apply aspect ratio to trail spheres too
            trailSphere2.setScale(new Vector3(1, aspectRatio, 1));
            engine.add(trailSphere1);
            engine.add(trailSphere2);
            trails1.push({
                sphere: trailSphere1,
                position: new Vector3(-distance, 0, 0),
                age: i
            });
            trails2.push({
                sphere: trailSphere2,
                position: new Vector3(distance, 0, 0),
                age: i
            });
        }
        // Set up keyboard controls for lighting
        const readline = require('readline');
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
            if (key.ctrl && key.name === 'c') {
                process.exit();
            }
            const step = 0.5;
            switch (key.name) {
                case '1':
                    lightIntensity = Math.min(5.0, lightIntensity + 0.5);
                    break;
                case '2':
                    lightIntensity = Math.max(0.5, lightIntensity - 0.5);
                    break;
                case 'a':
                    lightX -= step;
                    break;
                case 'd':
                    lightX += step;
                    break;
                case 'w':
                    lightY += step;
                    break;
                case 's':
                    lightY -= step;
                    break;
                case 'q':
                    lightZ -= step;
                    break;
                case 'e':
                    lightZ += step;
                    break;
                case 'r':
                    lightIntensity = 2.0;
                    lightX = -1.0;
                    lightY = 2.0;
                    lightZ = -4.0;
                    break;
            }
            // Update the displayed status
            updateStatusText();
        });
        // Update physics every frame
        setInterval(() => {
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;
            // Update the physics simulation
            gravityPhysics.update(deltaTime);
            // Update trail positions
            for (let i = trailCount - 1; i > 0; i--) {
                trails1[i].position = trails1[i - 1].position.clone();
                trails2[i].position = trails2[i - 1].position.clone();
                trails1[i].sphere.setPosition(trails1[i].position);
                trails2[i].sphere.setPosition(trails2[i].position);
            }
            trails1[0].position = physicsObj1.position.clone();
            trails2[0].position = physicsObj2.position.clone();
            trails1[0].sphere.setPosition(trails1[0].position);
            trails2[0].sphere.setPosition(trails2[0].position);
            // Rotate spheres
            const rotationSpeed = 0.08; // Faster rotation
            sphere1.setRotation(sphere1.getRotation().add(new Vector3(rotationSpeed, rotationSpeed * 0.7, rotationSpeed * 0.3)));
            sphere2.setRotation(sphere2.getRotation().add(new Vector3(-rotationSpeed, -rotationSpeed * 0.7, -rotationSpeed * 0.3)));
            // Apply user-controlled lighting
            const lightDir = new Vector3(lightX, lightY, lightZ).normalize();
            lightDir.x *= lightIntensity;
            lightDir.y *= lightIntensity;
            lightDir.z *= lightIntensity;
            if (typeof sphere1.setLightSource === 'function') {
                sphere1.setLightSource(lightDir);
                sphere2.setLightSource(lightDir);
            }
        }, 1000 / 60);
        engine.start();
    };
    demo().catch(console.error);
}
