import {Process} from "../concurrency/process.ts";

export class DeviceRequest {
    public process: Process;
    public operation: string;
    public data: any;
    public callback: (result: any) => void;

    constructor(process: Process, operation: string, data: any, callback: (result: any) => void) {
        this.process = process;
        this.operation = operation;
        this.data = data;
        this.callback = callback;
    }
}