import { Renderer, RendererOptions } from '../renderer/renderer';
import { Primitive } from '../primitives/base';
import { Vector3 } from '../math/vector';

export interface EngineOptions extends RendererOptions {
    targetFPS?: number;
}

export class Engine {
    private renderer: Renderer;
    private primitives: Primitive[] = [];
    private isRunning: boolean = false;
    private lastFrameTime: number = 0;
    private targetFPS: number;
    private frameInterval: number;
    private frameCount: number = 0;
    private actualFPS: number = 0;
    private fpsUpdateInterval: NodeJS.Timeout | null = null;
    
    constructor(options: EngineOptions) {
        this.renderer = new Renderer({
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
    
    add(primitive: Primitive): void {
        this.primitives.push(primitive);
        this.renderer.add(primitive);
    }
    
    remove(primitive: Primitive): void {
        const index = this.primitives.indexOf(primitive);
        if (index !== -1) {
            this.primitives.splice(index, 1);
            this.renderer.remove(primitive);
        }
    }
    
    setCamera(position: Vector3, target: Vector3, up: Vector3 = Vector3.up()): void {
        this.renderer.setCamera(position, target, up);
    }
    
    start(): void {
        if (this.isRunning) return;
        
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
    
    stop(): void {
        this.isRunning = false;
        
        if (this.fpsUpdateInterval) {
            clearInterval(this.fpsUpdateInterval);
            this.fpsUpdateInterval = null;
        }
    }
    
    getFPS(): number {
        return this.actualFPS;
    }
    
    private clearTerminal(): void {
        process.stdout.write('\u001B[2J\u001B[0;0H');
        
        if (process.platform === 'win32') {
            require('readline').cursorTo(process.stdout, 0, 0);
            require('readline').clearScreenDown(process.stdout);
        }
        
        console.clear();
    }
    
    private renderLoop(): void {
        if (!this.isRunning) return;
        
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
