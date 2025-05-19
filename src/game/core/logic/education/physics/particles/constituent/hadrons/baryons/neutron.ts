import { Hadron } from '../hadron.ts';
import {UpQuark} from "../../../elementary/fermions/quarks/upQuark.ts";
import {DownQuark} from "../../../elementary/fermions/quarks/downQuark.ts";
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {AntiNeutron} from "./antiNeutron.ts";

export class Neutron extends Hadron {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Нейтрон состоит из одного u-кварка и двух d-кварков
        const upQuark = new UpQuark();
        const downQuark1 = new DownQuark();
        const downQuark2 = new DownQuark();

        super(position, [upQuark, downQuark1, downQuark2]);

        this.color = { r: 200, g: 200, b: 200 };
        this.radius = 6;
        this._name = 'n';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительная визуализация для нейтрона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Создать антинейтрон
    createAntiParticle(): Hadron {
        return new AntiNeutron(new Vector2D(this.position.x, this.position.y));
    }
}