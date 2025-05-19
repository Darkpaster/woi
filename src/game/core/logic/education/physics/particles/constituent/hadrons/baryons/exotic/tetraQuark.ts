import {Particle} from "../../../../particle.ts";
import {Quark} from "../../../../elementary/fermions/quarks/quark.ts";
import {Vector2D} from "../../../../../../../../../../utils/math/2d.ts";
import {CharmQuark} from "../../../../elementary/fermions/quarks/charmQuark.ts";
import {AntiCharmQuark} from "../../../../elementary/fermions/quarks/antiCharmQuark.ts";
import {UpQuark} from "../../../../elementary/fermions/quarks/upQuark.ts";
import {AntiUpQuark} from "../../../../elementary/fermions/quarks/antiUpQuark.ts";

export class TetraQuark extends Particle {
    protected quarks: Quark[] = [];

    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Тетракварк X(3872) имеет заряд 0
        super(position, 3.872, 0, 1);
        this.color = { r: 200, g: 200, b: 50 };
        this._name = 'X(3872)';
        this.radius = 7; // Размер тетракварка

        // Инициализация кварков (cc̄uū)
        this.quarks = [
            new CharmQuark(position, 'red'),
            new AntiCharmQuark(position, 'anti-red'),
            new UpQuark(position, 'green'),
            new AntiUpQuark(position, 'anti-green')
        ];
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем основу тетракварка
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`;
        ctx.fill();

        // Рисуем кварки внутри тетракварка
        this.quarks.forEach((quark, index) => {
            const angle = (index / this.quarks.length) * Math.PI * 2;
            const offset = this.radius * 0.6;
            const x = this.position.x + Math.cos(angle) * offset;
            const y = this.position.y + Math.sin(angle) * offset;

            quark.setPosition(new Vector2D(x, y));
            quark.draw(ctx);
        });

        // Отображаем название тетракварка
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y + this.radius + 8);
    }

    createAntiParticle(): Particle {
        const antiTetraQuark = new TetraQuark(this.position);
        antiTetraQuark.antiParticle = true;
        return antiTetraQuark;
    }
}