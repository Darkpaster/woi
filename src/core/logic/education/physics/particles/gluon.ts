import { Boson } from './boson';
import { Vector2D } from './utils';
import {Particle} from "./particle.ts";

export class Gluon extends Boson {
    private color1: string;
    private color2: string;

    constructor(position: Vector2D, color1: string = 'red', color2: string = 'blue') {
        // Параметры глюона: масса, заряд, спин, дальность, время жизни
        super(position, 'strong', 0, 0, 1, 10, 0.01);

        this.color1 = color1;
        this.color2 = color2;
        this.color = { r: 200, g: 50, b: 200 };
        this.radius = 2;
        this.name = 'g';

        // Глюоны двигаются очень быстро
        this.velocity = {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100
        };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const radius = this.radius;
        const opacity = Math.min(1, this.remainingLife / this.lifetime);

        // Создаем градиент с двумя цветами для симуляции глюона
        const gradient = ctx.createLinearGradient(
            this.position.x - radius, this.position.y - radius,
            this.position.x + radius, this.position.y + radius
        );

        // Используем цветовую схему КХД
        switch(this.color1) {
            case 'red':
                gradient.addColorStop(0, `rgba(255, 0, 0, ${opacity})`);
                break;
            case 'green':
                gradient.addColorStop(0, `rgba(0, 255, 0, ${opacity})`);
                break;
            case 'blue':
                gradient.addColorStop(0, `rgba(0, 0, 255, ${opacity})`);
                break;
        }

        switch(this.color2) {
            case 'anti-red':
                gradient.addColorStop(1, `rgba(0, 255, 255, ${opacity})`);
                break;
            case 'anti-green':
                gradient.addColorStop(1, `rgba(255, 0, 255, ${opacity})`);
                break;
            case 'anti-blue':
                gradient.addColorStop(1, `rgba(255, 255, 0, ${opacity})`);
                break;
        }

        // Рисуем глюон как спиральную линию
        ctx.beginPath();

        const length = radius * 4;
        const direction = Math.atan2(this.velocity.y, this.velocity.x);

        for (let i = -length; i <= length; i++) {
            const x = this.position.x + Math.cos(direction) * i;
            const y = this.position.y + Math.sin(direction) * i;
            const offset = Math.sin(i * 0.5 + this.age * 10) * 2;

            const offsetX = Math.cos(direction + Math.PI/2) * offset;
            const offsetY = Math.sin(direction + Math.PI/2) * offset;

            if (i === -length) {
                ctx.moveTo(x + offsetX, y + offsetY);
            } else {
                ctx.lineTo(x + offsetX, y + offsetY);
            }
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Рисуем маленькие точки на концах
        ctx.beginPath();
        const startX = this.position.x - Math.cos(direction) * length;
        const startY = this.position.y - Math.sin(direction) * length;
        ctx.arc(startX, startY, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.getColorByName(this.color1);
        ctx.fill();

        ctx.beginPath();
        const endX = this.position.x + Math.cos(direction) * length;
        const endY = this.position.y + Math.sin(direction) * length;
        ctx.arc(endX, endY, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.getColorByName(this.color2);
        ctx.fill();
    }

    private getColorByName(colorName: string): string {
        switch(colorName) {
            case 'red': return 'rgba(255, 0, 0, 1)';
            case 'green': return 'rgba(0, 255, 0, 1)';
            case 'blue': return 'rgba(0, 0, 255, 1)';
            case 'anti-red': return 'rgba(0, 255, 255, 1)';
            case 'anti-green': return 'rgba(255, 0, 255, 1)';
            case 'anti-blue': return 'rgba(255, 255, 0, 1)';
            default: return 'rgba(200, 200, 200, 1)';
        }
    }

    getQuarkColors(): { color1: string, color2: string } {
        return { color1: this.color1, color2: this.color2 };
    }

    createAntiParticle(): Particle {
        // return undefined;
    }
}