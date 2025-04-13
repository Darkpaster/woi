import {Baryon} from "../baryon.ts";
import {Vector2D} from "../../../../../../../../utils/math/2d.ts";
import {UpQuark} from "../../../quarks/upQuark.ts";
import {StrangeQuark} from "../../../quarks/strangeQuark.ts";
import {DownQuark} from "../../../quarks/downQuark.ts";

export class Sigma extends Baryon {
    constructor(position: Vector2D = new Vector2D(0, 0), charge: number = 0) {
        // Сигма-барионы имеют заряд -1, 0 или +1
        super(position, 1.189, charge, 0.5);
        this.color = { r: 100, g: 200, b: 200 };

        // Σ⁺, Σ⁰, Σ⁻
        this.name = charge === 0 ? 'Σ⁰' : (charge > 0 ? 'Σ⁺' : 'Σ⁻');

        // Инициализация кварков
        if (charge === 1) {
            // Σ⁺: uus
            this.quarks = [
                new UpQuark(position, 'red'),
                new UpQuark(position, 'green'),
                new StrangeQuark(position, 'blue')
            ];
        } else if (charge === 0) {
            // Σ⁰: uds
            this.quarks = [
                new UpQuark(position, 'red'),
                new DownQuark(position, 'green'),
                new StrangeQuark(position, 'blue')
            ];
        } else {
            // Σ⁻: dds
            this.quarks = [
                new DownQuark(position, 'red'),
                new DownQuark(position, 'green'),
                new StrangeQuark(position, 'blue')
            ];
        }
    }

    createAntiParticle(): Baryon {
        const antiSigma = new Sigma({ ...this.position }, -this.charge);
        antiSigma.antiParticle = true;
        return antiSigma;
    }
}