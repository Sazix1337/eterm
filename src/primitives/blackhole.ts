import { Vector2, Vector3 } from '../math/vector';
import { Matrix4 } from '../math/matrix';
import { BasePrimitive } from './base';

export class BlackHole extends BasePrimitive {
    private radius: number;
    private innerChar: string;
    private outerChar: string;
    private accretionDiskChar: string;
    private showAccretionDisk: boolean;
    
    constructor(
        position: Vector3, 
        radius: number = 1,
        innerChar: string = '@',
        outerChar: string = '#',
        accretionDiskChar: string = '.',
        showAccretionDisk: boolean = true
    ) {
        super(position, Vector3.one(), Vector3.zero(), innerChar);
        this.radius = radius;
        this.innerChar = innerChar;
        this.outerChar = outerChar;
        this.accretionDiskChar = accretionDiskChar;
        this.showAccretionDisk = showAccretionDisk;
    }
    
    render(buffer: string[][], width: number, height: number, depthBuffer: (number | undefined)[][]): void {
        const transformMatrix = this.getTransformMatrix();
        const centerPoint = transformMatrix.multiplyVector(Vector3.zero());
        const screenCenter = this.screenToBufferCoord(new Vector2(centerPoint.x, centerPoint.y), width, height);
        
        const transformedRadius = this.radius * this.scale.x;
        const screenRadius = Math.round(transformedRadius * width / 4);
        const innerRadius = Math.max(1, Math.round(screenRadius * 0.6));
        const accretionDiskRadius = Math.round(screenRadius * 1.5);
        
        if (this.showAccretionDisk) {
            this.renderAccretionDisk(
                buffer, 
                screenCenter, 
                innerRadius, 
                accretionDiskRadius, 
                width, 
                height, 
                depthBuffer, 
                centerPoint.z
            );
        }
        
        this.renderBlackHoleCore(
            buffer, 
            screenCenter, 
            innerRadius, 
            screenRadius, 
            width, 
            height, 
            depthBuffer, 
            centerPoint.z
        );
    }
    
    private renderAccretionDisk(
        buffer: string[][], 
        center: Vector2, 
        innerRadius: number, 
        outerRadius: number, 
        width: number, 
        height: number, 
        depthBuffer: (number | undefined)[][],
        depth: number
    ): void {
        const rotationMatrix = Matrix4.rotationX(Math.PI / 4);
        
        for (let y = center.y - outerRadius; y <= center.y + outerRadius; y++) {
            for (let x = center.x - outerRadius; x <= center.x + outerRadius; x++) {
                if (!this.isInBounds(new Vector2(x, y), width, height)) continue;
                
                const dx = x - center.x;
                const dy = y - center.y;
                const distanceSquared = dx * dx + dy * dy;
                
                if (distanceSquared > innerRadius * innerRadius && distanceSquared <= outerRadius * outerRadius) {
                    const distance = Math.sqrt(distanceSquared);
                    
                    const point3D = rotationMatrix.multiplyVector(new Vector3(dx, 0, dy));
                    
                    if (Math.abs(point3D.y) < 0.3) {
                        const adjustedDepth = depth + point3D.y;
                        
                        if (depthBuffer[y][x] === undefined || adjustedDepth < depthBuffer[y][x]!) {
                            const intensity = 1 - (distance - innerRadius) / (outerRadius - innerRadius);
                            buffer[y][x] = intensity > 0.7 ? this.accretionDiskChar : (intensity > 0.3 ? '·' : '·');
                            depthBuffer[y][x] = adjustedDepth;
                        }
                    }
                }
            }
        }
    }
    
    private renderBlackHoleCore(
        buffer: string[][], 
        center: Vector2, 
        innerRadius: number, 
        outerRadius: number, 
        width: number, 
        height: number, 
        depthBuffer: (number | undefined)[][],
        depth: number
    ): void {
        for (let y = center.y - outerRadius; y <= center.y + outerRadius; y++) {
            for (let x = center.x - outerRadius; x <= center.x + outerRadius; x++) {
                if (!this.isInBounds(new Vector2(x, y), width, height)) continue;
                
                const dx = x - center.x;
                const dy = y - center.y;
                const distanceSquared = dx * dx + dy * dy;
                
                if (distanceSquared <= outerRadius * outerRadius) {
                    const isInner = distanceSquared <= innerRadius * innerRadius;
                    
                    if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]!) {
                        buffer[y][x] = isInner ? this.innerChar : this.outerChar;
                        depthBuffer[y][x] = depth;
                    }
                }
            }
        }
    }
} 
