import {Domain} from "../domain.ts";
import {Organism} from "../organism.ts";

export abstract class Eukarya extends Domain {
    protected complexity: number;

    constructor(x: number, y: number, energy: number, size: number, speed: number, color: string, lifespan: number, complexity: number) {
        super(x, y, energy, size, speed, color, lifespan);
        this.complexity = complexity;
    }

    public update(dt: number, organisms: Organism[]): void {
        // Basic movement - more complex movement for eukaryotes
        const angle = Math.random() * Math.PI * 2;
        const distance = this.speed * dt;

        this.move(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            800, // Canvas width
            600  // Canvas height
        );

        // Consume energy based on size and complexity
        this.consumeEnergy((this.size * 0.01 + this.complexity * 0.005) * dt);

        // Age the organism
        this.age += dt;
    }
}
