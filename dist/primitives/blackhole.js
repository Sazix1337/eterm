"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackHole = void 0;
const vector_1 = require("../math/vector");
const matrix_1 = require("../math/matrix");
const base_1 = require("./base");
class BlackHole extends base_1.BasePrimitive {
    constructor(position, radius = 1, innerChar = '@', outerChar = '#', accretionDiskChar = '.', showAccretionDisk = true) {
        super(position, vector_1.Vector3.one(), vector_1.Vector3.zero(), innerChar);
        this.radius = radius;
        this.innerChar = innerChar;
        this.outerChar = outerChar;
        this.accretionDiskChar = accretionDiskChar;
        this.showAccretionDisk = showAccretionDisk;
    }
    render(buffer, width, height, depthBuffer) {
        const transformMatrix = this.getTransformMatrix();
        const centerPoint = transformMatrix.multiplyVector(vector_1.Vector3.zero());
        const screenCenter = this.screenToBufferCoord(new vector_1.Vector2(centerPoint.x, centerPoint.y), width, height);
        const transformedRadius = this.radius * this.scale.x;
        const screenRadius = Math.round(transformedRadius * width / 4);
        const innerRadius = Math.max(1, Math.round(screenRadius * 0.6));
        const accretionDiskRadius = Math.round(screenRadius * 1.5);
        if (this.showAccretionDisk) {
            this.renderAccretionDisk(buffer, screenCenter, innerRadius, accretionDiskRadius, width, height, depthBuffer, centerPoint.z);
        }
        this.renderBlackHoleCore(buffer, screenCenter, innerRadius, screenRadius, width, height, depthBuffer, centerPoint.z);
    }
    renderAccretionDisk(buffer, center, innerRadius, outerRadius, width, height, depthBuffer, depth) {
        const rotationMatrix = matrix_1.Matrix4.rotationX(Math.PI / 4);
        for (let y = center.y - outerRadius; y <= center.y + outerRadius; y++) {
            for (let x = center.x - outerRadius; x <= center.x + outerRadius; x++) {
                if (!this.isInBounds(new vector_1.Vector2(x, y), width, height))
                    continue;
                const dx = x - center.x;
                const dy = y - center.y;
                const distanceSquared = dx * dx + dy * dy;
                if (distanceSquared > innerRadius * innerRadius && distanceSquared <= outerRadius * outerRadius) {
                    const distance = Math.sqrt(distanceSquared);
                    // Apply rotation to create the disk tilt effect
                    const point3D = rotationMatrix.multiplyVector(new vector_1.Vector3(dx, 0, dy));
                    // Only draw if the point is close to the x-z plane (disk is thin)
                    if (Math.abs(point3D.y) < 0.3) {
                        const adjustedDepth = depth + point3D.y;
                        if (depthBuffer[y][x] === undefined || adjustedDepth < depthBuffer[y][x]) {
                            // Vary the character based on distance
                            const intensity = 1 - (distance - innerRadius) / (outerRadius - innerRadius);
                            buffer[y][x] = intensity > 0.7 ? this.accretionDiskChar : (intensity > 0.3 ? '·' : '·');
                            depthBuffer[y][x] = adjustedDepth;
                        }
                    }
                }
            }
        }
    }
    renderBlackHoleCore(buffer, center, innerRadius, outerRadius, width, height, depthBuffer, depth) {
        for (let y = center.y - outerRadius; y <= center.y + outerRadius; y++) {
            for (let x = center.x - outerRadius; x <= center.x + outerRadius; x++) {
                if (!this.isInBounds(new vector_1.Vector2(x, y), width, height))
                    continue;
                const dx = x - center.x;
                const dy = y - center.y;
                const distanceSquared = dx * dx + dy * dy;
                if (distanceSquared <= outerRadius * outerRadius) {
                    const isInner = distanceSquared <= innerRadius * innerRadius;
                    if (depthBuffer[y][x] === undefined || depth < depthBuffer[y][x]) {
                        buffer[y][x] = isInner ? this.innerChar : this.outerChar;
                        depthBuffer[y][x] = depth;
                    }
                }
            }
        }
    }
}
exports.BlackHole = BlackHole;
