import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";
import {Process, ProcessState} from "../concurrency/process.ts";
import {Scheduler} from "../concurrency/concurrencySimulator.ts";
import {RoundRobinScheduler} from "../concurrency/roundRobinShedulder.ts";

export class OperatingSystem extends SimulationEntity {
    private processes: Process[];
    private memoryManager: MemoryManager;
    private fileSystem: FileSystem;
    private scheduler: Scheduler;
    private deviceManager: DeviceManager;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.processes = [];
        this.memoryManager = new MemoryManager(1024 * 1024); // 1MB of memory
        this.fileSystem = new FileSystem();
        this.scheduler = new RoundRobinScheduler();
        this.deviceManager = new DeviceManager();
    }

    public createProcess(name: string, priority: number, memoryRequirement: number): Process | null {
        // Allocate memory
        const memoryBlock = this.memoryManager.allocate(memoryRequirement);
        if (!memoryBlock) {
            return null; // Not enough memory
        }

        // Create process
        const process = new Process(`process-${this.processes.length}`, name, `Process ${name}`);
        process.setPriority(priority);

        this.processes.push(process);
        return process;
    }

    public terminateProcess(process: Process): void {
        // Release all resources
        process.setState(ProcessState.Terminated);

        // Remove from process list
        const index = this.processes.indexOf(process);
        if (index !== -1) {
            this.processes.splice(index, 1);
        }
    }

    public getFileSystem(): FileSystem {
        return this.fileSystem;
    }

    public simulate(timeStep: number): void {
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

        // Simulate device operations
        this.deviceManager.simulate(timeStep);
    }

    public render(): void {
        // Visualization of the operating system
        console.log("OS Processes:", this.processes.length);
        console.log("Memory usage:", this.memoryManager.getUsedMemory(), "/", this.memoryManager.getTotalMemory());
    }
}