"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Line = void 0;
const vector_1 = require("../math/vector");
const base_1 = require("./base");
class Line extends base_1.BasePrimitive {
    constructor(start, end, color = '#') {
        super(vector_1.Vector3.zero(), vector_1.Vector3.one(), vector_1.Vector3.zero(), color);
        this.start = start;
        this.end = end;
    }
    transform(matrix) {
        super.transform(matrix);
        this.start = matrix.multiplyVector(this.start);
        this.end = matrix.multiplyVector(this.end);
    }
    render(buffer, width, height, depthBuffer) {
        const transformedStart = new vector_1.Vector2(this.start.x, this.start.y);
        const transformedEnd = new vector_1.Vector2(this.end.x, this.end.y);
        const startPoint = this.screenToBufferCoord(transformedStart, width, height);
        const endPoint = this.screenToBufferCoord(transformedEnd, width, height);
        this.drawLine(buffer, startPoint, endPoint, width, height, depthBuffer);
    }
    drawLine(buffer, start, end, width, height, depthBuffer) {
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const sx = start.x < end.x ? 1 : -1;
        const sy = start.y < end.y ? 1 : -1;
        let err = dx - dy;
        let x = Math.round(start.x);
        let y = Math.round(start.y);
        const startDepth = this.start.z;
        const endDepth = this.end.z;
        const totalDist = Math.sqrt(dx * dx + dy * dy);
        while (true) {
            if (this.isInBounds(new vector_1.Vector2(x, y), width, height)) {
                const distFromStart = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
                const t = totalDist === 0 ? 0 : distFromStart / totalDist;
                const depth = startDepth * (1 - t) + endDepth * t;
                if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]) {
                    buffer[y][x] = this.color;
                    depthBuffer[y][x] = depth;
                }
            }
            if (x === Math.round(end.x) && y === Math.round(end.y))
                break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }
}
exports.Line = Line;
