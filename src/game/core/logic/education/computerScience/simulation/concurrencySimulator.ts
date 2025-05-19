import {SimulationEntity} from "../../../../../../utils/simulation/simulationEntity.ts";
import {Process, ProcessState} from "../concurrency/process.ts";
import {Resource} from "../concurrency/resource.ts";
import {RoundRobinScheduler} from "../concurrency/roundRobinShedulder.ts";

export class ConcurrencySimulator extends SimulationEntity {
    private processes: Process[];
    private resources: Resource[];
    private scheduler: Scheduler;
    private time: number;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.processes = [];
        this.resources = [];
        this.scheduler = new RoundRobinScheduler();
        this.time = 0;
    }

    public addProcess(process: Process): void {
        this.processes.push(process);
        process.setState(ProcessState.Ready);
    }

    public removeProcess(process: Process): void {
        const index = this.processes.indexOf(process);
        if (index !== -1) {
            this.processes.splice(index, 1);
        }
    }

    public addResource(resource: Resource): void {
        this.resources.push(resource);
    }

    public setScheduler(scheduler: Scheduler): void {
        this.scheduler = scheduler;
    }

    public simulate(timeStep: number): void {
        this.time += timeStep;

        // Let the scheduler decide which process to run
        const runningProcess = this.scheduler.schedule(this.processes);

        // Update process states
        this.processes.forEach(process => {
            if (process === runningProcess) {
                process.setState(ProcessState.Running);
            } else if (process.getState() === ProcessState.Running) {
                process.setState(ProcessState.Ready);
            }

            process.simulate(timeStep);
        });
    }

    public render(): void {
        // Visualization of the concurrency simulator
        console.log("Time:", this.time);
        this.processes.forEach(process => process.render());
    }
}

export interface Scheduler {
    schedule(processes: Process[]): Process | null;
}