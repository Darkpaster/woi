export class AlgorithmStep {
    private action: () => void;
    private reverseAction: () => void;
    private description: string;

    constructor(action: () => void, reverseAction: () => void, description: string) {
        this.action = action;
        this.reverseAction = reverseAction;
        this.description = description;
    }

    public execute(): void {
        this.action();
    }

    public undo(): void {
        this.reverseAction();
    }

    public getDescription(): string {
        return this.description;
    }
}