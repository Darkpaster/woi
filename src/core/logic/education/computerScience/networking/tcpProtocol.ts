import {Protocol} from "./protocol.ts";
import {Packet} from "./packet.ts";
import {TCPConnection} from "./tcpConnection.ts";

export class TCPProtocol implements Protocol {
    private name: string = "TCP";
    private connections: Map<string, TCPConnection>;

    constructor() {
        this.connections = new Map<string, TCPConnection>();
    }

    public getName(): string {
        return this.name;
    }

    public processPacket(packet: Packet): void {
        const data = packet.getData();

        if (data.type === "SYN") {
            // Handle connection establishment
            const connectionId = `${packet.getSource().getIpAddress()}:${data.sourcePort}-${packet.getDestination().getIpAddress()}:${data.destPort}`;
            const connection = new TCPConnection(connectionId, data.sourcePort, data.destPort);
            this.connections.set(connectionId, connection);

        } else if (data.type === "DATA") {
            // Handle data transfer
            const connectionId = `${packet.getSource().getIpAddress()}:${data.sourcePort}-${packet.getDestination().getIpAddress()}:${data.destPort}`;
            const connection = this.connections.get(connectionId);

            if (connection) {
                connection.receiveData(data.data, data.sequenceNumber);
            }

        } else if (data.type === "FIN") {
            // Handle connection termination
            const connectionId = `${packet.getSource().getIpAddress()}:${data.sourcePort}-${packet.getDestination().getIpAddress()}:${data.destPort}`;
            this.connections.delete(connectionId);
        }
    }
}