// u-кварк (up-кварк)
import {AntiUpQuark, Quark} from "./quark.ts";
import {Vector2D} from "../utils.ts";

export class UpQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'red') {
        super(position, 'up', quarkColor, 0.002, 2/3);
        this.color = { r: 255, g: 100, b: 100 };
        this.name = 'u';
        this.antiParticleType = 'anti-up';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiUpQuark({ ...this.position }, antiColor);
    }
}