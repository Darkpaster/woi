// Антипротон - античастица протона
import {Hadron} from "../hadron.ts";
import {Vector2D} from "../../../../../../../../utils/math/2d.ts";
import {AntiUpQuark} from "../../../elementary/fermions/quarks/antiUpQuark.ts";
import {AntiDownQuark} from "../../../elementary/fermions/quarks/antiDownQuark.ts";
import {Proton} from "./proton.ts";

export class AntiProton extends Hadron {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Антипротон состоит из двух анти-u-кварков и одного анти-d-кварка
        const antiUpQuark1 = new AntiUpQuark();
        const antiUpQuark2 = new AntiUpQuark();
        const antiDownQuark = new AntiDownQuark();

        super(position, [antiUpQuark1, antiUpQuark2, antiDownQuark]);

        this.color = { r: 100, g: 50, b: 50 };
        this.radius = 6;
        this._name = 'p-';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительная визуализация для антипротона - знак "-"
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('-', this.position.x, this.position.y);

        // Добавляем пунктирное свечение для антипротона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(100, 50, 50, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Создать протон (античастица антипротона)
    createAntiParticle(): Hadron {
        return new Proton(new Vector2D(this.position.x, this.position.y));
    }
}