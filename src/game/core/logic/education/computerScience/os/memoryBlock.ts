import {Process} from "../concurrency/process.ts";

export class MemoryBlock {
    public start: number;
    public size: number;
    public process: Process | null;

    constructor(start: number, size: number, process: Process | null) {
        this.start = start;
        this.size = size;
        this.process = process;
    }
}