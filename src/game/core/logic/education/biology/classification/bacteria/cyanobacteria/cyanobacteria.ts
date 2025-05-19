import {Organism} from "../../organism.ts";
import {Bacteria} from "../bacteria.ts";

export class Cyanobacteria extends Bacteria {
    private photosynthesisRate: number;

    constructor(x: number, y: number) {
        super(
            x,
            y,
            80,   // energy
            2,    // size
            1,    // speed
            '#00bfff', // color - deep sky blue
            200,  // lifespan
            0.05  // division rate
        );
        this.photosynthesisRate = 0.2;
    }

    public reproduce(): Organism | null {
        if (this.energy > 120 && Math.random() < this.divisionRate) {
            this.energy /= 2;
            return new Cyanobacteria(
                this.x + (Math.random() - 0.5) * 10,
                this.y + (Math.random() - 0.5) * 10
            );
        }
        return null;
    }

    public update(dt: number, organisms: Organism[]): void {
        super.update(dt, organisms);

        // Cyanobacteria photosynthesize
        this.gainEnergy(this.photosynthesisRate * dt);
    }
}
