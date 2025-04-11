import {Vector2D} from "../utils.ts";
import {Quark} from "./quark.ts";
import {BottomQuark} from "./bottomQuark.ts";


export class AntiBottomQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'anti-blue') {
        super(position, 'anti-bottom', quarkColor, 4.18, 1/3);
        this.color = { r: 175, g: 175, b: 50 };
        this.name = 'b̄';
        this.antiParticle = true;
        this.antiParticleType = 'bottom';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new BottomQuark({ ...this.position }, regularColor);
    }
}