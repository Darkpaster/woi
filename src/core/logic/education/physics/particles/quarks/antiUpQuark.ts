// Анти-u-кварк
import {UpQuark} from "./upQuark.ts";
import {Quark} from "./quark.ts";
import {Vector2D} from "../../../../../../utils/math/2d.ts";

export class AntiUpQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'anti-red') {
        super(position, 'anti-up', quarkColor, 0.002, -2/3);
        this.color = { r: 100, g: 255, b: 255 };
        this.name = 'ū';
        this.antiParticle = true;
        this.antiParticleType = 'up';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new UpQuark({ ...this.position }, regularColor);
    }
}