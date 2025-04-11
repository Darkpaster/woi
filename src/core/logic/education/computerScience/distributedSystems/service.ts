export class Service {
    private name: string;
    private type: ServiceType;
    private status: ServiceStatus;
    private hostNode: Node | null;
    private resourceRequirement: number;

    constructor(name: string, type: ServiceType, resourceRequirement: number) {
        this.name = name;
        this.type = type;
        this.status = ServiceStatus.Pending;
        this.hostNode = null;
        this.resourceRequirement = resourceRequirement;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): ServiceType {
        return this.type;
    }

    public getStatus(): ServiceStatus {
        return this.status;
    }

    public setStatus(status: ServiceStatus): void {
        this.status = status;
    }

    public getHostNode(): Node | null {
        return this.hostNode;
    }

    public getResourceRequirement(): number {
        return this.resourceRequirement;
    }

    public deploy(node: Node): boolean {
        if (node.allocateCapacity(this.resourceRequirement)) {
            if (this.hostNode) {
                // Release resources from previous node
                this.hostNode.releaseCapacity(this.resourceRequirement);
            }

            this.hostNode = node;
            this.status = ServiceStatus.Running;
            return true;
        }

        return false;
    }

    public migrate(newNode: Node): boolean {
        return this.deploy(newNode);
    }

    public terminate(): void {
        if (this.hostNode) {
            this.hostNode.releaseCapacity(this.resourceRequirement);
            this.hostNode = null;
        }

        this.status = ServiceStatus.Terminated;
    }
}

export enum ServiceType {
    WebServer,
    Database,
    Cache,
    MessageQueue,
    LoadBalancer,
    AuthService,
    FileStorage
}

export enum ServiceStatus {
    Pending,
    Running,
    Unavailable,
    Terminated
}