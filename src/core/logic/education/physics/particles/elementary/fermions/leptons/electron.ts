import { Lepton } from './lepton.ts';
import {Vector2D} from "../../../../../../../../utils/math/2d.ts";
import {Positron} from "./positron.ts";

export class Electron extends Lepton {
    constructor(position: Vector2D) {
        // Параметры электрона: масса, заряд, спин
        super(position, 0.0005, -1, 0.5);
        this.color = { r: 50, g: 100, b: 255 };
        this.radius = 3;
        this._name = 'e-';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительная визуализация для электрона - облако вероятности
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50, 100, 255, 0.1)`;
        ctx.fill();
    }

    // Создать позитрон (античастицу)
    createAntiParticle(): Lepton {
        return new Positron(new Vector2D(this.position.x, this.position.y));
    }
}