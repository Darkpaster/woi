import {PipelineStep, PipelineStepType} from "./pipelineStep.ts";

export class Pipeline {
    private id: string;
    private name: string;
    private steps: PipelineStep[];
    private status: PipelineStatus;
    private progress: number; // 0-1
    private currentStepIndex: number;

    constructor(name: string) {
        this.id = `pipeline-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.name = name;
        this.steps = [];
        this.status = PipelineStatus.Defined;
        this.progress = 0;
        this.currentStepIndex = 0;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getSteps(): PipelineStep[] {
        return this.steps;
    }

    public getStatus(): PipelineStatus {
        return this.status;
    }

    public getProgress(): number {
        return this.progress;
    }

    public addStep(name: string, type: PipelineStepType, resourceRequirement: number): PipelineStep {
        const step = new PipelineStep(name, type, resourceRequirement);
        this.steps.push(step);
        return step;
    }

    public start(): void {
        if (this.steps.length === 0) {
            return;
        }

        this.status = PipelineStatus.Running;
        this.progress = 0;
        this.currentStepIndex = 0;
    }

    public updateProgress(timeStep: number): void {
        if (this.status !== PipelineStatus.Running) return;

        if (this.currentStepIndex >= this.steps.length) {
            this.status = PipelineStatus.Completed;
            this.progress = 1;
            return;
        }

        const currentStep = this.steps[this.currentStepIndex];
        currentStep.updateProgress(timeStep);

        if (currentStep.isComplete()) {
            this.currentStepIndex++;

            if (this.currentStepIndex >= this.steps.length) {
                this.status = PipelineStatus.Completed;
                this.progress = 1;
            }
        }

// Update overall progress
        if (this.steps.length > 0) {
            const completedSteps = this.currentStepIndex;
            const currentStepProgress = this.currentStepIndex < this.steps.length ?
                this.steps[this.currentStepIndex].getProgress() : 0;

            this.progress = (completedSteps + currentStepProgress) / this.steps.length;
        }
    }

    public reset(): void {
        this.status = PipelineStatus.Defined;
        this.progress = 0;
        this.currentStepIndex = 0;

        this.steps.forEach(step => step.reset());
    }
}

export enum PipelineStatus {
    Defined,
    Running,
    Paused,
    Completed,
    Failed
}