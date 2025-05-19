export class SecureResource {
    private id: string;
    private name: string;
    private type: ResourceType;
    private sensitivity: SensitivityLevel;

    constructor(name: string, type: ResourceType, sensitivity: SensitivityLevel) {
        this.id = `resource-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.name = name;
        this.type = type;
        this.sensitivity = sensitivity;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): ResourceType {
        return this.type;
    }

    public getSensitivity(): SensitivityLevel {
        return this.sensitivity;
    }
}

export enum ResourceType {
    File,
    Database,
    Application,
    Network,
    System
}

export enum SensitivityLevel {
    Public,
    Internal,
    Confidential,
    Restricted,
    Secret
}