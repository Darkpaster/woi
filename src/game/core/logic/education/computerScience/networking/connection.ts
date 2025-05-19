import {NetworkNode} from "./networkNode.ts";

export class Connection {
    private source: NetworkNode;
    private destination: NetworkNode;
    private bandwidth: number; // bits per second
    private latency: number; // milliseconds
    private currentLoad: number; // bits per second

    constructor(source: NetworkNode, destination: NetworkNode, bandwidth: number, latency: number) {
        this.source = source;
        this.destination = destination;
        this.bandwidth = bandwidth;
        this.latency = latency;
        this.currentLoad = 0;
    }

    public getSource(): NetworkNode {
        return this.source;
    }

    public getDestination(): NetworkNode {
        return this.destination;
    }

    public getBandwidth(): number {
        return this.bandwidth;
    }

    public getLatency(): number {
        return this.latency;
    }

    public getCurrentLoad(): number {
        return this.currentLoad;
    }

    public addLoad(load: number): void {
        this.currentLoad += load;
    }

    public removeLoad(load: number): void {
        this.currentLoad -= load;
        if (this.currentLoad < 0) {
            this.currentLoad = 0;
        }
    }

    public getTransmissionTime(packetSize: number): number {
        // Calculate transmission time based on bandwidth and latency
        const transmissionTime = (packetSize / this.bandwidth) * 1000; // milliseconds
        return transmissionTime + this.latency;
    }
}