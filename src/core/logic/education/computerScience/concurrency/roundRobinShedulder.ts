import {Scheduler} from "../simulation/concurrencySimulator.ts";
import {Process, ProcessState} from "./process.ts";

export class RoundRobinScheduler implements Scheduler {
    private timeQuantum: number;
    private currentTime: number;
    private currentProcessIndex: number;

    constructor(timeQuantum: number = 100) {
        this.timeQuantum = timeQuantum;
        this.currentTime = 0;
        this.currentProcessIndex = -1;
    }

    public schedule(processes: Process[]): Process | null {
        if (processes.length === 0) return null;

        const readyProcesses = processes.filter(p => p.getState() === ProcessState.Ready);
        if (readyProcesses.length === 0) return null;

        this.currentProcessIndex = (this.currentProcessIndex + 1) % readyProcesses.length;
        return readyProcesses[this.currentProcessIndex];
    }
}