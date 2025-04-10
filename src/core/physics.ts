import { Vector3 } from '../math/vector';
import { Primitive } from '../primitives/base';

export interface PhysicsObject {
    primitive: Primitive;
    position: Vector3;
    velocity: Vector3;
    acceleration: Vector3;
    mass: number;
    radius: number;
    isFixed: boolean;
}

export class PhysicsSystem {
    private objects: PhysicsObject[] = [];
    private gravity: number;
    private elasticity: number;
    private collisionDamping: number;
    
    constructor(gravity: number = 0.01, elasticity: number = 0.8, collisionDamping: number = 0.9) {
        this.gravity = gravity;
        this.elasticity = elasticity;
        this.collisionDamping = collisionDamping;
    }
    
    addObject(object: PhysicsObject): void {
        this.objects.push(object);
    }
    
    removeObject(object: PhysicsObject): void {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.objects.splice(index, 1);
        }
    }
    
    update(deltaTime: number): void {
        this.applyGravity();
        this.integrateForces(deltaTime);
        this.detectCollisions();
        this.updatePrimitives();
    }
    
    private applyGravity(): void {
        const len = this.objects.length;
        
        for (let i = 0; i < len; i++) {
            const objA = this.objects[i];
            if (objA.isFixed) continue;
            
            objA.acceleration = Vector3.zero();
            
            for (let j = 0; j < len; j++) {
                if (i === j) continue;
                
                const objB = this.objects[j];
                const direction = objB.position.subtract(objA.position);
                const distance = direction.length();
                
                if (distance < 0.001) continue;
                
                const forceMagnitude = this.gravity * (objA.mass * objB.mass) / (distance * distance);
                const force = direction.normalize().multiply(forceMagnitude);
                
                objA.acceleration = objA.acceleration.add(force.multiply(1 / objA.mass));
            }
        }
    }
    
    private integrateForces(deltaTime: number): void {
        for (const obj of this.objects) {
            if (obj.isFixed) continue;
            
            obj.velocity = obj.velocity.add(obj.acceleration.multiply(deltaTime));
            obj.position = obj.position.add(obj.velocity.multiply(deltaTime));
        }
    }
    
    private detectCollisions(): void {
        const len = this.objects.length;
        
        for (let i = 0; i < len; i++) {
            const objA = this.objects[i];
            if (objA.isFixed) continue;
            
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
    
    private resolveCollision(objA: PhysicsObject, objB: PhysicsObject, distance: number, minDistance: number): void {
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
        } else {
            const totalMass = objA.mass + objB.mass;
            const massFactor1 = (2 * objB.mass) / totalMass;
            const massFactor2 = (2 * objA.mass) / totalMass;
            
            const relativeVelocity = objA.velocity.subtract(objB.velocity);
            const dot = relativeVelocity.dot(direction);
            
            if (dot > 0) return;
            
            const impulseMagnitude = -dot;
            
            const impulse1 = direction.multiply(impulseMagnitude * massFactor1 * this.elasticity);
            const impulse2 = direction.multiply(-impulseMagnitude * massFactor2 * this.elasticity);
            
            objA.velocity = objA.velocity.add(impulse1).multiply(this.collisionDamping);
            objB.velocity = objB.velocity.add(impulse2).multiply(this.collisionDamping);
        }
    }
    
    private updatePrimitives(): void {
        for (const obj of this.objects) {
            obj.primitive.setPosition(obj.position);
        }
    }
} 