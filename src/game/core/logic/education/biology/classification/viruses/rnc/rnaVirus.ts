import {Virus} from "../virus.ts";
import {Organism} from "../../organism.ts";

export class RNAVirus extends Virus {
    private mutationRate: number;

    constructor(x: number, y: number) {
        super(
            x,
            y,
            20,   // energy
            1,    // size
            3,    // speed
            '#ff00ff', // color - magenta
            100,  // lifespan
            0.3   // infection rate
        );
        this.mutationRate = 0.05;
    }

    public reproduce(): Organism | null {
        if (this.energy > 30) {
            this.energy -= 10;

            // Chance to mutate
            if (Math.random() < this.mutationRate) {
                return new RNAVirus(
                    this.x + (Math.random() - 0.5) * 15,
                    this.y + (Math.random() - 0.5) * 15
                );
            }

            return new RNAVirus(
                this.x + (Math.random() - 0.5) * 15,
                this.y + (Math.random() - 0.5) * 15
            );
        }
        return null;
    }

    public update(dt: number, organisms: Organism[]): void {
        super.update(dt, organisms);

        // RNA viruses have higher mutation rates
        // This is handled in the reproduce method
    }
}