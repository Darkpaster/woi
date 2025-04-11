import {VisualState} from "./visualState.ts";

export abstract class SimulationEntity {
    protected id: string;
    protected name: string;
    protected description: string;
    protected visualState: VisualState;

    constructor(id: string, name: string, description: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.visualState = new VisualState();
    }

    abstract simulate(timeStep: number): void;
    abstract render(): void;

    public getId(): string { return this.id; }
    public getName(): string { return this.name; }
    public getDescription(): string { return this.description; }
}