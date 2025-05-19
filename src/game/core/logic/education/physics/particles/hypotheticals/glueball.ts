import { Particle } from '../particle.ts';
import {Vector2D} from "../../../../../../../utils/math/2d.ts";

export class Glueball extends Particle {
    protected glueballState: number;

    constructor(position: Vector2D, state: number = 0) {
        // Глюбол: гипотетическая частица из связанных глюонов, масса варьируется
        super(position, 1.5 + state * 0.5, 0, state); // Состояние определяет свойства
        this.glueballState = state;
        this.name = `Glueball(${state})`;
        this.color = { r: 100, g: 100, b: 0 }; // Тёмно-желтый цвет
        this.radius = 4;
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Глюболы нестабильны
        if (this.age > 3) {
            // Готов к распаду на глюоны или другие частицы
        }
    }

    // Глюбол является собственной античастицей
    createAntiParticle(): Particle {
        const antiGlueball = new Glueball(this.getPosition(), this.glueballState);
        antiGlueball.setVelocity(this.getVelocity());
        return antiGlueball;
    }

    getState(): number {
        return this.glueballState;
    }
}