"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector3 = exports.Vector2 = void 0;
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    divide(scalar) {
        if (scalar === 0)
            throw new Error('Division by zero');
        return new Vector2(this.x / scalar, this.y / scalar);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const len = this.length();
        if (len === 0)
            return new Vector2();
        return this.divide(len);
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    static zero() {
        return new Vector2(0, 0);
    }
    static one() {
        return new Vector2(1, 1);
    }
}
exports.Vector2 = Vector2;
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    divide(scalar) {
        if (scalar === 0)
            throw new Error('Division by zero');
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    normalize() {
        const len = this.length();
        if (len === 0)
            return new Vector3();
        return this.divide(len);
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    toVector2() {
        return new Vector2(this.x, this.y);
    }
    static zero() {
        return new Vector3(0, 0, 0);
    }
    static one() {
        return new Vector3(1, 1, 1);
    }
    static up() {
        return new Vector3(0, 1, 0);
    }
    static forward() {
        return new Vector3(0, 0, 1);
    }
    static right() {
        return new Vector3(1, 0, 0);
    }
}
exports.Vector3 = Vector3;
