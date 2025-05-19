// u-кварк (up-кварк)
import {Quark} from "./quark.ts";
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {AntiUpQuark} from "./antiUpQuark.ts";

export class UpQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'red') {
        super(position, 'up', quarkColor, 0.002, 2/3);
        this.color = { r: 255, g: 100, b: 100 };
        this._name = 'u';
        this.antiParticleType = 'anti-up';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiUpQuark(this.position, antiColor);
    }
}