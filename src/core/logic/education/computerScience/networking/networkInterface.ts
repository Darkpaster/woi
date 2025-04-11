import {Connection} from "./connection.ts";

export class NetworkInterface {
    private name: string;
    private ipAddress: string;
    private subnetMask: string;
    private connection: Connection;

    constructor(name: string, ipAddress: string, subnetMask: string, connection: Connection) {
        this.name = name;
        this.ipAddress = ipAddress;
        this.subnetMask = subnetMask;
        this.connection = connection;
    }

    public getName(): string {
        return this.name;
    }

    public getIpAddress(): string {
        return this.ipAddress;
    }

    public getSubnetMask(): string {
        return this.subnetMask;
    }

    public getConnection(): Connection {
        return this.connection;
    }
}