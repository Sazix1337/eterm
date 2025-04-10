import { Vector2, Vector3 } from '../math/vector';
import { Matrix4 } from '../math/matrix';

export interface Primitive {
    transform(matrix: Matrix4): void;
    render(buffer: string[][], width: number, height: number, depthBuffer: (number | undefined)[][]): void;
    setPosition(position: Vector3): void;
    setRotation(rotation: Vector3): void;
    setScale(scale: Vector3): void;
    getPosition(): Vector3;
    getRotation(): Vector3;
    getScale(): Vector3;
}

export abstract class BasePrimitive implements Primitive {
    protected position: Vector3;
    protected scale: Vector3;
    protected rotation: Vector3;
    protected color: string;

    constructor(position: Vector3 = Vector3.zero(), scale: Vector3 = Vector3.one(), rotation: Vector3 = Vector3.zero(), color: string = '#') {
        this.position = position;
        this.scale = scale;
        this.rotation = rotation;
        this.color = color;
    }

    getTransformMatrix(): Matrix4 {
        let matrix = Matrix4.translation(this.position.x, this.position.y, this.position.z);
        
        matrix = matrix.multiply(Matrix4.rotationX(this.rotation.x));
        matrix = matrix.multiply(Matrix4.rotationY(this.rotation.y));
        matrix = matrix.multiply(Matrix4.rotationZ(this.rotation.z));
        
        matrix = matrix.multiply(Matrix4.scale(this.scale.x, this.scale.y, this.scale.z));
        
        return matrix;
    }

    transform(matrix: Matrix4): void {
        this.position = matrix.multiplyVector(this.position);
    }

    setPosition(position: Vector3): void {
        this.position = position;
    }

    setRotation(rotation: Vector3): void {
        this.rotation = rotation;
    }

    setScale(scale: Vector3): void {
        this.scale = scale;
    }

    setColor(color: string): void {
        this.color = color;
    }
    
    getPosition(): Vector3 {
        return this.position.clone();
    }
    
    getRotation(): Vector3 {
        return this.rotation.clone();
    }
    
    getScale(): Vector3 {
        return this.scale.clone();
    }

    abstract render(buffer: string[][], width: number, height: number, depthBuffer: (number | undefined)[][]): void;

    protected screenToBufferCoord(point: Vector2, width: number, height: number): Vector2 {
        const x = Math.round((point.x + 1) * width / 2);
        const y = Math.round((1 - point.y) * height / 2);
        return new Vector2(x, y);
    }

    protected isInBounds(point: Vector2, width: number, height: number): boolean {
        return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
    }
} 