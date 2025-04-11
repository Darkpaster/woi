
// b-кварк (bottom-кварк или beauty-кварк)
import {Vector2D} from "../utils.ts";
import {Quark} from "./quark.ts";
import {AntiBottomQuark} from "./antiBottomQuark.ts";

export class BottomQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'blue') {
        super(position, 'bottom', quarkColor, 4.18, -1/3);
        this.color = { r: 75, g: 75, b: 150 };
        this.name = 'b';
        this.antiParticleType = 'anti-bottom';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiBottomQuark({ ...this.position }, antiColor);
    }
}