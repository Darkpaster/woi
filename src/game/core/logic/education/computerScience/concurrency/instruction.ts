import {Process} from "./process.ts";

export class Instruction {
    private action: (process: Process) => boolean;
    private description: string;

    constructor(action: (process: Process) => boolean, description: string) {
        this.action = action;
        this.description = description;
    }

    public execute(process: Process): boolean {
        return this.action(process);
    }

    public getDescription(): string {
        return this.description;
    }
}