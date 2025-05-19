import {Domain} from "../domain.ts";
import {Organism} from "../organism.ts";

export abstract class Bacteria extends Domain {
    protected divisionRate: number;

    constructor(x: number, y: number, energy: number, size: number, speed: number, color: string, lifespan: number, divisionRate: number) {
        super(x, y, energy, size, speed, color, lifespan);
        this.divisionRate = divisionRate;
    }

    public update(dt: number, organisms: Organism[]): void {
        // Basic movement - bacteria move more erratically
        const angle = Math.random() * Math.PI * 2;
        const distance = this.speed * dt * (Math.random() + 0.5);

        this.move(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            800, // Canvas width
            600  // Canvas height
        );

        // Consume energy based on size
        this.consumeEnergy(this.size * 0.01 * dt);

        // Age the organism
        this.age += dt;

        // Try to gain energy from environment
        this.gainEnergy(0.05 * dt);
    }
}