"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sphere = void 0;
const vector_1 = require("../math/vector");
const base_1 = require("./base");
class Sphere extends base_1.BasePrimitive {
    constructor(position, radius = 1, resolution = 16, filled = false, color = '#') {
        super(position, vector_1.Vector3.one(), vector_1.Vector3.zero(), color);
        this.radius = radius;
        this.resolution = resolution;
        this.filled = filled;
        this.lightSource = new vector_1.Vector3(-1, 2, -4).normalize();
        this.lightIntensity = 2.0;
    }
    render(buffer, width, height, depthBuffer) {
        const transformMatrix = this.getTransformMatrix();
        if (this.filled) {
            this.renderFilledSphere(buffer, transformMatrix, width, height, depthBuffer);
        }
        else {
            this.renderWireframeSphere(buffer, transformMatrix, width, height, depthBuffer);
        }
    }
    renderWireframeSphere(buffer, transformMatrix, width, height, depthBuffer) {
        const points = [];
        for (let i = 0; i <= this.resolution; i++) {
            const lat = Math.PI * (-0.5 + i / this.resolution);
            const cosLat = Math.cos(lat);
            const sinLat = Math.sin(lat);
            for (let j = 0; j <= this.resolution; j++) {
                const lon = 2 * Math.PI * j / this.resolution;
                const cosLon = Math.cos(lon);
                const sinLon = Math.sin(lon);
                const x = this.radius * cosLat * cosLon;
                const y = this.radius * sinLat;
                const z = this.radius * cosLat * sinLon;
                points.push(transformMatrix.multiplyVector(new vector_1.Vector3(x, y, z)));
            }
        }
        const drawPoint = (point) => {
            if (point.z >= 0) {
                const screenPoint = this.screenToBufferCoord(new vector_1.Vector2(point.x, point.y), width, height);
                if (this.isInBounds(screenPoint, width, height)) {
                    const x = Math.round(screenPoint.x);
                    const y = Math.round(screenPoint.y);
                    if (depthBuffer[y][x] === undefined || point.z < depthBuffer[y][x]) {
                        buffer[y][x] = this.color;
                        depthBuffer[y][x] = point.z;
                    }
                }
            }
        };
        for (const point of points) {
            drawPoint(point);
        }
    }
    renderFilledSphere(buffer, transformMatrix, width, height, depthBuffer) {
        const centerPoint = transformMatrix.multiplyVector(vector_1.Vector3.zero());
        const screenCenter = this.screenToBufferCoord(new vector_1.Vector2(centerPoint.x, centerPoint.y), width, height);
        const transformedRadius = this.radius * this.scale.x;
        const screenRadius = Math.round(transformedRadius * width / 2);
        for (let y = screenCenter.y - screenRadius; y <= screenCenter.y + screenRadius; y++) {
            for (let x = screenCenter.x - screenRadius; x <= screenCenter.x + screenRadius; x++) {
                if (!this.isInBounds(new vector_1.Vector2(x, y), width, height))
                    continue;
                const dx = x - screenCenter.x;
                const dy = y - screenCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= screenRadius) {
                    const normalizedDistance = distance / screenRadius;
                    const z = Math.sqrt(1 - normalizedDistance * normalizedDistance);
                    const sphereNormal = new vector_1.Vector3(dx / (distance || 1), dy / (distance || 1), z).normalize();
                    const depth = centerPoint.z - z * transformedRadius;
                    if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]) {
                        const rawDotProduct = sphereNormal.dot(this.lightSource);
                        const adjustedDot = Math.pow(Math.max(0.1, rawDotProduct), 1 / this.lightIntensity);
                        let shadingChar;
                        if (adjustedDot > 0.85)
                            shadingChar = this.color;
                        else if (adjustedDot > 0.7)
                            shadingChar = 'O';
                        else if (adjustedDot > 0.5)
                            shadingChar = 'o';
                        else if (adjustedDot > 0.3)
                            shadingChar = ':';
                        else if (adjustedDot > 0.15)
                            shadingChar = '.';
                        else
                            shadingChar = ' ';
                        buffer[y][x] = shadingChar;
                        depthBuffer[y][x] = depth;
                    }
                }
            }
        }
    }
    setLightSource(light) {
        const intensity = light.length();
        this.lightIntensity = intensity;
        this.lightSource = light.normalize();
    }
}
exports.Sphere = Sphere;
