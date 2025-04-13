import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Quark} from "./quark.ts";
import {StrangeQuark} from "./strangeQuark.ts";

export class AntiStrangeQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'anti-blue') {
        super(position, 'anti-strange', quarkColor, 0.095, 1/3);
        this.color = { r: 200, g: 100, b: 100 };
        this.name = 's̄';
        this.antiParticle = true;
        this.antiParticleType = 'strange';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new StrangeQuark({ ...this.position }, regularColor);
    }
}