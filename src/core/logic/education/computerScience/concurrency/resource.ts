import {Process, ProcessState} from "./process.ts";

export class Resource {
    private id: string;
    private name: string;
    private available: boolean;
    private owner: Process | null;
    private waitQueue: Process[];

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.available = true;
        this.owner = null;
        this.waitQueue = [];
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public isAvailable(): boolean {
        return this.available;
    }

    public getOwner(): Process | null {
        return this.owner;
    }

    public acquire(process: Process): boolean {
        if (this.available) {
            this.available = false;
            this.owner = process;
            return true;
        }

        this.waitQueue.push(process);
        return false;
    }

    public release(process: Process): void {
        if (this.owner === process) {
            if (this.waitQueue.length > 0) {
                this.owner = this.waitQueue.shift()!;
                this.owner.setState(ProcessState.Ready);
            } else {
                this.available = true;
                this.owner = null;
            }
        }
    }
}