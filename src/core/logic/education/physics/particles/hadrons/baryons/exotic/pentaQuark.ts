// Экзотические барионы
import {Baryon} from "../baryon.ts";
import {Vector2D} from "../../../utils.ts";
import {UpQuark} from "../../../quarks/upQuark.ts";
import {DownQuark} from "../../../quarks/downQuark.ts";
import {CharmQuark} from "../../../quarks/charmQuark.ts";
import {AntiCharmQuark} from "../../../quarks/antiCharmQuark.ts";

export class PentaQuark extends Baryon {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Пентакварк Pc(4380)+ имеет заряд +1
        super(position, 4.38, 1, 1.5);
        this.color = { r: 255, g: 150, b: 0 };
        this.name = 'Pc(4380)⁺';
        this.radius = 8; // Увеличенный радиус для пентакварка

        // Инициализация кварков (uudcc̄)
        this.quarks = [
            new UpQuark(position, 'red'),
            new UpQuark(position, 'green'),
            new DownQuark(position, 'blue'),
            new CharmQuark(position, 'red'),
            new AntiCharmQuark(position, 'anti-red')
        ];
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем основу пентакварка
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`;
        ctx.fill();

        // Рисуем кварки в пентаквнутри бариона
        this.quarks.forEach((quark, index) => {
            const angle = (index / this.quarks.length) * Math.PI * 2;
            const offset = this.radius * 0.6;
            const x = this.position.x + Math.cos(angle) * offset;
            const y = this.position.y + Math.sin(angle) * offset;

            quark.setPosition({ x, y });
            quark.draw(ctx);
        });

        // Отображаем название пентакварка
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y + this.radius + 8);
    }

    createAntiParticle(): Baryon {
        const antiPentaQuark = new PentaQuark({ ...this.position });
        antiPentaQuark.charge = -1;
        antiPentaQuark.name = 'P̄c(4380)⁻';
        antiPentaQuark.antiParticle = true;
        return antiPentaQuark;
    }
}