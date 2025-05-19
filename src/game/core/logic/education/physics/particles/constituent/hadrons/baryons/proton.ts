import { Hadron } from '../hadron.ts';
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {DownQuark} from "../../../elementary/fermions/quarks/downQuark.ts";
import {UpQuark} from "../../../elementary/fermions/quarks/upQuark.ts";
import {AntiProton} from "./antiProton.ts";

export class Proton extends Hadron {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Протон состоит из двух u-кварков и одного d-кварка
        const upQuark1 = new UpQuark();
        const upQuark2 = new UpQuark();
        const downQuark = new DownQuark();

        super(position, [upQuark1, upQuark2, downQuark]);

        this.color = { r: 255, g: 100, b: 100 };
        this.radius = 6;
        this._name = 'p+';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Добавляем свечение для протона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Создать антипротон
    createAntiParticle(): Hadron {
        return new AntiProton(new Vector2D(this.position.x, this.position.y));
    }
}

