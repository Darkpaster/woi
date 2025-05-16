import {Mammal} from "../../mammalia.ts";
import {Organism} from "../../../../../../organism.ts";

export class Carnivora extends Mammal {
    private huntingEfficiency: number;

    constructor(x: number, y: number) {
        super(
            x,
            y,
            500,   // energy
            15,    // size
            5,     // speed
            '#ff6347', // color - tomato
            1000,  // lifespan
            8,     // complexity
            37     // body temperature
        );
        this.huntingEfficiency = 0.7;
    }

    public reproduce(): Organism | null {
        if (this.energy > 700 && this.age > this.lifespan * 0.2) {
            this.energy -= 300;
            return new Carnivora(
                this.x + (Math.random() - 0.5) * 50,
                this.y + (Math.random() - 0.5) * 50
            );
        }
        return null;
    }

    public update(dt: number, organisms: Organism[]): void {
        super.update(dt, organisms);

        // Carnivores have better hunting efficiency
        // This is already handled in the parent update method
    }
}
