import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";
import {AlgorithmStep} from "./algorithmStep.ts";

export abstract class Algorithm extends SimulationEntity {
    protected steps: AlgorithmStep[];
    protected currentStepIndex: number;
    protected inputData: any[];
    protected outputData: any[];
    protected executionTime: number;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.steps = [];
        this.currentStepIndex = 0;
        this.inputData = [];
        this.outputData = [];
        this.executionTime = 0;
    }

    public setInputData(data: any[]): void {
        this.inputData = [...data];
    }

    public getOutputData(): any[] {
        return [...this.outputData];
    }

    public stepForward(): boolean {
        if (this.currentStepIndex >= this.steps.length) return false;

        const step = this.steps[this.currentStepIndex];
        step.execute();
        this.currentStepIndex++;
        return true;
    }

    public stepBackward(): boolean {
        if (this.currentStepIndex <= 0) return false;

        this.currentStepIndex--;
        const step = this.steps[this.currentStepIndex];
        step.undo();
        return true;
    }

    public reset(): void {
        this.currentStepIndex = 0;
        this.outputData = [];
        this.executionTime = 0;
    }

    abstract initialize(): void;

    public simulate(timeStep: number): void {
        this.executionTime += timeStep;
    }
}