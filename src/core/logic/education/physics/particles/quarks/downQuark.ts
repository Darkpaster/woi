// d-кварк (down-кварк)
import {AntiDownQuark} from "./antiDownQuark.ts";
import {Quark} from "./quark.ts";
import {Vector2D} from "../utils.ts";

export class DownQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'green') {
        super(position, 'down', quarkColor, 0.005, -1/3);
        this.color = { r: 100, g: 100, b: 255 };
        this.name = 'd';
        this.antiParticleType = 'anti-down';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiDownQuark({ ...this.position }, antiColor);
    }
}