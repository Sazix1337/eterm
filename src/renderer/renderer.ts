import { Primitive } from '../primitives/base';
import { Vector3 } from '../math/vector';
import { Matrix4 } from '../math/matrix';

export interface RendererOptions {
    width: number;
    height: number;
    backgroundColor?: string;
    clearChar?: string;
    drawBorders?: boolean;
    borderChar?: string;
}

export class Renderer {
    private width: number;
    private height: number;
    private buffer: string[][];
    private depthBuffer: (number | undefined)[][];
    private primitives: Primitive[] = [];
    private backgroundColor: string;
    private clearChar: string;
    private drawBorders: boolean;
    private borderChar: string;
    
    private projectionMatrix: Matrix4;
    private viewMatrix: Matrix4;
    
    constructor(options: RendererOptions) {
        this.width = options.width;
        this.height = options.height;
        this.backgroundColor = options.backgroundColor || ' ';
        this.clearChar = options.clearChar || ' ';
        this.drawBorders = options.drawBorders !== undefined ? options.drawBorders : false;
        this.borderChar = options.borderChar || '+';
        
        this.buffer = Array(this.height).fill(0).map(() => 
            Array(this.width).fill(this.backgroundColor)
        );
        
        this.depthBuffer = Array(this.height).fill(0).map(() => 
            Array(this.width).fill(undefined)
        );
        
        this.projectionMatrix = Matrix4.perspective(
            Math.PI / 4, 
            this.width / this.height, 
            0.1, 
            100
        );
        
        this.viewMatrix = Matrix4.lookAt(
            new Vector3(0, 0, 5),
            Vector3.zero(),
            Vector3.up()
        );
    }
    
    add(primitive: Primitive): void {
        this.primitives.push(primitive);
    }
    
    remove(primitive: Primitive): void {
        const index = this.primitives.indexOf(primitive);
        if (index !== -1) {
            this.primitives.splice(index, 1);
        }
    }
    
    clear(): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.buffer[y][x] = this.backgroundColor;
                this.depthBuffer[y][x] = undefined;
            }
        }
    }
    
    setCamera(position: Vector3, target: Vector3, up: Vector3): void {
        this.viewMatrix = Matrix4.lookAt(position, target, up);
    }
    
    setPerspective(fov: number, near: number, far: number): void {
        this.projectionMatrix = Matrix4.perspective(
            fov, 
            this.width / this.height, 
            near, 
            far
        );
    }
    
    private drawBorder(): void {
        if (!this.drawBorders) return;
        
        // Draw top and bottom borders
        for (let x = 0; x < this.width; x++) {
            this.buffer[0][x] = this.borderChar;
            this.buffer[this.height - 1][x] = this.borderChar;
        }
        
        // Draw left and right borders
        for (let y = 0; y < this.height; y++) {
            this.buffer[y][0] = this.borderChar;
            this.buffer[y][this.width - 1] = this.borderChar;
        }
    }
    
    render(): string {
        this.clear();
        
        const mvpMatrix = this.projectionMatrix.multiply(this.viewMatrix);
        
        for (const primitive of this.primitives) {
            primitive.transform(mvpMatrix);
            primitive.render(this.buffer, this.width, this.height, this.depthBuffer);
        }
        
        this.drawBorder();
        
        return this.bufferToString();
    }
    
    private bufferToString(): string {
        return this.buffer.map(row => row.join('')).join('\n');
    }
} 