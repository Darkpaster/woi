import {SimulationObject} from "./simulationObject.ts";
import {Vector2D} from "../../../../utils/math/2d.ts";

export namespace Fluids {
    /**
     * Класс для симуляции течения жидкости
     */
    export class FluidFlow extends SimulationObject {
        private width: number;
        private height: number;
        private particleCount: number;
        private particles: FluidParticle[] = [];
        private flowRate: number;
        private gravity: number = 9.81;
        private obstacles: Obstacle[] = [];

        constructor(x: number, y: number, width: number, height: number, particleCount: number = 100, flowRate: number = 5) {
            super(x, y);
            this.width = width;
            this.height = height;
            this.particleCount = particleCount;
            this.flowRate = flowRate;

            this.initializeParticles();
            this.saveInitialState();
        }

        private initializeParticles(): void {
            for (let i = 0; i < this.particleCount; i++) {
                this.addParticle();
            }
        }

        private addParticle(): void {
            // Создание частицы в верхней части симуляции с случайным x координатой
            const x = this.position.x + Math.random() * this.width;
            const y = this.position.y;

            const particle = {
                x,
                y,
                vx: (Math.random() - 0.5) * 10,
                vy: Math.random() * 10,
                radius: 2 + Math.random() * 2,
                color: `rgba(0, 100, 255, ${0.5 + Math.random() * 0.5})`
            };

            this.particles.push(particle);
        }

        public addObstacle(obstacle: Obstacle): void {
            this.obstacles.push(obstacle);
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                width: this.width,
                height: this.height,
                particleCount: this.particleCount,
                flowRate: this.flowRate
            };
        }

        public reset(): void {
            super.reset();
            this.width = this.initialState.width;
            this.height = this.initialState.height;
            this.particleCount = this.initialState.particleCount;
            this.flowRate = this.initialState.flowRate;

            this.particles = [];
            this.initializeParticles();
        }

        public update(deltaTime: number): void {
            // Обновляем все частицы
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Применяем гравитацию
                p.vy += this.gravity * deltaTime;

                // Применяем сопротивление воздуха
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Обработка столкновений с препятствиями
                for (const obstacle of this.obstacles) {
                    if (obstacle.collidesWith(p.x, p.y, p.radius)) {
                        const normal = obstacle.getNormalAt(p.x, p.y);

                        // Отражение скорости от препятствия
                        const dot = p.vx * normal.x + p.vy * normal.y;
                        p.vx = p.vx - 2 * dot * normal.x;
                        p.vy = p.vy - 2 * dot * normal.y;

                        // Уменьшение скорости из-за трения
                        p.vx *= 0.8;
                        p.vy *= 0.8;
                    }
                }

                // Обновляем позицию
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;

                // Проверяем границы
                if (p.x < this.position.x) {
                    p.x = this.position.x;
                    p.vx = -p.vx * 0.8;
                } else if (p.x > this.position.x + this.width) {
                    p.x = this.position.x + this.width;
                    p.vx = -p.vx * 0.8;
                }

                if (p.y < this.position.y) {
                    p.y = this.position.y;
                    p.vy = -p.vy * 0.5;
                } else if (p.y > this.position.y + this.height) {
                    // Если частица вышла за нижнюю границу, перемещаем ее обратно вверх
                    p.x = this.position.x + Math.random() * this.width;
                    p.y = this.position.y;
                    p.vx = (Math.random() - 0.5) * 10;
                    p.vy = Math.random() * this.flowRate;
                }
            }
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Рисуем границы области симуляции
            ctx.beginPath();
            ctx.rect(this.position.x, this.position.y, this.width, this.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем препятствия
            for (const obstacle of this.obstacles) {
                obstacle.render(ctx);
            }

            // Рисуем частицы
            for (const p of this.particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        }

        public isPointInside(x: number, y: number): boolean {
            return (
                x >= this.position.x &&
                x <= this.position.x + this.width &&
                y >= this.position.y &&
                y <= this.position.y + this.height
            );
        }

        public setFlowRate(rate: number): void {
            this.flowRate = rate;
        }

        public getFlowRate(): number {
            return this.flowRate;
        }

        public setGravity(gravity: number): void {
            this.gravity = gravity;
        }

        public getGravity(): number {
            return this.gravity;
        }
    }

    /**
     * Интерфейс для частицы жидкости
     */
    interface FluidParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        color: string;
    }

    /**
     * Абстрактный класс для препятствий в потоке жидкости
     */
    export abstract class Obstacle {
        protected position: Vector2D;

        constructor(x: number, y: number) {
            this.position = new Vector2D(x, y);
        }

        public getPosition(): Vector2D {
            return this.position;
        }

        public setPosition(x: number, y: number): void {
            this.position = new Vector2D(x, y);
        }

        public abstract collidesWith(x: number, y: number, radius: number): boolean;
        public abstract getNormalAt(x: number, y: number): Vector2D;
        public abstract render(ctx: CanvasRenderingContext2D): void;
    }

    /**
     * Класс для круглого препятствия
     */
    export class CircularObstacle extends Obstacle {
        private radius: number;

        constructor(x: number, y: number, radius: number) {
            super(x, y);
            this.radius = radius;
        }

        public collidesWith(x: number, y: number, particleRadius: number): boolean {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance < (this.radius + particleRadius);
        }

        public getNormalAt(x: number, y: number): Vector2D {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) {
                return new Vector2D(1, 0); // Возвращаем произвольное направление, если точка в центре
            }

            return new Vector2D(dx / distance,dy / distance);
        }

        public render(ctx: CanvasRenderingContext2D): void {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#666';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    /**
     * Класс для прямоугольного препятствия
     */
    export class RectangularObstacle extends Obstacle {
        private width: number;
        private height: number;

        constructor(x: number, y: number, width: number, height: number) {
            super(x, y);
            this.width = width;
            this.height = height;
        }

        public collidesWith(x: number, y: number, particleRadius: number): boolean {
            // Находим ближайшую точку прямоугольника к частице
            const nearestX = Math.max(this.position.x, Math.min(x, this.position.x + this.width));
            const nearestY = Math.max(this.position.y, Math.min(y, this.position.y + this.height));

            // Рассчитываем расстояние между частицей и ближайшей точкой
            const dx = x - nearestX;
            const dy = y - nearestY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance < particleRadius;
        }

        public getNormalAt(x: number, y: number): Vector2D {
            // Находим ближайшую точку прямоугольника к частице
            const nearestX = Math.max(this.position.x, Math.min(x, this.position.x + this.width));
            const nearestY = Math.max(this.position.y, Math.min(y, this.position.y + this.height));

            // Рассчитываем вектор от ближайшей точки к частице
            const dx = x - nearestX;
            const dy = y - nearestY;

            // Если частица находится на углу, возвращаем нормализованный вектор
            if (dx !== 0 && dy !== 0) {
                const distance = Math.sqrt(dx * dx + dy * dy);

                return new Vector2D(dx / distance,dy / distance);
            }

            // Если частица находится на вертикальной стороне

            if (dx === 0) {
                return new Vector2D(0,dy > 0 ? 1 : -1);
            }

            // Если частица находится на горизонтальной стороне

            return new Vector2D(dx > 0 ? 1 : -1,0);
        }

        public render(ctx: CanvasRenderingContext2D): void {
            ctx.beginPath();
            ctx.rect(this.position.x, this.position.y, this.width, this.height);
            ctx.fillStyle = '#666';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}