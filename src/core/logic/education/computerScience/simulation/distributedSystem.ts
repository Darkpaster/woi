import {Service, ServiceStatus, ServiceType} from "../distributedSystems/service.ts";
import {Message} from "../distributedSystems/message.ts";
import {ConsensusAlgorithm, PartitionManager} from "../distributedSystems/partitionManager.ts";
import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";
import {RaftConsensus} from "../distributedSystems/consensusAlgorithm.ts";
import {NodeStatus} from "../distributedSystems/node.ts";

export class DistributedSystem extends SimulationEntity {
    private nodes: Node[];
    private services: Service[];
    private messageQueue: Message[];
    private consensus: ConsensusAlgorithm;
    private partitionManager: PartitionManager;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.nodes = [];
        this.services = [];
        this.messageQueue = [];
        this.consensus = new RaftConsensus();
        this.partitionManager = new PartitionManager();
    }

    public addNode(name: string, capacity: number, reliability: number): Node {
        const node = new Node(name, capacity, reliability);
        this.nodes.push(node);

        if (this.nodes.length > 2) {
            // Update consensus participants when we have enough nodes
            this.consensus.updateParticipants(this.nodes);
        }

        return node;
    }

    public removeNode(name: string): boolean {
        const index = this.nodes.findIndex(node => node.getName() === name);

        if (index !== -1) {
            // Handle service migration
            const node = this.nodes[index];
            const services = this.services.filter(service => service.getHostNode() === node);

            // Try to migrate services to other nodes
            services.forEach(service => {
                const newNode = this.findAvailableNode(service.getResourceRequirement());
                if (newNode) {
                    service.migrate(newNode);
                } else {
                    // Service becomes unavailable
                    service.setStatus(ServiceStatus.Unavailable);
                }
            });

            this.nodes.splice(index, 1);

            // Update consensus participants
            if (this.nodes.length > 2) {
                this.consensus.updateParticipants(this.nodes);
            }

            return true;
        }

        return false;
    }

    public deployService(name: string, type: ServiceType, resourceRequirement: number): Service | null {
        const node = this.findAvailableNode(resourceRequirement);

        if (!node) {
            return null; // No suitable node found
        }

        const service = new Service(name, type, resourceRequirement);
        service.deploy(node);
        this.services.push(service);

        return service;
    }

    public sendMessage(source: string, destination: string, content: any): void {
        const message = new Message(source, destination, content);
        this.messageQueue.push(message);
    }

    public simulateNetworkPartition(partitionedNodes: Node[]): void {
        this.partitionManager.createPartition(partitionedNodes);
    }

    public healNetworkPartition(): void {
        this.partitionManager.healPartitions();

        // Re-establish consensus
        this.consensus.resetElection();
        this.consensus.updateParticipants(this.nodes);
    }

    private findAvailableNode(resourceRequirement: number): Node | null {
        return this.nodes.find(node =>
            node.getStatus() === NodeStatus.Online &&
            node.getAvailableCapacity() >= resourceRequirement
        ) || null;
    }

    public simulate(timeStep: number): void {
        // Update node statuses based on reliability
        this.nodes.forEach(node => {
            node.simulate(timeStep);
        });

        // Process messages in queue
        const pendingMessages = [...this.messageQueue];
        this.messageQueue = [];

        pendingMessages.forEach(message => {
            const sourceNode = this.nodes.find(node => node.getName() === message.getSource());
            const destNode = this.nodes.find(node => node.getName() === message.getDestination());

            if (sourceNode && destNode) {
                // Check if nodes can communicate (not partitioned)
                if (!this.partitionManager.arePartitioned(sourceNode, destNode)) {
                    // Simulate network latency and packet loss
                    const deliverySuccess = Math.random() < 0.95; // 5% packet loss

                    if (deliverySuccess) {
                        // Deliver with some latency
                        setTimeout(() => {
                            destNode.receiveMessage(message);
                        }, Math.random() * 100); // 0-100ms latency
                    }
                }
            }
        });

        // Update services
        this.services.forEach(service => {
            const hostNode = service.getHostNode();
            if (hostNode && hostNode.getStatus() === NodeStatus.Online) {
                service.setStatus(ServiceStatus.Running);
            } else {
                service.setStatus(ServiceStatus.Unavailable);
            }
        });

        // Run consensus algorithm
        this.consensus.simulate(timeStep);
    }

    public render(): void {
        console.log("Distributed System Status:");
        console.log(`Nodes: ${this.nodes.length} (${this.nodes.filter(n => n.getStatus() === NodeStatus.Online).length} online)`);
        console.log(`Services: ${this.services.length} (${this.services.filter(s => s.getStatus() === ServiceStatus.Running).length} running)`);
        console.log(`Leader: ${this.consensus.getLeader()?.getName() || 'None'}`);
    }
}