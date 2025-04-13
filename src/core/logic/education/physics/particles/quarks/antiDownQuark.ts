// Анти-d-кварк
import {Quark} from "./quark.ts";
import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {DownQuark} from "./downQuark.ts";

export class AntiDownQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'anti-green') {
        super(position, 'anti-down', quarkColor, 0.005, 1/3);
        this.color = { r: 255, g: 100, b: 255 };
        this.name = 'd̄';
        this.antiParticle = true;
        this.antiParticleType = 'down';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new DownQuark({ ...this.position }, regularColor);
    }
}