import {Archaea} from "../archaea.ts";
import {Organism} from "../../organism.ts";

export class Thaumarchaeota extends Archaea {
    constructor(x: number, y: number) {
        super(
            x,
            y,
            100, // energy
            3,   // size
            1.5, // speed
            '#8a2be2', // color - blueviolet
            300, // lifespan
            0.8  // temperature resistance
        );
    }

    public reproduce(): Organism | null {
        if (this.energy > 150) {
            this.energy /= 2;
            return new Thaumarchaeota(
                this.x + (Math.random() - 0.5) * 20,
                this.y + (Math.random() - 0.5) * 20
            );
        }
        return null;
    }

    public update(dt: number, organisms: Organism[]): void {
        super.update(dt, organisms);

        // Thaumarchaeota can get energy from ammonia
        this.gainEnergy(0.1 * dt);
    }
}
