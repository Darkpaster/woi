import {Organism} from "../organism.ts";
import {Domain} from "../domain.ts";

export abstract class Archaea extends Domain {
    protected temperatureResistance: number;

    constructor(x: number, y: number, energy: number, size: number, speed: number, color: string, lifespan: number, temperatureResistance: number) {
        super(x, y, energy, size, speed, color, lifespan);
        this.temperatureResistance = temperatureResistance;
    }

    public update(dt: number, organisms: Organism[]): void {
        // Basic movement
        const angle = Math.random() * Math.PI * 2;
        const distance = this.speed * dt;

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
    }
}
