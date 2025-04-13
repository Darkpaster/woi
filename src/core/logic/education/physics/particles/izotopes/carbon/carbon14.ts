import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Carbon14 extends Atom {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Углерод-14: 6 протонов, 8 нейтронов, 6 электронов
        super(position, "¹⁴C", 6, 8, 6);
    }

    // Углерод-14 радиоактивен, можно добавить методы симуляции распада
    update(deltaTime: number): void {
        super.update(deltaTime);

        // Симуляция радиоактивного распада с очень малой вероятностью
        // Период полураспада C-14 = 5730 лет, но для симуляции ускорим процесс
        if (Math.random() < 0.00001 * deltaTime) {
            this.decay();
        }
    }

    private decay(): void {
        // В реальности C-14 распадается до N-14 через бета-распад
        console.log("Carbon-14 decayed to Nitrogen-14");
        // Здесь можно добавить логику преобразования этого атома в Nitrogen14
    }
}