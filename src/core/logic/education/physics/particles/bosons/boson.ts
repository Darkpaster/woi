import { Particle } from '../particle.ts';
import {Vector2D} from "../../../../../../utils/math/2d.ts";

// Базовый класс для частиц-переносчиков взаимодействия (бозонов)
export abstract class Boson extends Particle {
    protected interaction: string;
    protected range: number;
    protected lifetime: number;
    protected remainingLife: number;

    constructor(
        position: Vector2D,
        interaction: string,
        mass: number,
        charge: number,
        spin: number,
        range: number,
        lifetime: number
    ) {
        super(position, mass, charge, spin);
        this.interaction = interaction;
        this.range = range;
        this.lifetime = lifetime;
        this.remainingLife = lifetime;
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Уменьшаем оставшуюся жизнь
        this.remainingLife -= deltaTime;

        // Увеличиваем скорость для частиц с коротким временем жизни
        if (this.lifetime < 0.1) {
            this.velocity.x *= 1.01;
            this.velocity.y *= 1.01;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const radius = this.radius;

        // Эффект затухания для бозонов с ограниченным временем жизни
        // const opacity = Math.min(1, this.remainingLife / this.lifetime);
        const opacity = this.lifetime > 0
            ? Math.min(1, Math.max(0, this.remainingLife / this.lifetime))
            : 1;

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);

        // Градиент для бозонов
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, radius
        );

        const { r, g, b } = this.color || { r: 0, g: 0, b: 0 };
        const safeColor = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${opacity})`;
        gradient.addColorStop(0, safeColor);
        gradient.addColorStop(1, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0)`);

        // gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity})`);
        // gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // Рисуем маленькую волну вокруг бозона
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += 0.1) {
            const waveAmplitude = 2 + Math.sin(i * 5 + this.age * 5) * 1.5;
            const x = this.position.x + Math.cos(i) * (radius + waveAmplitude);
            const y = this.position.y + Math.sin(i) * (radius + waveAmplitude);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    isExpired(): boolean {
        return this.remainingLife <= 0;
    }

    getInteraction(): string {
        return this.interaction;
    }

    getRange(): number {
        return this.range;
    }
}