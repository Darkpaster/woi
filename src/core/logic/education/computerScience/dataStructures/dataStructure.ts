import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";

export abstract class DataStructure extends SimulationEntity {
    protected elements: any[];
    protected operations: number;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.elements = [];
        this.operations = 0;
    }

    public getElements(): any[] {
        return [...this.elements];
    }

    public getOperations(): number {
        return this.operations;
    }

    public clear(): void {
        this.elements = [];
    }

    abstract insert(element: any): void;
    abstract remove(element: any): boolean;
    abstract search(element: any): boolean;

    public simulate(timeStep: number): void {
        // Simulation logic for data structures
    }
}