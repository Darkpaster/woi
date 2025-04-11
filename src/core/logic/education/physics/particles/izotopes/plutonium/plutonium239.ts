import {Vector2D} from "../../utils.ts";
import {Atom} from "../../atom.ts";
import {Neutron} from "../../hadrons/baryons/neutron.ts";
import {Strontium104, Xenon134} from "../utils.ts";

export class Plutonium239 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Плутоний-239: 94 протона, 145 нейтронов, 94 электрона
        super(position, "²³⁹Pu", 94, 145, 94);
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Симуляция радиоактивного распада
        if (Math.random() < 0.000001 * deltaTime) {
            this.decay();
        }
    }

    nuclearFission(): {fissionFragments: Atom[], neutrons: Neutron[]} {
        console.log("Plutonium-239 underwent nuclear fission");

        // Симулируем деление Pu-239
        const fragment1 = new Xenon134({ x: this.getPosition().x - 20, y: this.getPosition().y });
        const fragment2 = new Strontium104({ x: this.getPosition().x + 20, y: this.getPosition().y });

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
        // У плутония-239 альфа-распад
        console.log("Plutonium-239 decayed via alpha decay");
        // Здесь можно реализовать логику распада
    }
}