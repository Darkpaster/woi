import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";

export class DatabaseSystem extends SimulationEntity {
    private tables: Table[];
    private indexes: Index[];
    private transactions: Transaction[];
    private queryExecutor: QueryExecutor;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.tables = [];
        this.indexes = [];
        this.transactions = [];
        this.queryExecutor = new QueryExecutor(this);
    }

    public createTable(name: string, columns: Column[]): Table {
        const table = new Table(name, columns);
        this.tables.push(table);
        return table;
    }

    public dropTable(name: string): boolean {
        const index = this.tables.findIndex(table => table.getName() === name);
        if (index !== -1) {
            this.tables.splice(index, 1);
            return true;
        }
        return false;
    }

    public getTable(name: string): Table | undefined {
        return this.tables.find(table => table.getName() === name);
    }

    public createIndex(table: Table, columnName: string): Index {
        const index = new Index(table, columnName);
        this.indexes.push(index);
        return index;
    }

    public beginTransaction(): Transaction {
        const transaction = new Transaction();
        this.transactions.push(transaction);
        return transaction;
    }

    public executeQuery(query: string, transaction?: Transaction): QueryResult {
        return this.queryExecutor.execute(query, transaction);
    }

    public simulate(timeStep: number): void {
        // Process active transactions
        for (let i = this.transactions.length - 1; i >= 0; i--) {
            const transaction = this.transactions[i];

            if (transaction.isCommitted() || transaction.isAborted()) {
                this.transactions.splice(i, 1);
            }
        }
    }

    public render(): void {
        // Visualization of the database system
        console.log("Database Tables:", this.tables.length);
        console.log("Active Transactions:", this.transactions.length);
    }
}