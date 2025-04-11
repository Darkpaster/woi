import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";
import {NetworkNode} from "./networkNode.ts";
import {Connection} from "./connection.ts";
import {Packet} from "./packet.ts";
import {Protocol} from "./protocol.ts";

export class NetworkSimulator extends SimulationEntity {
    private nodes: NetworkNode[];
    private connections: Connection[];
    private packets: Packet[];
    private protocols: Map<string, Protocol>;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.nodes = [];
        this.connections = [];
        this.packets = [];
        this.protocols = new Map<string, Protocol>();
    }

    public addNode(node: NetworkNode): void {
        this.nodes.push(node);
    }

    public removeNode(node: NetworkNode): void {
        const index = this.nodes.indexOf(node);
        if (index !== -1) {
            this.nodes.splice(index, 1);

            // Remove all connections to this node
            this.connections = this.connections.filter(c =>
                c.getSource() !== node && c.getDestination() !== node);
        }
    }

    public addConnection(source: NetworkNode, destination: NetworkNode, bandwidth: number, latency: number): Connection {
        const connection = new Connection(source, destination, bandwidth, latency);
        this.connections.push(connection);
        return connection;
    }

    public sendPacket(source: NetworkNode, destination: NetworkNode, data: any, protocol: Protocol): void {
        const packet = new Packet(source, destination, data, protocol);
        source.sendPacket(packet);
        this.packets.push(packet);
    }

    public registerProtocol(protocol: Protocol): void {
        this.protocols.set(protocol.getName(), protocol);
    }

    public simulate(timeStep: number): void {
        // Update packet positions
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const packet = this.packets[i];
            packet.update(timeStep);

            if (packet.hasArrived()) {
                packet.getDestination().receivePacket(packet);
                this.packets.splice(i, 1);
            }
        }

        // Update nodes
        this.nodes.forEach(node => node.simulate(timeStep));
    }

    public render(): void {
        // Visualization of the network
        console.log("Network nodes:", this.nodes.length);
        console.log("Active packets:", this.packets.length);
    }
}