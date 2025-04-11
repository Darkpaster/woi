export class ASTNode {
    public type: string;
    public value: any;
    public children: ASTNode[];

    constructor(type: string, value: any) {
        this.type = type;
        this.value = value;
        this.children = [];
    }

    public addChild(node: ASTNode): void {
        this.children.push(node);
    }
}