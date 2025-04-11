// Concurrency section
import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";

export class Process extends SimulationEntity {
    protected state: ProcessState;
    protected priority: number;
    protected resources: Map<string, Resource>;
    protected instructions: Instruction[];
    protected instructionPointer: number;
    protected waitingFor: string | null;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.state = ProcessState.New;
        this.priority = 0;
        this.resources = new Map<string, Resource>();
        this.instructions = [];
        this.instructionPointer = 0;
        this.waitingFor = null;
    }

    public setState(state: ProcessState): void {
        this.state = state;
    }

    public getState(): ProcessState {
        return this.state;
    }

    public setPriority(priority: number): void {
        this.priority = priority;
    }

    public getPriority(): number {
        return this.priority;
    }

    public addInstruction(instruction: Instruction): void {
        this.instructions.push(instruction);
    }

    public acquireResource(resource: Resource): boolean {
        if (resource.acquire(this)) {
            this.resources.set(resource.getId(), resource);
            return true;
        }
        this.waitingFor = resource.getId();
        return false;
    }

    public releaseResource(resourceId: string): void {
        const resource = this.resources.get(resourceId);
        if (resource) {
            resource.release(this);
            this.resources.delete(resourceId);
        }
    }

    public simulate(timeStep: number): void {
        if (this.state !== ProcessState.Running) return;

        if (this.instructionPointer < this.instructions.length) {
            const instruction = this.instructions[this.instructionPointer];
            if (instruction.execute(this)) {
                this.instructionPointer++;
            }
        } else {
            this.state = ProcessState.Terminated;
        }
    }

    public render(): void {
        // Visualization of the process
        console.log(`Process ${this.name}: ${ProcessState[this.state]}`);
    }
}

export enum ProcessState {
    New,
    Ready,
    Running,
    Waiting,
    Terminated
}