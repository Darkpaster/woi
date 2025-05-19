// s-кварк (strange-кварк)
import {Quark} from "./quark.ts";
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {AntiStrangeQuark} from "./antiStrangeQuark.ts";

export class StrangeQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'blue') {
        super(position, 'strange', quarkColor, 0.095, -1/3);
        this.color = { r: 100, g: 200, b: 200 };
        this._name = 's';
        this.antiParticleType = 'anti-strange';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiStrangeQuark(this.position, antiColor);
    }
}