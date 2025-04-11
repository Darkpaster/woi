export class PipelineStep {
    private id: string;
    private name: string;
    private type: PipelineStepType;
    private resourceRequirement: number;
    private progress: number;
    private executionTime: number;

    constructor(name: string, type: PipelineStepType, resourceRequirement: number) {
        this.id = `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.name = name;
        this.type = type;
        this.resourceRequirement = resourceRequirement;
        this.progress = 0;
        this.executionTime = this.calculateExecutionTime();
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): PipelineStepType {
        return this.type;
    }

    public getResourceRequirement(): number {
        return this.resourceRequirement;
    }

    public getProgress(): number {
        return this.progress;
    }

    public isComplete(): boolean {
        return this.progress >= 1;
    }

    public estimateTime(computeResource: ComputeResource): number {
        return this.executionTime / (computeResource.getCapacity() / this.resourceRequirement);
    }

    public updateProgress(timeStep: number): void {
        // Update progress based on time step
        const progressIncrement = timeStep / this.executionTime;
        this.progress = Math.min(1, this.progress + progressIncrement);
    }

    public reset(): void {
        this.progress = 0;
    }

    private calculateExecutionTime(): number {
        // Base execution time based on step type
        let baseTime = 10; // Default time in seconds

        switch (this.type) {
            case PipelineStepType.DataLoading:
                baseTime = 5;
                break;
            case PipelineStepType.DataCleaning:
                baseTime = 15;
                break;
            case PipelineStepType.FeatureEngineering:
                baseTime = 20;
                break;
            case PipelineStepType.ModelTraining:
                baseTime = 30;
                break;
            case PipelineStepType.ModelEvaluation:
                baseTime = 10;
                break;
            case PipelineStepType.DataTransformation:
                baseTime = 12;
                break;
            case PipelineStepType.Visualization:
                baseTime = 8;
                break;
        }

        // Adjust for resource requirements
        return baseTime * (this.resourceRequirement / 10);
    }
}

export enum PipelineStepType {
    DataLoading,
    DataCleaning,
    FeatureEngineering,
    ModelTraining,
    ModelEvaluation,
    DataTransformation,
    Visualization
}