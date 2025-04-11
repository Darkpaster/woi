import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";
import {NetworkInterface} from "./networkInterface.ts";
import {RoutingTable} from "./routingTable.ts";
import {Packet} from "./packet.ts";

export class NetworkNode extends SimulationEntity {
    private ipAddress: string;
    private macAddress: string;
    private interfaces: NetworkInterface[];
    private routingTable: RoutingTable;
    private packetQueue: Packet[];

    constructor(id: string, name: string, description: string, ipAddress: string, macAddress: string) {
        super(id, name, description);
        this.ipAddress = ipAddress;
        this.macAddress = macAddress;
        this.interfaces = [];
        this.routingTable = new RoutingTable();
        this.packetQueue = [];
    }

    public getIpAddress(): string {
        return this.ipAddress;
    }

    public getMacAddress(): string {
        return this.macAddress;
    }

    public addInterface(networkInterface: NetworkInterface): void {
        this.interfaces.push(networkInterface);
    }

    public sendPacket(packet: Packet): void {
        // Find next hop using routing table
        const nextHop = this.routingTable.getNextHop(packet.getDestination().getIpAddress());

        if (nextHop) {
            // Find connection to next hop
            const connection = this.interfaces.find(iface =>
                iface.getConnection().getDestination().getIpAddress() === nextHop);

            if (connection) {
                // Send packet through connection
                packet.setCurrentConnection(connection.getConnection());
            }
        }
    }

    public receivePacket(packet: Packet): void {
        if (packet.getDestination() === this) {
            // Process packet
            const protocol = packet.getProtocol();
            protocol.processPacket(packet);
        } else {
            // Forward packet
            this.packetQueue.push(packet);
        }
    }

    public simulate(timeStep: number): void {
        // Process packet queue
        if (this.packetQueue.length > 0) {
            const packet = this.packetQueue.shift();
            if (packet) {
                this.sendPacket(packet);
            }
        }
    }

    public render(): void {
        // Visualization of the network node
        console.log(`Node ${this.name} (${this.ipAddress})`);
    }
}