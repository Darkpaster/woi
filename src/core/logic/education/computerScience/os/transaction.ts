export class Transaction {
    private id: string;
    private operations: Operation[];
    private status: TransactionStatus;

    constructor() {
        this.id = `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.operations = [];
        this.status = TransactionStatus.Active;
    }

    public getId(): string {
        return this.id;
    }

    public addOperation(operation: Operation): void {
        if (this.status === TransactionStatus.Active) {
            this.operations.push(operation);
        }
    }

    public commit(): boolean {
        if (this.status !== TransactionStatus.Active) {
            return false;
        }

        this.status = TransactionStatus.Committed;
        return true;
    }

    public abort(): void {
        if (this.status === TransactionStatus.Active) {
            // Rollback operations in reverse order
            for (let i = this.operations.length - 1; i >= 0; i--) {
                this.operations[i].rollback();
            }

            this.status = TransactionStatus.Aborted;
        }
    }

    public isActive(): boolean {
        return this.status === TransactionStatus.Active;
    }

    public isCommitted(): boolean {
        return this.status === TransactionStatus.Committed;
    }

    public isAborted(): boolean {
        return this.status === TransactionStatus.Aborted;
    }
}

enum TransactionStatus {
    Active,
    Committed,
    Aborted
}