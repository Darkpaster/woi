import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Uranium238 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Уран-238: 92 протона, 146 нейтронов, 92 электрона
        super(position, "²³⁸U", 92, 146, 92);
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Симуляция радиоактивного распада
        if (Math.random() < 0.0000001 * deltaTime) {
            this.decay();
        }
    }

    private decay(): void {
        // У урана-238 альфа-распад
        console.log("Uranium-238 decayed via alpha decay");
        // Здесь можно реализовать логику распада
    }
}