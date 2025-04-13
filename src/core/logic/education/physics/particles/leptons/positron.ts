// Позитрон - античастица электрона
import {Lepton} from "./lepton.ts";
import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Electron} from "./electron.ts";

export class Positron extends Lepton {
    constructor(position: Vector2D) {
        // Параметры позитрона: масса, заряд, спин
        super(position, 0.0005, 1, 0.5);
        this.color = { r: 255, g: 100, b: 50 };
        this.radius = 3;
        this.name = 'e+';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительная визуализация для позитрона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 50, 0.1)`;
        ctx.fill();
    }

    // Создать электрон (античастицу позитрона)
    createAntiParticle(): Lepton {
        return new Electron(new Vector2D(this.position.x, this.position.y));
    }
}