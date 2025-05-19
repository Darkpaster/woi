// Viruses aren't in any domain, so they directly extend Organism
import {Organism} from "../organism.ts";

export abstract class Virus extends Organism {
    protected infectionRate: number;

    constructor(x: number, y: number, energy: number, size: number, speed: number, color: string, lifespan: number, infectionRate: number) {
        super(x, y, energy, size, speed, color, lifespan);
        this.infectionRate = infectionRate;
    }

    public update(dt: number, organisms: Organism[]): void {
        // Viruses move toward the nearest potential host
        let nearestHost: Organism | null = null;
        let minDistance = Infinity;

        for (const organism of organisms) {
            if (organism === this || organism instanceof Virus) continue;

            const dx = organism.getPosition().x - this.x;
            const dy = organism.getPosition().y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearestHost = organism;
            }
        }

        if (nearestHost) {
            // Move toward nearest host
            const dx = nearestHost.getPosition().x - this.x;
            const dy = nearestHost.getPosition().y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const moveX = (dx / distance) * this.speed * dt;
                const moveY = (dy / distance) * this.speed * dt;

                this.move(moveX, moveY, 800, 600);
            }

            // Try to infect if close enough
            if (distance < nearestHost.getSize() + this.size) {
                if (Math.random() < this.infectionRate * dt) {
                    // Successful infection
                    this.gainEnergy(nearestHost.getEnergy() * 0.1);
                    // Host loses energy
                    // (We can't directly modify the host's energy here)
                }
            }
        } else {
            // Random movement if no host is found
            const angle = Math.random() * Math.PI * 2;
            const distance = this.speed * dt;

            this.move(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                800, // Canvas width
                600  // Canvas height
            );
        }

        // Consume energy
        this.consumeEnergy(0.02 * dt);

        // Age the organism
        this.age += dt;
    }
}