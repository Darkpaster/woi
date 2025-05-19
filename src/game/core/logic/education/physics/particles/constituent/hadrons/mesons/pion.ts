import {Meson} from "./meson.ts";
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {UpQuark} from "../../../elementary/fermions/quarks/upQuark.ts";
import {AntiDownQuark} from "../../../elementary/fermions/quarks/antiDownQuark.ts";
import {AntiUpQuark} from "../../../elementary/fermions/quarks/antiUpQuark.ts";
import {DownQuark} from "../../../elementary/fermions/quarks/downQuark.ts";

export class Pion extends Meson {
    constructor(position: Vector2D = new Vector2D(0, 0), charge: number = 0) {
        // Пионы имеют заряд -1, 0 или +1
        super(position, 0.14, charge, 0);
        this.color = { r: 255, g: 200, b: 0 };
        this._name = charge === 0 ? 'π⁰' : (charge > 0 ? 'π⁺' : 'π⁻');

        // Инициализация кварков (например, для π⁺: ud̄)
        if (charge === 1) {
            this.quarks = [
                new UpQuark(position, 'red'),
                new AntiDownQuark(position, 'anti-red')
            ];
        } else if (charge === -1) {
            this.quarks = [
                new AntiUpQuark(position, 'anti-green'),
                new DownQuark(position, 'green')
            ];
        } else {
            // Для нейтрального пиона (π⁰) комбинация (uū+dd̄)/sqrt(2)
            this.quarks = [
                new UpQuark(position, 'blue'),
                new AntiUpQuark(position, 'anti-blue')
            ];
        }
    }

    createAntiParticle(): Meson {
        return new Pion(this.position, -this.charge);
    }
}