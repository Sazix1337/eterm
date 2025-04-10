"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const vector_1 = require("../math/vector");
const matrix_1 = require("../math/matrix");
class Renderer {
    constructor(options) {
        this.primitives = [];
        this.width = options.width;
        this.height = options.height;
        this.backgroundColor = options.backgroundColor || ' ';
        this.clearChar = options.clearChar || ' ';
        this.drawBorders = options.drawBorders !== undefined ? options.drawBorders : false;
        this.borderChar = options.borderChar || '+';
        this.buffer = Array(this.height).fill(0).map(() => Array(this.width).fill(this.backgroundColor));
        this.depthBuffer = Array(this.height).fill(0).map(() => Array(this.width).fill(undefined));
        this.projectionMatrix = matrix_1.Matrix4.perspective(Math.PI / 4, this.width / this.height, 0.1, 100);
        this.viewMatrix = matrix_1.Matrix4.lookAt(new vector_1.Vector3(0, 0, 5), vector_1.Vector3.zero(), vector_1.Vector3.up());
    }
    add(primitive) {
        this.primitives.push(primitive);
    }
    remove(primitive) {
        const index = this.primitives.indexOf(primitive);
        if (index !== -1) {
            this.primitives.splice(index, 1);
        }
    }
    clear() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.buffer[y][x] = this.backgroundColor;
                this.depthBuffer[y][x] = undefined;
            }
        }
    }
    setCamera(position, target, up) {
        this.viewMatrix = matrix_1.Matrix4.lookAt(position, target, up);
    }
    setPerspective(fov, near, far) {
        this.projectionMatrix = matrix_1.Matrix4.perspective(fov, this.width / this.height, near, far);
    }
    drawBorder() {
        if (!this.drawBorders)
            return;
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
    render() {
        this.clear();
        const mvpMatrix = this.projectionMatrix.multiply(this.viewMatrix);
        for (const primitive of this.primitives) {
            primitive.transform(mvpMatrix);
            primitive.render(this.buffer, this.width, this.height, this.depthBuffer);
        }
        this.drawBorder();
        return this.bufferToString();
    }
    bufferToString() {
        return this.buffer.map(row => row.join('')).join('\n');
    }
}
exports.Renderer = Renderer;
