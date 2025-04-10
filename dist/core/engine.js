"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const renderer_1 = require("../renderer/renderer");
const vector_1 = require("../math/vector");
class Engine {
    constructor(options) {
        this.primitives = [];
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.actualFPS = 0;
        this.fpsUpdateInterval = null;
        this.renderer = new renderer_1.Renderer({
            width: options.width,
            height: options.height,
            backgroundColor: options.backgroundColor,
            clearChar: options.clearChar,
            drawBorders: options.drawBorders,
            borderChar: options.borderChar
        });
        this.targetFPS = options.targetFPS || 30;
        this.frameInterval = 1000 / this.targetFPS;
    }
    add(primitive) {
        this.primitives.push(primitive);
        this.renderer.add(primitive);
    }
    remove(primitive) {
        const index = this.primitives.indexOf(primitive);
        if (index !== -1) {
            this.primitives.splice(index, 1);
            this.renderer.remove(primitive);
        }
    }
    setCamera(position, target, up = vector_1.Vector3.up()) {
        this.renderer.setCamera(position, target, up);
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.lastFrameTime = Date.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = setInterval(() => {
            this.actualFPS = this.frameCount;
            this.frameCount = 0;
        }, 1000);
        this.clearTerminal();
        this.renderLoop();
    }
    stop() {
        this.isRunning = false;
        if (this.fpsUpdateInterval) {
            clearInterval(this.fpsUpdateInterval);
            this.fpsUpdateInterval = null;
        }
    }
    getFPS() {
        return this.actualFPS;
    }
    clearTerminal() {
        // More aggressive terminal clearing
        process.stdout.write('\u001B[2J\u001B[0;0H'); // ANSI escape codes
        // For Windows terminals
        if (process.platform === 'win32') {
            require('readline').cursorTo(process.stdout, 0, 0);
            require('readline').clearScreenDown(process.stdout);
        }
        // For some terminals we may need to output newlines
        console.clear();
    }
    renderLoop() {
        if (!this.isRunning)
            return;
        const now = Date.now();
        const elapsed = now - this.lastFrameTime;
        if (elapsed >= this.frameInterval) {
            const frame = this.renderer.render();
            this.frameCount++;
            this.clearTerminal();
            process.stdout.write(frame);
            this.lastFrameTime = now - (elapsed % this.frameInterval);
        }
        setImmediate(() => this.renderLoop());
    }
}
exports.Engine = Engine;
