export class QueryResult {
    private columns: string[];
    private rows: any[][];
    private rowsAffected: number;
    private error: string | null;

    constructor(columns: string[] = [], rows: any[][] = [], rowsAffected: number = 0, error: string | null = null) {
        this.columns = columns;
        this.rows = rows;
        this.rowsAffected = rowsAffected;
        this.error = error;
    }

    public getColumns(): string[] {
        return [...this.columns];
    }

    public getRows(): any[][] {
        return [...this.rows];
    }

    public getRowsAffected(): number {
        return this.rowsAffected;
    }

    public hasError(): boolean {
        return this.error !== null;
    }

    public getError(): string | null {
        return this.error;
    }
}