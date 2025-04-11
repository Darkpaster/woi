// Simulation infrastructure
import {SimulationEntity} from "./simulationEntity.ts";

export class SimulationManager {
    private entities: Map<string, SimulationEntity>;
    private running: boolean;
    private speed: number;
    private currentTime: number;

    constructor() {
        this.entities = new Map<string, SimulationEntity>();
        this.running = false;
        this.speed = 1.0;
        this.currentTime = 0;
    }

    public addEntity(entity: SimulationEntity): void {
        this.entities.set(entity.getId(), entity);
    }

    public removeEntity(id: string): void {
        this.entities.delete(id);
    }

    public getEntity(id: string): SimulationEntity | undefined {
        return this.entities.get(id);
    }

    public start(): void {
        this.running = true;
        this.simulationLoop();
    }

    public stop(): void {
        this.running = false;
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
    }

    private simulationLoop(): void {
        if (!this.running) return;

        const timeStep = 16 * this.speed; // ~60fps with speed multiplier
        this.currentTime += timeStep;

        // Update all entities
        this.entities.forEach(entity => {
            entity.simulate(timeStep);
        });

        // Render all entities
        this.entities.forEach(entity => {
            entity.render();
        });

        requestAnimationFrame(() => this.simulationLoop());
    }
}