import {NetworkNode} from "./networkNode.ts";
import {Connection} from "./connection.ts";
import {Protocol} from "./protocol.ts";

export class Packet {
    private source: NetworkNode;
    private destination: NetworkNode;
    private data: any;
    private protocol: Protocol;
    private size: number; // in bytes
    private currentConnection: Connection | null;
    private progress: number; // 0-1 range
    private transmissionTime: number;

    constructor(source: NetworkNode, destination: NetworkNode, data: any, protocol: Protocol) {
        this.source = source;
        this.destination = destination;
        this.data = data;
        this.protocol = protocol;
        this.size = JSON.stringify(data).length;
        this.currentConnection = null;
        this.progress = 0;
        this.transmissionTime = 0;
    }

    public getSource(): NetworkNode {
        return this.source;
    }

    public getDestination(): NetworkNode {
        return this.destination;
    }

    public getData(): any {
        return this.data;
    }

    public getProtocol(): Protocol {
        return this.protocol;
    }

    public getSize(): number {
        return this.size;
    }

    public setCurrentConnection(connection: Connection): void {
        this.currentConnection = connection;
        if (connection) {
            this.transmissionTime = connection.getTransmissionTime(this.size);
            connection.addLoad(this.size * 8); // Convert bytes to bits
        }
    }

    public getCurrentConnection(): Connection | null {
        return this.currentConnection;
    }

    public update(timeStep: number): void {
        if (!this.currentConnection) return;

        const progressIncrement = timeStep / this.transmissionTime;
        this.progress += progressIncrement;

        if (this.progress >= 1) {
            this.progress = 1;
            this.currentConnection.removeLoad(this.size * 8);
            this.currentConnection = null;
        }
    }

    public hasArrived(): boolean {
        return this.progress >= 1;
    }

    public getProgress(): number {
        return this.progress;
    }
}