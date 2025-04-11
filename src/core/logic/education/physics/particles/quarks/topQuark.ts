// t-кварк (top-кварк)
import {Quark} from "./quark.ts";
import {Vector2D} from "../utils.ts";
import {AntiTopQuark} from "./antiTopQuark.ts";

export class TopQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'green') {
        super(position, 'top', quarkColor, 173.0, 2/3);
        this.color = { r: 255, g: 150, b: 50 };
        this.name = 't';
        this.antiParticleType = 'anti-top';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiTopQuark({ ...this.position }, antiColor);
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Top-кварк очень быстро распадается
        if (this.age > 0.5) {
            // Готов к распаду
        }
    }
}