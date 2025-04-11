export class PartitionManager {
    private partitions: Set<Node>[];

    constructor() {
        this.partitions = [];
    }

    public createPartition(partitionedNodes: Node[]): void {
        // Remove nodes from existing partitions
        this.partitions.forEach(partition => {
            partitionedNodes.forEach(node => {
                partition.delete(node);
            });
        });

        // Clean up empty partitions
        this.partitions = this.partitions.filter(partition => partition.size > 0);

        // Create new partition
        const newPartition = new Set<Node>(partitionedNodes);
        this.partitions.push(newPartition);
    }

    public healPartitions(): void {
        this.partitions = [];
    }

    public arePartitioned(node1: Node, node2: Node): boolean {
        // Check if nodes are in different partitions
        for (const partition of this.partitions) {
            if (partition.has(node1) && !partition.has(node2)) {
                return true;
            }

            if (partition.has(node2) && !partition.has(node1)) {
                return true;
            }
        }

        return false;
    }
}

export interface ConsensusAlgorithm {
    updateParticipants(nodes: Node[]): void;
    getLeader(): Node | null;
    resetElection(): void;
    simulate(timeStep: number): void;
}