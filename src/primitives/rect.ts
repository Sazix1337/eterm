import { Vector2, Vector3 } from '../math/vector';
import { Matrix4 } from '../math/matrix';
import { BasePrimitive } from './base';
import { Line } from './line';

export class Rect extends BasePrimitive {
    private width: number;
    private height: number;
    private filled: boolean;
    
    constructor(position: Vector3, width: number, height: number, filled: boolean = false, color: string = '#') {
        super(position, Vector3.one(), Vector3.zero(), color);
        this.width = width;
        this.height = height;
        this.filled = filled;
    }
    
    render(buffer: string[][], width: number, height: number, depthBuffer: (number | undefined)[][]): void {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const transformMatrix = this.getTransformMatrix();
        
        const topLeft = transformMatrix.multiplyVector(new Vector3(-halfWidth, halfHeight, 0));
        const topRight = transformMatrix.multiplyVector(new Vector3(halfWidth, halfHeight, 0));
        const bottomRight = transformMatrix.multiplyVector(new Vector3(halfWidth, -halfHeight, 0));
        const bottomLeft = transformMatrix.multiplyVector(new Vector3(-halfWidth, -halfHeight, 0));
        
        if (this.filled) {
            this.drawFilledRect(buffer, topLeft, topRight, bottomRight, bottomLeft, width, height, depthBuffer);
        } else {
            const lines = [
                new Line(topLeft, topRight, this.color),
                new Line(topRight, bottomRight, this.color),
                new Line(bottomRight, bottomLeft, this.color),
                new Line(bottomLeft, topLeft, this.color)
            ];
            
            for (const line of lines) {
                line.render(buffer, width, height, depthBuffer);
            }
        }
    }
    
    private drawFilledRect(
        buffer: string[][], 
        topLeft: Vector3, 
        topRight: Vector3, 
        bottomRight: Vector3, 
        bottomLeft: Vector3, 
        width: number, 
        height: number, 
        depthBuffer: (number | undefined)[][]
    ): void {
        const points = [
            this.screenToBufferCoord(new Vector2(topLeft.x, topLeft.y), width, height),
            this.screenToBufferCoord(new Vector2(topRight.x, topRight.y), width, height),
            this.screenToBufferCoord(new Vector2(bottomRight.x, bottomRight.y), width, height),
            this.screenToBufferCoord(new Vector2(bottomLeft.x, bottomLeft.y), width, height)
        ];
        
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (this.isInBounds(new Vector2(x, y), width, height) && this.isPointInRect(new Vector2(x, y), points)) {
                    const depth = this.position.z;
                    
                    if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]!) {
                        buffer[y][x] = this.color;
                        depthBuffer[y][x] = depth;
                    }
                }
            }
        }
    }
    
    private isPointInRect(point: Vector2, vertices: Vector2[]): boolean {
        let inside = false;
        
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x;
            const yi = vertices[i].y;
            const xj = vertices[j].x;
            const yj = vertices[j].y;
            
            const intersect = ((yi > point.y) !== (yj > point.y)) && 
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
                
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
} 