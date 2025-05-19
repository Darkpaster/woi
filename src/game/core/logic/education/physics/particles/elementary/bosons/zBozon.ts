// Z-бозон (переносчик слабого взаимодействия)
import {Boson} from "./boson.ts";
import {Particle} from "../../particle.ts";
import {Vector2D} from "../../../../../../../../utils/math/2d.ts";

export class ZBoson extends Boson {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Z-бозон: масса около 91.2 ГэВ, нейтральный
        super(position, 'weak', 91.2, 0, 1, 6, 20); // насчёт lifetime не уверен
        this._name = 'Z';
        this.color = { r: 200, g: 200, b: 255 }; // Светло-синий цвет
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Z-бозоны короткоживущие
        if (this.age > 2.5) {
            // Готов к распаду
        }
    }

    // Z бозон является собственной античастицей
    createAntiParticle(): Particle {
        const antiZ = new ZBoson(this.getPosition());
        antiZ.setVelocity(this.getVelocity());
        return antiZ;
    }
}