import {FSNode} from "./fsNode.ts";

export class Directory extends FSNode {
    private children: Map<string, FSNode>;

    constructor(name: string, parent: Directory | null) {
        super(name, parent);
        this.children = new Map<string, FSNode>();
    }

    public getChildren(): FSNode[] {
        return Array.from(this.children.values());
    }

    public getChild(name: string): FSNode | undefined {
        return this.children.get(name);
    }

    public addChild(node: FSNode): void {
        this.children.set(node.getName(), node);
        this.lastModifiedTime = new Date();
    }

    public removeChild(name: string): boolean {
        const result = this.children.delete(name);
        if (result) {
            this.lastModifiedTime = new Date();
        }
        return result;
    }

    public getSize(): number {
        let totalSize = 0;
        this.children.forEach(child => {
            totalSize += child.getSize();
        });
        return totalSize;
    }
}