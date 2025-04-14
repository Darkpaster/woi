import {DeviceRequest} from "./deviceRequest.ts";

export abstract class Device {
    protected name: string;
    protected busy: boolean;
    protected queue: DeviceRequest[];

    constructor(name: string) {
        this.name = name;
        this.busy = false;
        this.queue = [];
    }

    public getName(): string {
        return this.name;
    }

    public isBusy(): boolean {
        return this.busy;
    }

    public queueRequest(request: DeviceRequest): void {
        this.queue.push(request);
    }

    public abstract simulate(timeStep: number): void;
}