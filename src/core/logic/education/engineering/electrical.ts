import {Vector2D} from "../../../../utils/math/2d.ts";
import {SimulationObject} from "./simulationObject.ts";

export namespace Electrical {
    /**
     * Класс для симуляции простой электрической цепи
     */
    export class CircuitSimulation extends SimulationObject {
        private voltage: number;
        private resistance: number;
        private isOn: boolean = false;
        private components: CircuitComponent[] = [];

        constructor(x: number, y: number, voltage: number = 9, resistance: number = 100) {
            super(x, y);
            this.voltage = voltage;
            this.resistance = resistance;

            this.saveInitialState();
        }

        public addComponent(component: CircuitComponent): void {
            this.components.push(component);
            component.setCircuit(this);
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                voltage: this.voltage,
                resistance: this.resistance,
                isOn: this.isOn
            };
        }

        public reset(): void {
            super.reset();
            this.voltage = this.initialState.voltage;
            this.resistance = this.initialState.resistance;
            this.isOn = this.initialState.isOn;
        }

        public update(deltaTime: number): void {
            this.components.forEach(component => {
                component.update(deltaTime, this.isOn ? this.voltage : 0, this.resistance);
            });
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Рисуем батарею
            const batteryWidth = 40;
            const batteryHeight = 20;

            ctx.beginPath();
            ctx.rect(this.position.x, this.position.y, batteryWidth, batteryHeight);
            ctx.fillStyle = this.isOn ? '#5A3' : '#999';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем + и - на батарее
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            ctx.fillText('+', this.position.x + batteryWidth - 12, this.position.y + 15);
            ctx.fillText('-', this.position.x + 6, this.position.y + 15);

            // Значение напряжения
            ctx.font = '12px Arial';
            ctx.fillText(`${this.voltage}V`, this.position.x, this.position.y - 5);

            // Рисуем компоненты
            this.components.forEach(component => {
                component.render(ctx);
            });
        }

        public isPointInside(x: number, y: number): boolean {
            const batteryWidth = 40;
            const batteryHeight = 20;

            return (
                x >= this.position.x &&
                x <= this.position.x + batteryWidth &&
                y >= this.position.y &&
                y <= this.position.y + batteryHeight
            );
        }

        public togglePower(): void {
            this.isOn = !this.isOn;
        }

        public isPowered(): boolean {
            return this.isOn;
        }

        public setVoltage(voltage: number): void {
            this.voltage = voltage;
        }

        public getVoltage(): number {
            return this.voltage;
        }

        public setResistance(resistance: number): void {
            this.resistance = resistance;
        }

        public getResistance(): number {
            return this.resistance;
        }
    }

    /**
     * Абстрактный класс для компонентов электрической цепи
     */
    export abstract class CircuitComponent {
        protected position: Vector2D;
        protected circuit: CircuitSimulation | null = null;

        constructor(x: number, y: number) {
            this.position = new Vector2D(x, y);
        }

        public setCircuit(circuit: CircuitSimulation): void {
            this.circuit = circuit;
        }

        public getPosition(): Vector2D {
            return this.position;
        }

        public setPosition(x: number, y: number): void {
            this.position = new Vector2D(x, y);
        }

        public abstract update(deltaTime: number, voltage: number, circuitResistance: number): void;
        public abstract render(ctx: CanvasRenderingContext2D): void;
    }

    /**
     * Класс для симуляции лампочки
     */
    export class Lamp extends CircuitComponent {
        private brightness: number = 0;
        private resistance: number;
        private radius: number;

        constructor(x: number, y: number, resistance: number = 50, radius: number = 15) {
            super(x, y);
            this.resistance = resistance;
            this.radius = radius;
        }

        public update(deltaTime: number, voltage: number, circuitResistance: number): void {
            // Рассчитываем яркость лампочки по закону Ома
            const totalResistance = circuitResistance + this.resistance;
            const current = voltage / totalResistance;
            const power = current * current * this.resistance;

            // Преобразуем мощность в яркость (0-1)
            this.brightness = Math.min(power / 10, 1);
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Рисуем лампочку
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

            // Цвет зависит от яркости
            const red = Math.floor(255 * Math.min(1, this.brightness * 1.5));
            const green = Math.floor(255 * Math.min(1, this.brightness));
            const blue = Math.floor(128 * Math.min(1, this.brightness * 0.5));

            const glowAlpha = this.brightness;

            // Сначала рисуем свечение
            if (this.brightness > 0.1) {
                ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${glowAlpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Затем рисуем саму лампочку
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Добавляем блик
            if (this.brightness > 0.1) {
                const highlightRadius = this.radius * 0.3;
                ctx.beginPath();
                ctx.arc(this.position.x - this.radius * 0.3, this.position.y - this.radius * 0.3, highlightRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness * 0.8})`;
                ctx.fill();
            }
        }

        public setResistance(resistance: number): void {
            this.resistance = resistance;
        }

        public getResistance(): number {
            return this.resistance;
        }
    }

    /**
     * Класс для симуляции мотора
     */
    export class Motor extends CircuitComponent {
        private speed: number = 0;
        private resistance: number;
        private radius: number;
        private angle: number = 0;

        constructor(x: number, y: number, resistance: number = 20, radius: number = 20) {
            super(x, y);
            this.resistance = resistance;
            this.radius = radius;
        }

        public update(deltaTime: number, voltage: number, circuitResistance: number): void {
            // Рассчитываем скорость мотора по закону Ома
            const totalResistance = circuitResistance + this.resistance;
            const current = voltage / totalResistance;
            //Определяем скорость вращения мотора (пропорционально току)
            this.speed = 5 * current;

            // Обновляем угол в зависимости от скорости
            this.angle += this.speed * deltaTime;

            // Нормализация угла
            this.angle = this.angle % (2 * Math.PI);
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Рисуем корпус мотора
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#777';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем вал мотора
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = '#444';
            ctx.fill();

            // Рисуем индикаторы вращения
            const numIndicators = 4;
            for (let i = 0; i < numIndicators; i++) {
                const indicatorAngle = this.angle + (i * Math.PI * 2) / numIndicators;
                const startX = this.position.x + this.radius * 0.4 * Math.cos(indicatorAngle);
                const startY = this.position.y + this.radius * 0.4 * Math.sin(indicatorAngle);
                const endX = this.position.x + this.radius * 0.8 * Math.cos(indicatorAngle);
                const endY = this.position.y + this.radius * 0.8 * Math.sin(indicatorAngle);

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = '#DDD';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Рисуем метку скорости
            const speedText = this.speed.toFixed(1);
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.fillText(`${speedText} rad/s`, this.position.x - 15, this.position.y + 4);
        }

        public setResistance(resistance: number): void {
            this.resistance = resistance;
        }

        public getResistance(): number {
            return this.resistance;
        }

        public getSpeed(): number {
            return this.speed;
        }
    }
}