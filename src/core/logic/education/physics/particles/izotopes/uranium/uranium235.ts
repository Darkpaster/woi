import {Neutron} from "../../hadrons/baryons/neutron.ts";
import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";
import {Barium141, Krypton92} from "../utils.ts";

export class Uranium235 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Уран-235: 92 протона, 143 нейтрона, 92 электрона
        super(position, "²³⁵U", 92, 143, 92);
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Симуляция радиоактивного распада
        if (Math.random() < 0.000001 * deltaTime) {
            this.decay();
        }
    }

    // Метод для симуляции деления ядра при поглощении нейтрона
    nuclearFission(): {fissionFragments: Atom[], neutrons: Neutron[]} {
        console.log("Uranium-235 underwent nuclear fission");

        // В реальности деление U-235 может давать разные продукты
        // Здесь симулируем один из возможных каналов деления
        const fragment1 = new Krypton92({ x: this.getPosition().x - 20, y: this.getPosition().y });
        const fragment2 = new Barium141({ x: this.getPosition().x + 20, y: this.getPosition().y });

        // При делении выделяется 2-3 нейтрона
        const neutrons: Neutron[] = [];
        for (let i = 0; i < 3; i++) {
            const neutron = new Neutron();
            neutron.setPosition({
                x: this.getPosition().x + (Math.random() - 0.5) * 40,
                y: this.getPosition().y + (Math.random() - 0.5) * 40
            });
            neutrons.push(neutron);
        }

        return {
            fissionFragments: [fragment1, fragment2],
            neutrons
        };
    }

    private decay(): void {
        // У урана-235 альфа-распад
        console.log("Uranium-235 decayed via alpha decay");
        // Здесь можно реализовать логику распада
    }
}