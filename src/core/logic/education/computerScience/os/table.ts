export class Table {
    private name: string;
    private columns: Column[];
    private rows: any[][];
    private primaryKeyIndex: number;

    constructor(name: string, columns: Column[]) {
        this.name = name;
        this.columns = columns;
        this.rows = [];

        // Find primary key column
        this.primaryKeyIndex = columns.findIndex(column => column.isPrimaryKey());
        if (this.primaryKeyIndex === -1) {
            this.primaryKeyIndex = 0; // Default to first column if no primary key
        }
    }

    public getName(): string {
        return this.name;
    }

    public getColumns(): Column[] {
        return [...this.columns];
    }

    public getColumnIndex(name: string): number {
        return this.columns.findIndex(column => column.getName() === name);
    }

    public insertRow(values: any[]): boolean {
        if (values.length !== this.columns.length) {
            return false;
        }

        // Validate values against column types
        for (let i = 0; i < values.length; i++) {
            if (!this.columns[i].validateValue(values[i])) {
                return false;
            }
        }

        // Check primary key constraint
        if (this.primaryKeyIndex !== -1) {
            const primaryKeyValue = values[this.primaryKeyIndex];
            if (this.findRowByPrimaryKey(primaryKeyValue) !== -1) {
                return false; // Primary key already exists
            }
        }

        this.rows.push([...values]);
        return true;
    }

    public updateRow(primaryKeyValue: any, columnName: string, newValue: any): boolean {
        const rowIndex = this.findRowByPrimaryKey(primaryKeyValue);
        if (rowIndex === -1) {
            return false;
        }

        const columnIndex = this.getColumnIndex(columnName);
        if (columnIndex === -1) {
            return false;
        }

        if (!this.columns[columnIndex].validateValue(newValue)) {
            return false;
        }

        this.rows[rowIndex][columnIndex] = newValue;
        return true;
    }

    public deleteRow(primaryKeyValue: any): boolean {
        const rowIndex = this.findRowByPrimaryKey(primaryKeyValue);
        if (rowIndex === -1) {
            return false;
        }

        this.rows.splice(rowIndex, 1);
        return true;
    }

    public findRowByPrimaryKey(value: any): number {
        return this.rows.findIndex(row => row[this.primaryKeyIndex] === value);
    }

    public selectRows(condition?: (row: any[]) => boolean): any[][] {
        if (!condition) {
            return [...this.rows];
        }

        return this.rows.filter(condition);
    }

    public getRowCount(): number {
        return this.rows.length;
    }
}