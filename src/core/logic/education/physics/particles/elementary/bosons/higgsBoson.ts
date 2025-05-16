import { Particle } from '../../particle.ts';
import {Vector2D} from "../../../../../../../utils/math/2d.ts";
import {Boson} from "./boson.ts";

export class HiggsBoson extends Boson {
    constructor(position: Vector2D) {
        // Бозон Хиггса: большая масса (~125 ГэВ), нейтральный заряд, спин 0
        super(position, 'weak', 125.0, 0, 0, 8, 15);
        this._name = 'Higgs';
        this.color = { r: 255, g: 215, b: 0 }; // Золотистый цвет
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Бозон Хиггса быстро распадается
        if (this.age > 1.5) {
            // Логика распада может быть добавлена в системе симуляции
            // Здесь просто отмечаем, что частица готова к удалению
        }
    }

    // Бозон Хиггса является собственной античастицей
    createAntiParticle(): Particle {
        const antiHiggs = new HiggsBoson(this.getPosition());
        antiHiggs.setVelocity(this.getVelocity());
        return antiHiggs;
    }
}