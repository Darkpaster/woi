import {SimulationObject} from "./simulationObject.ts";

export namespace Mechanics {
    /**
     * Класс для симуляции маятника
     */
    export class Pendulum extends SimulationObject {
        private length: number;
        private mass: number;
        private angle: number;
        private angularVelocity: number = 0;
        private damping: number = 0.05;

        private readonly gravity: number = 9.81;

        constructor(x: number, y: number, length: number, mass: number, initialAngle: number = Math.PI / 4) {
            super(x, y);
            this.length = length;
            this.mass = mass;
            this.angle = initialAngle;

            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                length: this.length,
                mass: this.mass,
                angle: this.angle,
                angularVelocity: this.angularVelocity
            };
        }

        public reset(): void {
            super.reset();
            this.length = this.initialState.length;
            this.mass = this.initialState.mass;
            this.angle = this.initialState.angle;
            this.angularVelocity = this.initialState.angularVelocity;
        }

        public update(deltaTime: number): void {
            // Физика маятника: d²θ/dt² = -(g/L)sin(θ) - (b/m)(dθ/dt)
            const angularAcceleration = -(this.gravity / this.length) * Math.sin(this.angle) -
                (this.damping / this.mass) * this.angularVelocity;

            this.angularVelocity += angularAcceleration * deltaTime;
            this.angle += this.angularVelocity * deltaTime;
        }

        public render(ctx: CanvasRenderingContext2D): void {
            const bobX = this.position.x + this.length * Math.sin(this.angle);
            const bobY = this.position.y + this.length * Math.cos(this.angle);

            // Рисуем стержень
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(bobX, bobY);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем точку подвеса
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#666';
            ctx.fill();

            // Рисуем груз
            const bobRadius = 10 * Math.sqrt(this.mass);
            ctx.beginPath();
            ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#C25';
            ctx.fill();
        }

        public isPointInside(x: number, y: number): boolean {
            const bobX = this.position.x + this.length * Math.sin(this.angle);
            const bobY = this.position.y + this.length * Math.cos(this.angle);
            const bobRadius = 10 * Math.sqrt(this.mass);

            const dx = x - bobX;
            const dy = y - bobY;
            return (dx * dx + dy * dy) <= (bobRadius * bobRadius);
        }

        public setDamping(damping: number): void {
            this.damping = damping;
        }

        public getLength(): number {
            return this.length;
        }

        public setLength(length: number): void {
            this.length = length;
        }

        public getMass(): number {
            return this.mass;
        }

        public setMass(mass: number): void {
            this.mass = mass;
        }
    }

    /**
     * Класс для симуляции пружины
     */
    export class Spring extends SimulationObject {
        private stiffness: number;
        private restLength: number;
        private mass: number;
        private displacement: number;
        private velocity: number = 0;
        private damping: number = 0.1;
        private orientation: 'horizontal' | 'vertical';

        constructor(
            x: number,
            y: number,
            stiffness: number,
            restLength: number,
            mass: number,
            initialDisplacement: number = 0,
            orientation: 'horizontal' | 'vertical' = 'horizontal'
        ) {
            super(x, y);
            this.stiffness = stiffness;
            this.restLength = restLength;
            this.mass = mass;
            this.displacement = initialDisplacement;
            this.orientation = orientation;

            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                stiffness: this.stiffness,
                restLength: this.restLength,
                mass: this.mass,
                displacement: this.displacement,
                velocity: this.velocity,
                orientation: this.orientation
            };
        }

        public reset(): void {
            super.reset();
            this.stiffness = this.initialState.stiffness;
            this.restLength = this.initialState.restLength;
            this.mass = this.initialState.mass;
            this.displacement = this.initialState.displacement;
            this.velocity = this.initialState.velocity;
            this.orientation = this.initialState.orientation;
        }

        public update(deltaTime: number): void {
            // Физика пружины: m(d²x/dt²) = -kx - b(dx/dt)
            const force = -this.stiffness * this.displacement - this.damping * this.velocity;
            const acceleration = force / this.mass;

            this.velocity += acceleration * deltaTime;
            this.displacement += this.velocity * deltaTime;
        }

        public render(ctx: CanvasRenderingContext2D): void {
            const numCoils = 10;
            const coilWidth = this.restLength / numCoils;
            const amplitude = 15; // Амплитуда волн пружины

            // Координаты конца пружины с учетом смещения
            let endX = this.position.x;
            let endY = this.position.y;

            if (this.orientation === 'horizontal') {
                endX += this.restLength + this.displacement;
            } else {
                endY += this.restLength + this.displacement;
            }

            // Рисуем пружину
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);

            if (this.orientation === 'horizontal') {
                for (let i = 0; i <= numCoils; i++) {
                    const x = this.position.x + (i * coilWidth * (this.restLength + this.displacement) / this.restLength);
                    const y = this.position.y + (i % 2 === 0 ? amplitude : -amplitude);

                    if (i === 0) {
                        ctx.lineTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            } else {
                for (let i = 0; i <= numCoils; i++) {
                    const x = this.position.x + (i % 2 === 0 ? amplitude : -amplitude);
                    const y = this.position.y + (i * coilWidth * (this.restLength + this.displacement) / this.restLength);

                    if (i === 0) {
                        ctx.lineTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            }

            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем точку крепления
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#666';
            ctx.fill();

            // Рисуем груз
            const massRadius = 10 * Math.sqrt(this.mass);
            ctx.beginPath();
            ctx.arc(endX, endY, massRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#47A';
            ctx.fill();
        }

        public isPointInside(x: number, y: number): boolean {
            let endX = this.position.x;
            let endY = this.position.y;

            if (this.orientation === 'horizontal') {
                endX += this.restLength + this.displacement;
            } else {
                endY += this.restLength + this.displacement;
            }

            const massRadius = 10 * Math.sqrt(this.mass);
            const dx = x - endX;
            const dy = y - endY;

            return (dx * dx + dy * dy) <= (massRadius * massRadius);
        }

        public getDisplacement(): number {
            return this.displacement;
        }

        public setDisplacement(displacement: number): void {
            this.displacement = displacement;
            this.velocity = 0;
        }

        public setStiffness(stiffness: number): void {
            this.stiffness = stiffness;
        }

        public setDamping(damping: number): void {
            this.damping = damping;
        }
    }

    /**
     * Класс для симуляции колеса
     */
    export class Wheel extends SimulationObject {
        private radius: number;
        private spokes: number;
        private angle: number = 0;
        private angularVelocity: number = 0;
        private torque: number = 0;
        private inertia: number;
        private friction: number = 0.05;

        constructor(x: number, y: number, radius: number, spokes: number = 8) {
            super(x, y);
            this.radius = radius;
            this.spokes = spokes;
            this.inertia = 0.5 * radius * radius; // I = 0.5 * m * r^2 (для диска, принимаем массу = 1)

            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                radius: this.radius,
                spokes: this.spokes,
                angle: this.angle,
                angularVelocity: this.angularVelocity,
                torque: this.torque
            };
        }

        public reset(): void {
            super.reset();
            this.radius = this.initialState.radius;
            this.spokes = this.initialState.spokes;
            this.angle = this.initialState.angle;
            this.angularVelocity = this.initialState.angularVelocity;
            this.torque = this.initialState.torque;
        }

        public update(deltaTime: number): void {
            // Вращательная динамика: I(dω/dt) = τ - bω
            const angularAcceleration = (this.torque - this.friction * this.angularVelocity) / this.inertia;

            this.angularVelocity += angularAcceleration * deltaTime;
            this.angle += this.angularVelocity * deltaTime;

            // Нормализация угла для предотвращения очень больших значений
            this.angle = this.angle % (2 * Math.PI);
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Рисуем обод колеса
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Рисуем спицы
            for (let i = 0; i < this.spokes; i++) {
                const spokeAngle = this.angle + (i * Math.PI * 2) / this.spokes;
                const endX = this.position.x + this.radius * Math.cos(spokeAngle);
                const endY = this.position.y + this.radius * Math.sin(spokeAngle);

                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Рисуем центр колеса
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();

            // Добавим метку для наглядности вращения
            const markerAngle = this.angle;
            const markerX = this.position.x + (this.radius - 5) * Math.cos(markerAngle);
            const markerY = this.position.y + (this.radius - 5) * Math.sin(markerAngle);

            ctx.beginPath();
            ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#E33';
            ctx.fill();
        }

        public isPointInside(x: number, y: number): boolean {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            const distanceSquared = dx * dx + dy * dy;

            return distanceSquared <= (this.radius * this.radius);
        }

        public applyTorque(torque: number): void {
            this.torque = torque;
        }

        public setAngularVelocity(velocity: number): void {
            this.angularVelocity = velocity;
        }

        public getAngularVelocity(): number {
            return this.angularVelocity;
        }

        public getAngle(): number {
            return this.angle;
        }

        public setFriction(friction: number): void {
            this.friction = friction;
        }
    }
}