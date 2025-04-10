import { Vector2, Vector3 } from '../math/vector';
import { Matrix4 } from '../math/matrix';
import { BasePrimitive } from './base';
import { Line } from './line';

export class Cube extends BasePrimitive {
    private size: number;
    private wireframe: boolean;
    
    constructor(position: Vector3, size: number = 1, wireframe: boolean = true, color: string = '#') {
        super(position, Vector3.one(), Vector3.zero(), color);
        this.size = size;
        this.wireframe = wireframe;
    }
    
    render(buffer: string[][], width: number, height: number, depthBuffer: (number | undefined)[][]): void {
        const halfSize = this.size / 2;
        const transformMatrix = this.getTransformMatrix();
        
        const vertices = [
            transformMatrix.multiplyVector(new Vector3(-halfSize, -halfSize, -halfSize)),
            transformMatrix.multiplyVector(new Vector3(halfSize, -halfSize, -halfSize)),
            transformMatrix.multiplyVector(new Vector3(halfSize, halfSize, -halfSize)),
            transformMatrix.multiplyVector(new Vector3(-halfSize, halfSize, -halfSize)),
            transformMatrix.multiplyVector(new Vector3(-halfSize, -halfSize, halfSize)),
            transformMatrix.multiplyVector(new Vector3(halfSize, -halfSize, halfSize)),
            transformMatrix.multiplyVector(new Vector3(halfSize, halfSize, halfSize)),
            transformMatrix.multiplyVector(new Vector3(-halfSize, halfSize, halfSize))
        ];
        
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];
        
        const faces = [
            [0, 1, 2, 3],
            [1, 5, 6, 2],
            [5, 4, 7, 6],
            [4, 0, 3, 7],
            [3, 2, 6, 7],
            [4, 5, 1, 0]
        ];
        
        if (this.wireframe) {
            for (const [a, b] of edges) {
                const line = new Line(vertices[a], vertices[b], this.color);
                line.render(buffer, width, height, depthBuffer);
            }
        } else {
            this.renderFaces(buffer, vertices, faces, width, height, depthBuffer);
        }
    }
    
    private renderFaces(
        buffer: string[][], 
        vertices: Vector3[], 
        faces: number[][], 
        width: number, 
        height: number, 
        depthBuffer: (number | undefined)[][]
    ): void {
        for (const face of faces) {
            const faceVertices = face.map(i => vertices[i]);
            
            const centroid = faceVertices.reduce(
                (acc, vertex) => acc.add(vertex), 
                Vector3.zero()
            ).divide(faceVertices.length);
            
            const normal = this.calculateFaceNormal(faceVertices[0], faceVertices[1], faceVertices[2]);
            
            const viewDirection = new Vector3(0, 0, -1);
            
            if (normal.dot(viewDirection) < 0) {
                this.fillFace(buffer, faceVertices, width, height, depthBuffer);
            }
        }
    }
    
    private calculateFaceNormal(a: Vector3, b: Vector3, c: Vector3): Vector3 {
        const edge1 = b.subtract(a);
        const edge2 = c.subtract(a);
        return edge1.cross(edge2).normalize();
    }
    
    private fillFace(
        buffer: string[][],
        vertices: Vector3[],
        width: number,
        height: number,
        depthBuffer: (number | undefined)[][]
    ): void {
        const screenPoints = vertices.map(v => this.screenToBufferCoord(v.toVector2(), width, height));
        
        const minX = Math.min(...screenPoints.map(p => p.x));
        const maxX = Math.max(...screenPoints.map(p => p.x));
        const minY = Math.min(...screenPoints.map(p => p.y));
        const maxY = Math.max(...screenPoints.map(p => p.y));
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!this.isInBounds(new Vector2(x, y), width, height)) continue;
                
                if (this.isPointInPolygon(new Vector2(x, y), screenPoints)) {
                    const depth = this.interpolateDepth(new Vector2(x, y), vertices, screenPoints);
                    
                    if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]!) {
                        buffer[y][x] = this.color;
                        depthBuffer[y][x] = depth;
                    }
                }
            }
        }
    }
    
    private isPointInPolygon(point: Vector2, polygon: Vector2[]): boolean {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const intersect = ((polygon[i].y > point.y) !== (polygon[j].y > point.y))
                && (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    
    private interpolateDepth(
        point: Vector2,
        vertices: Vector3[],
        screenPoints: Vector2[]
    ): number {
        const weights = screenPoints.map(p => {
            const d = Math.sqrt(Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2));
            return d === 0 ? 1 : 1 / d;
        });
        
        const weightSum = weights.reduce((sum, w) => sum + w, 0);
        
        if (weightSum === 0) return vertices[0].z;
        
        const depth = vertices.reduce((sum, vertex, i) => sum + vertex.z * weights[i], 0) / weightSum;
        return depth;
    }
} 