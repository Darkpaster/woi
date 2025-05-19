import {Message} from "./message.ts";

export class Node {
    private name: string;
    private status: NodeStatus;
    private capacity: number;
    private usedCapacity: number;
    private reliability: number;
    private uptime: number;
    private messageHandler: (message: Message) => void;

    constructor(name: string, capacity: number, reliability: number) {
        this.name = name;
        this.status = NodeStatus.Online;
        this.capacity = capacity;
        this.usedCapacity = 0;
        this.reliability = Math.min(1, Math.max(0, reliability)); // Between 0-1
        this.uptime = 0;
        this.messageHandler = () => {}; // Default no-op handler
    }

    public getName(): string {
        return this.name;
    }

    public getStatus(): NodeStatus {
        return this.status;
    }

    public setStatus(status: NodeStatus): void {
        this.status = status;

        if (status === NodeStatus.Online) {
            this.uptime = 0;
        }
    }

    public allocateCapacity(amount: number): boolean {
        if (this.usedCapacity + amount <= this.capacity) {
            this.usedCapacity += amount;
            return true;
        }
        return false;
    }

    public releaseCapacity(amount: number): void {
        this.usedCapacity = Math.max(0, this.usedCapacity - amount);
    }

    public getAvailableCapacity(): number {
        return this.capacity - this.usedCapacity;
    }

    public setMessageHandler(handler: (message: Message) => void): void {
        this.messageHandler = handler;
    }

    public receiveMessage(message: Message): void {
        this.messageHandler(message);
    }

    public simulate(timeStep: number): void {
        if (this.status === NodeStatus.Online) {
            this.uptime += timeStep;

            // Chance of failure based on reliability
            const failureChance = (1 - this.reliability) * (timeStep / 3600); // Higher chance the longer it runs

            if (Math.random() < failureChance) {
                this.status = NodeStatus.Failed;
            }
        } else if (this.status === NodeStatus.Failed) {
            // Chance of recovery
            const recoveryChance = this.reliability * (timeStep / 1800);

            if (Math.random() < recoveryChance) {
                this.status = NodeStatus.Online;
                this.uptime = 0;
            }
        }
    }
}

export enum NodeStatus {
    Online,
    Failed,
    Maintenance,
    Partitioned
}