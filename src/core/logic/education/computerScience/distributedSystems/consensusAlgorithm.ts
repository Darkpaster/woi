import {ConsensusAlgorithm} from "./partitionManager.ts";
import {NodeStatus} from "./node.ts";
import {Message} from "./message.ts";

export class RaftConsensus implements ConsensusAlgorithm {
    private participants: Node[];
    private leader: Node | null;
    private term: number;
    private votes: Map<string, number>;
    private electionTimeout: number;
    private heartbeatInterval: number;
    private timeSinceLastHeartbeat: number;

    constructor() {
        this.participants = [];
        this.leader = null;
        this.term = 0;
        this.votes = new Map<string, number>();
        this.electionTimeout = 300 + Math.random() * 150; // 300-450ms
        this.heartbeatInterval = 150; // 150ms
        this.timeSinceLastHeartbeat = 0;
    }

    public updateParticipants(nodes: Node[]): void {
        this.participants = nodes.filter(node => node.getStatus() === NodeStatus.Online);

        // Set message handlers for Raft protocol
        this.participants.forEach(node => {
            node.setMessageHandler((message: Message) => {
                this.handleMessage(node, message);
            });
        });

        // Trigger election if needed
        if (!this.leader || this.leader.getStatus() !== NodeStatus.Online) {
            this.startElection();
        }
    }

    public getLeader(): Node | null {
        return this.leader;
    }

    public resetElection(): void {
        this.leader = null;
        this.term++;
        this.votes.clear();
        this.electionTimeout = 300 + Math.random() * 150;
        this.timeSinceLastHeartbeat = 0;
    }

    public simulate(timeStep: number): void {
        if (this.participants.length < 3) {
            return; // Need at least 3 nodes for consensus
        }

        this.timeSinceLastHeartbeat += timeStep;

        if (this.leader && this.leader.getStatus() === NodeStatus.Online) {
            // Leader sends heartbeats
            if (this.timeSinceLastHeartbeat >= this.heartbeatInterval) {
                this.sendHeartbeat();
                this.timeSinceLastHeartbeat = 0;
            }
        } else if (this.timeSinceLastHeartbeat >= this.electionTimeout) {
            // Start election if timeout reached
            this.startElection();
            this.timeSinceLastHeartbeat = 0;
            this.electionTimeout = 300 + Math.random() * 150; // Reset with jitter
        }
    }

    private startElection(): void {
        if (this.participants.length < 3) return;

        this.term++;
        this.votes.clear();

        // Randomly select a candidate
        const onlineNodes = this.participants.filter(node => node.getStatus() === NodeStatus.Online);
        if (onlineNodes.length === 0) return;

        const candidate = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];

        // Candidate votes for itself
        this.votes.set(candidate.getName(), 1);

        // Request votes from other nodes
        onlineNodes.forEach(node => {
            if (node !== candidate) {
                const message = new Message(
                    candidate.getName(),
                    node.getName(),
                    {type: "RequestVote", term: this.term, candidateId: candidate.getName()}
                );

                node.receiveMessage(message);
            }
        });
    }

    private sendHeartbeat(): void {
        if (!this.leader) return;

        this.participants.forEach(node => {
            if (node !== this.leader && node.getStatus() === NodeStatus.Online) {
                const message = new Message(
                    this.leader.getName(),
                    node.getName(),
                    {type: "AppendEntries", term: this.term, leaderId: this.leader.getName()}
                );

                node.receiveMessage(message);
            }
        });
    }

    private handleMessage(node: Node, message: Message): void {
        const content = message.getContent();

        if (!content || !content.type) return;

        if (content.type === "RequestVote") {
            // Vote request handling
            if (content.term >= this.term) {
                // Update term if higher
                if (content.term > this.term) {
                    this.term = content.term;
                    this.leader = null;
                }

                // Send vote response
                const voteGranted = !this.leader; // Vote if we haven't voted yet

                if (voteGranted) {
                    const response = new Message(
                        node.getName(),
                        message.getSource(),
                        {type: "VoteResponse", term: this.term, voteGranted: true}
                    );

                    // Find the source node and send response
                    const sourceNode = this.participants.find(p => p.getName() === message.getSource());
                    if (sourceNode && sourceNode.getStatus() === NodeStatus.Online) {
                        sourceNode.receiveMessage(response);
                    }
                }
            }
        } else if (content.type === "VoteResponse") {
            // Process vote response
            if (content.voteGranted && content.term === this.term) {
                // Increment votes for the candidate
                const candidateId = message.getDestination();
                this.votes.set(candidateId, (this.votes.get(candidateId) || 0) + 1);

                // Check if we have majority
                const majority = Math.floor(this.participants.length / 2) + 1;
                if (this.votes.get(candidateId) >= majority) {
                    // Candidate wins election
                    const newLeader = this.participants.find(p => p.getName() === candidateId);
                    if (newLeader && newLeader.getStatus() === NodeStatus.Online) {
                        this.leader = newLeader;
                        this.sendHeartbeat(); // Send immediate heartbeat
                    }
                }
            }
        } else if (content.type === "AppendEntries") {
            // Heartbeat handling
            if (content.term >= this.term) {
                this.term = content.term;

                // Recognize sender as leader
                const leaderId = content.leaderId;
                const leaderNode = this.participants.find(p => p.getName() === leaderId);

                if (leaderNode && leaderNode.getStatus() === NodeStatus.Online) {
                    this.leader = leaderNode;
                    this.timeSinceLastHeartbeat = 0; // Reset timeout
                }
            }
        }
    }
}