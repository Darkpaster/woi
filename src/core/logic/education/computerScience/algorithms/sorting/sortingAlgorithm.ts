import {Algorithm} from "../algorithm.ts";

export class SortingAlgorithm extends Algorithm {
    protected array: number[];
    protected comparisons: number;
    protected swaps: number;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.array = [];
        this.comparisons = 0;
        this.swaps = 0;
    }

    public setArray(array: number[]): void {
        this.array = [...array];
        this.inputData = [...array];
    }

    public render(): void {
        // Visualization implementation for sorting algorithms
        // Would visualize the current state of the array, highlighting compared elements
        console.log("Rendering array:", this.array);
    }

    public getComparisons(): number {
        return this.comparisons;
    }

    public getSwaps(): number {
        return this.swaps;
    }
}