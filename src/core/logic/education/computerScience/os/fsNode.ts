export abstract class FSNode {
    protected name: string;
    protected parent: Directory | null;
    protected creationTime: Date;
    protected lastModifiedTime: Date;

    constructor(name: string, parent: Directory | null) {
        this.name = name;
        this.parent = parent;
        this.creationTime = new Date();
        this.lastModifiedTime = new Date();
    }

    public getName(): string {
        return this.name;
    }

    public getParent(): Directory | null {
        return this.parent;
    }

    public getCreationTime(): Date {
        return this.creationTime;
    }

    public getLastModifiedTime(): Date {
        return this.lastModifiedTime;
    }

    abstract getSize(): number;
}