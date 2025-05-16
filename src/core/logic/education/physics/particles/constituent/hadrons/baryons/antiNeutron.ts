// Антинейтрон - античастица нейтрона
import {Hadron} from "../hadron.ts";
import {Vector2D} from "../../../../../../../../utils/math/2d.ts";
import {AntiUpQuark} from "../../../elementary/fermions/quarks/antiUpQuark.ts";
import {AntiDownQuark} from "../../../elementary/fermions/quarks/antiDownQuark.ts";
import {Neutron} from "./neutron.ts";

export class AntiNeutron extends Hadron {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Антинейтрон состоит из одного анти-u-кварка и двух анти-d-кварков
        const antiUpQuark = new AntiUpQuark();
        const antiDownQuark1 = new AntiDownQuark();
        const antiDownQuark2 = new AntiDownQuark();

        super(position, [antiUpQuark, antiDownQuark1, antiDownQuark2]);

        this.color = { r: 130, g: 130, b: 130 };
        this.radius = 6;
        this._name = 'n̄';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация для антинейтрона - пунктирная граница
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(130, 130, 130, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Создать нейтрон (античастица антинейтрона)
    createAntiParticle(): Hadron {
        return new Neutron(new Vector2D(this.position.x, this.position.y));
    }
}