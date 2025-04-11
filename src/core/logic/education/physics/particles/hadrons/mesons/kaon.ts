import {Meson} from "./meson.ts";
import {Vector2D} from "../../utils.ts";
import {UpQuark} from "../../quarks/upQuark.ts";
import {AntiStrangeQuark} from "../../quarks/antiStrangeQuark.ts";
import {AntiUpQuark} from "../../quarks/antiUpQuark.ts";
import {StrangeQuark} from "../../quarks/strangeQuark.ts";
import {DownQuark} from "../../quarks/downQuark.ts";

export class Kaon extends Meson {
    constructor(position: Vector2D = { x: 0, y: 0 }, charge: number = 0) {
        // Каоны имеют заряд -1, 0 или +1
        super(position, 0.494, charge, 0);
        this.color = { r: 150, g: 150, b: 255 };

        // K⁺, K⁻, K⁰
        this.name = charge === 0 ? 'K⁰' : (charge > 0 ? 'K⁺' : 'K⁻');

        // Инициализация кварков
        if (charge === 1) {
            // K⁺: us̄
            this.quarks = [
                new UpQuark(position, 'red'),
                new AntiStrangeQuark(position, 'anti-red')
            ];
        } else if (charge === -1) {
            // K⁻: ūs
            this.quarks = [
                new AntiUpQuark(position, 'anti-green'),
                new StrangeQuark(position, 'green')
            ];
        } else {
            // K⁰: ds̄
            this.quarks = [
                new DownQuark(position, 'blue'),
                new AntiStrangeQuark(position, 'anti-blue')
            ];
        }
    }

    createAntiParticle(): Meson {
        return new Kaon({ ...this.position }, -this.charge);
    }
}