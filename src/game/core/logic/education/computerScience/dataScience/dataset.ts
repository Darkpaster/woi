export class Dataset {
    private id: string;
    private name: string;
    private type: DatasetType;
    private size: number; // in MB
    private features: number;
    private quality: number; // 0-1

    constructor(name: string, type: DatasetType, size: number) {
        this.id = `dataset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.name = name;
        this.type = type;
        this.size = size;
        this.features = Math.floor(Math.random() * 50) + 5; // 5-55 features
        this.quality = 0.5 + Math.random() * 0.5; // 0.5-1.0 quality
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): DatasetType {
        return this.type;
    }

    public getSize(): number {
        return this.size;
    }

    public getFeatures(): number {
        return this.features;
    }

    public getQuality(): number {
        return this.quality;
    }

    public cleanData(intensityFactor: number): void {
        // Improve data quality
        this.quality = Math.min(1, this.quality + (0.1 * intensityFactor));
    }

    public sampleData(sampleSize: number): Dataset {
        if (sampleSize >= this.size) {
            return this;
        }

        const sampledDataset = new Dataset(
            `${this.name}_sample`,
            this.type,
            sampleSize
        );

        return sampledDataset;
    }
}

export enum DatasetType {
    Tabular,
    TimeSeries,
    Text,
    Image,
    Graph
}