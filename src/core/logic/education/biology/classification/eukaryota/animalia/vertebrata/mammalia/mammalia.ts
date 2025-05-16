import {Eukarya} from "../../../eukarya.ts";
import {Organism} from "../../../../organism.ts";

export abstract class Mammal extends Eukarya {
    protected bodyTemperature: number;

    constructor(x: number, y: number, energy: number, size: number, speed: number, color: string, lifespan: number, complexity: number, bodyTemperature: number) {
        super(x, y, energy, size, speed, color, lifespan, complexity);
        this.bodyTemperature = bodyTemperature;
    }

    public update(dt: number, organisms: Organism[]): void {
        // More directed movement for mammals
        // Find the nearest food source
        let nearestFood: Organism | null = null;
        let minDistance = Infinity;

        for (const organism of organisms) {
            if (organism === this || organism instanceof Mammal) continue;

            const dx = organism.getPosition().x - this.x;
            const dy = organism.getPosition().y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearestFood = organism;
            }
        }

        if (nearestFood && minDistance < 200) {
            // Move toward food
            const dx = nearestFood.getPosition().x - this.x;
            const dy = nearestFood.getPosition().y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const moveX = (dx / distance) * this.speed * dt;
                const moveY = (dy / distance) * this.speed * dt;

                this.move(moveX, moveY, 800, 600);
            }

            // Try to eat if close enough
            if (distance < nearestFood.getSize() + this.size) {
                this.gainEnergy(nearestFood.getEnergy() * 0.3);
                // In a real simulation, we would also need to handle removing the eaten organism
            }
        } else {
            // Random movement if no food is nearby
            const angle = Math.random() * Math.PI * 2;
            const distance = this.speed * dt;

            this.move(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                800, // Canvas width
                600  // Canvas height
            );
        }

        // Consume energy based on size, complexity, and body temperature
        this.consumeEnergy((this.size * 0.01 + this.complexity * 0.005 + this.bodyTemperature * 0.001) * dt);

        // Age the organism
        this.age += dt;
    }
}