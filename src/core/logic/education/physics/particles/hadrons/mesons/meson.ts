import { Particle } from '../../particle.ts';
import { Vector2D } from '../../utils.ts';
import {Quark} from "../../quarks/quark.ts";

// Абстрактный класс для мезонов
export abstract class Meson extends Particle {
    protected quarks: Quark[] = [];

    constructor(position: Vector2D, mass: number, charge: number, spin: number) {
        super(position, mass, charge, spin);
        this.radius = 4;
    }

    // private generateName(): string {
    //     // Упрощенная логика для генерации названия мезона
    //     const [quark1, quark2] = this.quarkComposition;
    //     if (quark1 === 'up' && quark2 === 'anti-down') return 'π+';
    //     if (quark1 === 'down' && quark2 === 'anti-up') return 'π-';
    //     if (quark1 === 'up' && quark2 === 'anti-up' ||
    //         quark1 === 'down' && quark2 === 'anti-down') return 'π0';
    //     if (quark1 === 'strange' && quark2 === 'anti-up') return 'K-';
    //     if (quark1 === 'up' && quark2 === 'anti-strange') return 'K+';
    //     return `${quark1}-${quark2} Meson`;
    // }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем основу мезона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`;
        ctx.fill();

        // Рисуем кварки внутри мезона
        this.quarks.forEach((quark, index) => {
            const angle = (index / this.quarks.length) * Math.PI * 2;
            const offset = this.radius * 0.5;
            const x = this.position.x + Math.cos(angle) * offset;
            const y = this.position.y + Math.sin(angle) * offset;

            quark.setPosition({ x, y });
            quark.draw(ctx);
        });

        // Отображаем название мезона
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y + this.radius + 8);
    }

    abstract createAntiParticle(): Meson;
}