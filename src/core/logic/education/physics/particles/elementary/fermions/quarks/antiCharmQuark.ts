import {Vector2D} from "../../../../../../../../utils/math/2d.ts";
import {Quark} from "./quark.ts";
import {CharmQuark} from "./charmQuark.ts";

export class AntiCharmQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'anti-red') {
        super(position, 'anti-charm', quarkColor, 1.275, -2/3);
        this.color = { r: 75, g: 75, b: 200 };
        this._name = 'c̄';
        this.antiParticle = true;
        this.antiParticleType = 'charm';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new CharmQuark(this.position, regularColor);
    }
}