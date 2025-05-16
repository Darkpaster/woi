import {Vector2D} from "../../../../../../../../utils/math/2d.ts";
import {Quark} from "./quark.ts";
import {TopQuark} from "./topQuark.ts";

export class AntiTopQuark extends Quark {
    constructor(position: Vector2D = new Vector2D(0, 0), quarkColor: string = 'anti-green') {
        super(position, 'anti-top', quarkColor, 173.0, -2/3);
        this.color = { r: 200, g: 100, b: 20 };
        this._name = 't̄';
        this.antiParticle = true;
        this.antiParticleType = 'top';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new TopQuark(this.position, regularColor);
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Anti-Top-кварк очень быстро распадается
        if (this.age > 0.5) {
            // Готов к распаду
        }
    }
}