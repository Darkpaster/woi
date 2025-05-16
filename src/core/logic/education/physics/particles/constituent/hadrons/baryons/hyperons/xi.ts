import {Baryon} from "../baryon.ts";
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {UpQuark} from "../../../../elementary/fermions/quarks/upQuark.ts";
import {StrangeQuark} from "../../../../elementary/fermions/quarks/strangeQuark.ts";
import {DownQuark} from "../../../../elementary/fermions/quarks/downQuark.ts";

export class Xi extends Baryon {
    constructor(position: Vector2D = new Vector2D(0, 0), charge: number = 0) {
        // Кси-барионы имеют заряд 0 или -1
        super(position, 1.321, charge, 0.5);
        this.color = { r: 200, g: 100, b: 200 };

        // Ξ⁰, Ξ⁻
        this._name = charge === 0 ? 'Ξ⁰' : 'Ξ⁻';

        // Инициализация кварков
        if (charge === 0) {
            // Ξ⁰: uss
            this.quarks = [
                new UpQuark(position, 'red'),
                new StrangeQuark(position, 'green'),
                new StrangeQuark(position, 'blue')
            ];
        } else {
            // Ξ⁻: dss
            this.quarks = [
                new DownQuark(position, 'red'),
                new StrangeQuark(position, 'green'),
                new StrangeQuark(position, 'blue')
            ];
        }
    }

    createAntiParticle(): Baryon {
        const antiXi = new Xi(this.position, -this.charge);
        antiXi.antiParticle = true;
        return antiXi;
    }
}