export class Vector2 {
    constructor(public x: number = 0, public y: number = 0) {}

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vector2 {
        if (scalar === 0) throw new Error('Division by zero');
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2 {
        const len = this.length();
        if (len === 0) return new Vector2();
        return this.divide(len);
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    static zero(): Vector2 {
        return new Vector2(0, 0);
    }
    
    static one(): Vector2 {
        return new Vector2(1, 1);
    }
}

export class Vector3 {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

    add(v: Vector3): Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v: Vector3): Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar: number): Vector3 {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar: number): Vector3 {
        if (scalar === 0) throw new Error('Division by zero');
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(): Vector3 {
        const len = this.length();
        if (len === 0) return new Vector3();
        return this.divide(len);
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    toVector2(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    static zero(): Vector3 {
        return new Vector3(0, 0, 0);
    }
    
    static one(): Vector3 {
        return new Vector3(1, 1, 1);
    }
    
    static up(): Vector3 {
        return new Vector3(0, 1, 0);
    }
    
    static forward(): Vector3 {
        return new Vector3(0, 0, 1);
    }
    
    static right(): Vector3 {
        return new Vector3(1, 0, 0);
    }
} 