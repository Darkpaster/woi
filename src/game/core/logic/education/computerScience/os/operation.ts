export class Operation {
    private action: () => void;
    private rollbackAction: () => void;

    constructor(action: () => void, rollbackAction: () => void) {
        this.action = action;
        this.rollbackAction = rollbackAction;
    }

    public execute(): void {
        this.action();
    }

    public rollback(): void {
        this.rollbackAction();
    }
}