import {Organism} from "./organism.ts";

export abstract class Domain extends Organism {
    constructor(x: number, y: number, energy: number, size: number, speed: number, color: string, lifespan: number) {
        super(x, y, energy, size, speed, color, lifespan);
    }

    // Domain-specific behaviors can be added here
}