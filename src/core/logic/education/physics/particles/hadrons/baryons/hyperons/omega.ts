import {Vector2D} from "../../../utils.ts";
import {Baryon} from "../baryon.ts";
import {StrangeQuark} from "../../../quarks/strangeQuark.ts";

export class Omega extends Baryon {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Омега-барион имеет заряд -1
        super(position, 1.672, -1, 1.5);
        this.color = { r: 120, g: 70, b: 220 };
        this.name = 'Ω⁻';

        // Инициализация кварков (sss)
        this.quarks = [
            new StrangeQuark(position, 'red'),
            new StrangeQuark(position, 'green'),
            new StrangeQuark(position, 'blue')
        ];
    }

    createAntiParticle(): Baryon {
        const antiOmega = new Omega({ ...this.position });
        antiOmega.charge = 1;
        antiOmega.name = 'Ω⁺';
        antiOmega.antiParticle = true;
        return antiOmega;
    }
}