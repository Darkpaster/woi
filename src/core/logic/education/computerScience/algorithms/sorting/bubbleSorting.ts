import {SortingAlgorithm} from "./sortingAlgorithm.ts";
import {AlgorithmStep} from "../algorithmStep.ts";

export class BubbleSorting extends SortingAlgorithm {
    constructor() {
        super("bubble-sort", "Bubble Sort", "A simple comparison-based sorting algorithm");
    }

    public initialize(): void {
        this.steps = [];
        this.comparisons = 0;
        this.swaps = 0;

        // Create steps for bubble sort
        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array.length - i - 1; j++) {
                const currentJ = j;

                // Add comparison step
                this.steps.push(new AlgorithmStep(
                    () => { this.comparisons++; },
                    () => { this.comparisons--; },
                    `Compare elements at indices ${j} and ${j + 1}`
                ));

                // Add swap step if needed
                this.steps.push(new AlgorithmStep(
                    () => {
                        if (this.array[currentJ] > this.array[currentJ + 1]) {
                            const temp = this.array[currentJ];
                            this.array[currentJ] = this.array[currentJ + 1];
                            this.array[currentJ + 1] = temp;
                            this.swaps++;
                        }
                    },
                    () => {
                        if (this.array[currentJ] < this.array[currentJ + 1]) {
                            const temp = this.array[currentJ];
                            this.array[currentJ] = this.array[currentJ + 1];
                            this.array[currentJ + 1] = temp;
                            this.swaps--;
                        }
                    },
                    `Swap elements if needed`
                ));
            }
        }
    }

    public simulate(timeStep: number): void {
        super.simulate(timeStep);
        // Animation logic for bubble sort
    }
}