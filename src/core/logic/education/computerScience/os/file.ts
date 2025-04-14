import {FSNode} from "./fsNode.ts";
import {Directory} from "./directory.ts";

export class File extends FSNode {
    private content: string;

    constructor(name: string, parent: Directory | null) {
        super(name, parent);
        this.content = "";
    }

    public getContent(): string {
        return this.content;
    }

    public setContent(content: string): void {
        this.content = content;
        this.lastModifiedTime = new Date();
    }

    public getSize(): number {
        return this.content.length;
    }
}