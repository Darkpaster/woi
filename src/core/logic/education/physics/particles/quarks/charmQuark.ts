// c-кварк (charm-кварк)
import {AntiCharmQuark} from "./antiCharmQuark.ts";
import {Quark} from "./quark.ts";
import {Vector2D} from "../../../../../../utils/math/2d.ts";

export class CharmQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'red') {
        super(position, 'charm', quarkColor, 1.275, 2/3);
        this.color = { r: 180, g: 180, b: 255 };
        this.name = 'c';
        this.antiParticleType = 'anti-charm';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiCharmQuark({ ...this.position }, antiColor);
    }
}
