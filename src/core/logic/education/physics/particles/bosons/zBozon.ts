// Z-бозон (переносчик слабого взаимодействия)
import {Boson} from "./boson.ts";
import {Vector2D} from "../utils.ts";
import {Particle} from "../particle.ts";

export class ZBoson extends Boson {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Z-бозон: масса около 91.2 ГэВ, нейтральный
        super(position, 91.2, 0, 'weak');
        this.name = 'Z';
        this.color = { r: 200, g: 200, b: 255 }; // Светло-синий цвет
        this.radius = 6;
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