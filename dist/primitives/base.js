"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePrimitive = void 0;
const vector_1 = require("../math/vector");
const matrix_1 = require("../math/matrix");
class BasePrimitive {
    constructor(position = vector_1.Vector3.zero(), scale = vector_1.Vector3.one(), rotation = vector_1.Vector3.zero(), color = '#') {
        this.position = position;
        this.scale = scale;
        this.rotation = rotation;
        this.color = color;
    }
    getTransformMatrix() {
        let matrix = matrix_1.Matrix4.translation(this.position.x, this.position.y, this.position.z);
        matrix = matrix.multiply(matrix_1.Matrix4.rotationX(this.rotation.x));
        matrix = matrix.multiply(matrix_1.Matrix4.rotationY(this.rotation.y));
        matrix = matrix.multiply(matrix_1.Matrix4.rotationZ(this.rotation.z));
        matrix = matrix.multiply(matrix_1.Matrix4.scale(this.scale.x, this.scale.y, this.scale.z));
        return matrix;
    }
    transform(matrix) {
        this.position = matrix.multiplyVector(this.position);
    }
    setPosition(position) {
        this.position = position;
    }
    setRotation(rotation) {
        this.rotation = rotation;
    }
    setScale(scale) {
        this.scale = scale;
    }
    setColor(color) {
        this.color = color;
    }
    getPosition() {
        return this.position.clone();
    }
    getRotation() {
        return this.rotation.clone();
    }
    getScale() {
        return this.scale.clone();
    }
    screenToBufferCoord(point, width, height) {
        const x = Math.round((point.x + 1) * width / 2);
        const y = Math.round((1 - point.y) * height / 2);
        return new vector_1.Vector2(x, y);
    }
    isInBounds(point, width, height) {
        return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
    }
}
exports.BasePrimitive = BasePrimitive;
