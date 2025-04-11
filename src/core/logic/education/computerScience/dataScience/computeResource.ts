export class ComputeResource {
    private id: string;
    private name: string;
    private type: ComputeResourceType;
    private capacity: number;
    private availableCapacity: number;
    private utilizationHistory: Array<{ timestamp: number, utilization: number }>;

    constructor(name: string, type: ComputeResourceType, capacity: number) {
        this.id = `resource-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.availableCapacity = capacity;
        this.utilizationHistory = [];
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): ComputeResourceType {
        return this.type;
    }

    public getCapacity(): number {
        return this.capacity;
    }

    public getAvailableCapacity(): number {
        return this.availableCapacity;
    }

    public getUtilization(): number {
        return 1 - (this.availableCapacity / this.capacity);
    }

    public getUtilizationHistory(): Array<{ timestamp: number, utilization: number }> {
        return this.utilizationHistory;
    }

    public allocateCapacity(amount: number): boolean {
        if (amount > this.availableCapacity) {
            return false;
        }

        this.availableCapacity -= amount;
        return true;
    }

    public releaseCapacity(amount: number): void {
        this.availableCapacity = Math.min(this.capacity, this.availableCapacity + amount);
    }

    public simulate(timeStep: number): void {
        // Record utilization history
        this.utilizationHistory.push({
            timestamp: Date.now(),
            utilization: this.getUtilization()
        });

        // Keep only the last 100 data points
        if (this.utilizationHistory.length > 100) {
            this.utilizationHistory.shift();
        }
    }
}

export enum ComputeResourceType {
    CPU,
    GPU,
    TPU,
    DistributedCluster,
    CloudInstance
}

// Type definitions for return types
export interface TrainingResult {
    success: boolean;
    accuracy: number;
    trainingTime: number;
    message: string;
}

export interface PredictionResult {
    success: boolean;
    predictions: any[];
    accuracy: number;
    message: string;
}

export interface PipelineResult {
    success: boolean;
    stepResults: Array<{
        stepName: string;
        success: boolean;
        time: number;
        message: string;
    }>;
    totalTime: number;
    message: string;
}