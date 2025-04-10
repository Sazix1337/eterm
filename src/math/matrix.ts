import { Vector3 } from './vector';

export class Matrix4 {
    private data: number[] = Array(16).fill(0);

    constructor(values?: number[]) {
        if (values && values.length === 16) {
            this.data = [...values];
        } else {
            this.identity();
        }
    }

    identity(): Matrix4 {
        this.data = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        return this;
    }

    get(row: number, col: number): number {
        return this.data[row * 4 + col];
    }

    set(row: number, col: number, value: number): void {
        this.data[row * 4 + col] = value;
    }

    multiply(m: Matrix4): Matrix4 {
        const result = new Matrix4();
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += this.get(i, k) * m.get(k, j);
                }
                result.set(i, j, sum);
            }
        }
        
        return result;
    }

    multiplyVector(v: Vector3): Vector3 {
        const x = v.x * this.get(0, 0) + v.y * this.get(0, 1) + v.z * this.get(0, 2) + this.get(0, 3);
        const y = v.x * this.get(1, 0) + v.y * this.get(1, 1) + v.z * this.get(1, 2) + this.get(1, 3);
        const z = v.x * this.get(2, 0) + v.y * this.get(2, 1) + v.z * this.get(2, 2) + this.get(2, 3);
        const w = v.x * this.get(3, 0) + v.y * this.get(3, 1) + v.z * this.get(3, 2) + this.get(3, 3);
        
        if (w === 0) return new Vector3(x, y, z);
        return new Vector3(x / w, y / w, z / w);
    }

    static translation(x: number, y: number, z: number): Matrix4 {
        return new Matrix4([
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ]);
    }

    static rotationX(angle: number): Matrix4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        return new Matrix4([
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        ]);
    }

    static rotationY(angle: number): Matrix4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        return new Matrix4([
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        ]);
    }

    static rotationZ(angle: number): Matrix4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        return new Matrix4([
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static scale(x: number, y: number, z: number): Matrix4 {
        return new Matrix4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        const tanHalfFov = Math.tan(fov / 2);
        
        const result = new Matrix4();
        result.set(0, 0, 1 / (aspect * tanHalfFov));
        result.set(1, 1, 1 / tanHalfFov);
        result.set(2, 2, -(far + near) / (far - near));
        result.set(2, 3, -(2 * far * near) / (far - near));
        result.set(3, 2, -1);
        result.set(3, 3, 0);
        
        return result;
    }

    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
        const zAxis = eye.subtract(target).normalize();
        const xAxis = up.cross(zAxis).normalize();
        const yAxis = zAxis.cross(xAxis);
        
        return new Matrix4([
            xAxis.x, xAxis.y, xAxis.z, -xAxis.dot(eye),
            yAxis.x, yAxis.y, yAxis.z, -yAxis.dot(eye),
            zAxis.x, zAxis.y, zAxis.z, -zAxis.dot(eye),
            0, 0, 0, 1
        ]);
    }
} 