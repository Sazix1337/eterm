"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsSystem = void 0;
const vector_1 = require("../math/vector");
class PhysicsSystem {
    constructor(gravity = 0.01, elasticity = 0.8, collisionDamping = 0.9) {
        this.objects = [];
        this.gravity = gravity;
        this.elasticity = elasticity;
        this.collisionDamping = collisionDamping;
    }
    addObject(object) {
        this.objects.push(object);
    }
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.objects.splice(index, 1);
        }
    }
    update(deltaTime) {
        this.applyGravity();
        this.integrateForces(deltaTime);
        this.detectCollisions();
        this.updatePrimitives();
    }
    applyGravity() {
        const len = this.objects.length;
        for (let i = 0; i < len; i++) {
            const objA = this.objects[i];
            if (objA.isFixed)
                continue;
            objA.acceleration = vector_1.Vector3.zero();
            for (let j = 0; j < len; j++) {
                if (i === j)
                    continue;
                const objB = this.objects[j];
                const direction = objB.position.subtract(objA.position);
                const distance = direction.length();
                if (distance < 0.001)
                    continue;
                const forceMagnitude = this.gravity * (objA.mass * objB.mass) / (distance * distance);
                const force = direction.normalize().multiply(forceMagnitude);
                objA.acceleration = objA.acceleration.add(force.multiply(1 / objA.mass));
            }
        }
    }
    integrateForces(deltaTime) {
        for (const obj of this.objects) {
            if (obj.isFixed)
                continue;
            obj.velocity = obj.velocity.add(obj.acceleration.multiply(deltaTime));
            obj.position = obj.position.add(obj.velocity.multiply(deltaTime));
        }
    }
    detectCollisions() {
        const len = this.objects.length;
        for (let i = 0; i < len; i++) {
            const objA = this.objects[i];
            if (objA.isFixed)
                continue;
            for (let j = i + 1; j < len; j++) {
                const objB = this.objects[j];
                const distance = objA.position.subtract(objB.position).length();
                const minDistance = objA.radius + objB.radius;
                if (distance < minDistance) {
                    this.resolveCollision(objA, objB, distance, minDistance);
                }
            }
        }
    }
    resolveCollision(objA, objB, distance, minDistance) {
        const direction = objA.position.subtract(objB.position).normalize();
        const correction = direction.multiply((minDistance - distance) / 2);
        if (!objA.isFixed) {
            objA.position = objA.position.add(correction);
        }
        if (!objB.isFixed) {
            objB.position = objB.position.subtract(correction);
        }
        if (objA.isFixed || objB.isFixed) {
            const fixedObj = objA.isFixed ? objA : objB;
            const movingObj = objA.isFixed ? objB : objA;
            const sign = objA.isFixed ? -1 : 1;
            const reflectionDirection = direction.multiply(sign);
            const dotProduct = movingObj.velocity.dot(reflectionDirection);
            const reflection = reflectionDirection.multiply(2 * dotProduct);
            movingObj.velocity = movingObj.velocity.subtract(reflection).multiply(this.elasticity);
            movingObj.velocity = movingObj.velocity.multiply(this.collisionDamping);
        }
        else {
            const totalMass = objA.mass + objB.mass;
            const massFactor1 = (2 * objB.mass) / totalMass;
            const massFactor2 = (2 * objA.mass) / totalMass;
            const relativeVelocity = objA.velocity.subtract(objB.velocity);
            const dot = relativeVelocity.dot(direction);
            if (dot > 0)
                return;
            const impulseMagnitude = -dot;
            const impulse1 = direction.multiply(impulseMagnitude * massFactor1 * this.elasticity);
            const impulse2 = direction.multiply(-impulseMagnitude * massFactor2 * this.elasticity);
            objA.velocity = objA.velocity.add(impulse1).multiply(this.collisionDamping);
            objB.velocity = objB.velocity.add(impulse2).multiply(this.collisionDamping);
        }
    }
    updatePrimitives() {
        for (const obj of this.objects) {
            obj.primitive.setPosition(obj.position);
        }
    }
}
exports.PhysicsSystem = PhysicsSystem;
