"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cube = void 0;
const vector_1 = require("../math/vector");
const base_1 = require("./base");
const line_1 = require("./line");
class Cube extends base_1.BasePrimitive {
    constructor(position, size = 1, wireframe = true, color = '#') {
        super(position, vector_1.Vector3.one(), vector_1.Vector3.zero(), color);
        this.size = size;
        this.wireframe = wireframe;
    }
    render(buffer, width, height, depthBuffer) {
        const halfSize = this.size / 2;
        const transformMatrix = this.getTransformMatrix();
        const vertices = [
            transformMatrix.multiplyVector(new vector_1.Vector3(-halfSize, -halfSize, -halfSize)),
            transformMatrix.multiplyVector(new vector_1.Vector3(halfSize, -halfSize, -halfSize)),
            transformMatrix.multiplyVector(new vector_1.Vector3(halfSize, halfSize, -halfSize)),
            transformMatrix.multiplyVector(new vector_1.Vector3(-halfSize, halfSize, -halfSize)),
            transformMatrix.multiplyVector(new vector_1.Vector3(-halfSize, -halfSize, halfSize)),
            transformMatrix.multiplyVector(new vector_1.Vector3(halfSize, -halfSize, halfSize)),
            transformMatrix.multiplyVector(new vector_1.Vector3(halfSize, halfSize, halfSize)),
            transformMatrix.multiplyVector(new vector_1.Vector3(-halfSize, halfSize, halfSize))
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
                const line = new line_1.Line(vertices[a], vertices[b], this.color);
                line.render(buffer, width, height, depthBuffer);
            }
        }
        else {
            this.renderFaces(buffer, vertices, faces, width, height, depthBuffer);
        }
    }
    renderFaces(buffer, vertices, faces, width, height, depthBuffer) {
        for (const face of faces) {
            const faceVertices = face.map(i => vertices[i]);
            const centroid = faceVertices.reduce((acc, vertex) => acc.add(vertex), vector_1.Vector3.zero()).divide(faceVertices.length);
            const normal = this.calculateFaceNormal(faceVertices[0], faceVertices[1], faceVertices[2]);
            const viewDirection = new vector_1.Vector3(0, 0, -1);
            if (normal.dot(viewDirection) < 0) {
                this.fillFace(buffer, faceVertices, width, height, depthBuffer);
            }
        }
    }
    calculateFaceNormal(a, b, c) {
        const edge1 = b.subtract(a);
        const edge2 = c.subtract(a);
        return edge1.cross(edge2).normalize();
    }
    fillFace(buffer, vertices, width, height, depthBuffer) {
        const screenPoints = vertices.map(v => this.screenToBufferCoord(v.toVector2(), width, height));
        const minX = Math.min(...screenPoints.map(p => p.x));
        const maxX = Math.max(...screenPoints.map(p => p.x));
        const minY = Math.min(...screenPoints.map(p => p.y));
        const maxY = Math.max(...screenPoints.map(p => p.y));
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!this.isInBounds(new vector_1.Vector2(x, y), width, height))
                    continue;
                if (this.isPointInPolygon(new vector_1.Vector2(x, y), screenPoints)) {
                    const depth = this.interpolateDepth(new vector_1.Vector2(x, y), vertices, screenPoints);
                    if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]) {
                        buffer[y][x] = this.color;
                        depthBuffer[y][x] = depth;
                    }
                }
            }
        }
    }
    isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const intersect = ((polygon[i].y > point.y) !== (polygon[j].y > point.y))
                && (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x);
            if (intersect)
                inside = !inside;
        }
        return inside;
    }
    interpolateDepth(point, vertices, screenPoints) {
        const weights = screenPoints.map(p => {
            const d = Math.sqrt(Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2));
            return d === 0 ? 1 : 1 / d;
        });
        const weightSum = weights.reduce((sum, w) => sum + w, 0);
        if (weightSum === 0)
            return vertices[0].z;
        const depth = vertices.reduce((sum, vertex, i) => sum + vertex.z * weights[i], 0) / weightSum;
        return depth;
    }
}
exports.Cube = Cube;
