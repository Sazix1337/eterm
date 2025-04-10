"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = void 0;
const vector_1 = require("../math/vector");
const base_1 = require("./base");
const line_1 = require("./line");
class Rect extends base_1.BasePrimitive {
    constructor(position, width, height, filled = false, color = '#') {
        super(position, vector_1.Vector3.one(), vector_1.Vector3.zero(), color);
        this.width = width;
        this.height = height;
        this.filled = filled;
    }
    render(buffer, width, height, depthBuffer) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const transformMatrix = this.getTransformMatrix();
        const topLeft = transformMatrix.multiplyVector(new vector_1.Vector3(-halfWidth, halfHeight, 0));
        const topRight = transformMatrix.multiplyVector(new vector_1.Vector3(halfWidth, halfHeight, 0));
        const bottomRight = transformMatrix.multiplyVector(new vector_1.Vector3(halfWidth, -halfHeight, 0));
        const bottomLeft = transformMatrix.multiplyVector(new vector_1.Vector3(-halfWidth, -halfHeight, 0));
        if (this.filled) {
            this.drawFilledRect(buffer, topLeft, topRight, bottomRight, bottomLeft, width, height, depthBuffer);
        }
        else {
            const lines = [
                new line_1.Line(topLeft, topRight, this.color),
                new line_1.Line(topRight, bottomRight, this.color),
                new line_1.Line(bottomRight, bottomLeft, this.color),
                new line_1.Line(bottomLeft, topLeft, this.color)
            ];
            for (const line of lines) {
                line.render(buffer, width, height, depthBuffer);
            }
        }
    }
    drawFilledRect(buffer, topLeft, topRight, bottomRight, bottomLeft, width, height, depthBuffer) {
        const points = [
            this.screenToBufferCoord(new vector_1.Vector2(topLeft.x, topLeft.y), width, height),
            this.screenToBufferCoord(new vector_1.Vector2(topRight.x, topRight.y), width, height),
            this.screenToBufferCoord(new vector_1.Vector2(bottomRight.x, bottomRight.y), width, height),
            this.screenToBufferCoord(new vector_1.Vector2(bottomLeft.x, bottomLeft.y), width, height)
        ];
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (this.isInBounds(new vector_1.Vector2(x, y), width, height) && this.isPointInRect(new vector_1.Vector2(x, y), points)) {
                    const depth = this.position.z;
                    if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]) {
                        buffer[y][x] = this.color;
                        depthBuffer[y][x] = depth;
                    }
                }
            }
        }
    }
    isPointInRect(point, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x;
            const yi = vertices[i].y;
            const xj = vertices[j].x;
            const yj = vertices[j].y;
            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect)
                inside = !inside;
        }
        return inside;
    }
}
exports.Rect = Rect;
