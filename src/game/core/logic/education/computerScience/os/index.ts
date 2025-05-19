import {Table} from "./table.ts";

export class Index {
    private table: Table;
    private columnName: string;
    private map: Map<any, number[]>;

    constructor(table: Table, columnName: string) {
        this.table = table;
        this.columnName = columnName;
        this.map = new Map<any, number[]>();
        this.rebuild();
    }

    public rebuild(): void {
        this.map.clear();

        const columnIndex = this.table.getColumnIndex(this.columnName);
        if (columnIndex === -1) return;

        const rows = this.table.selectRows();
        for (let i = 0; i < rows.length; i++) {
            const value = rows[i][columnIndex];

            if (!this.map.has(value)) {
                this.map.set(value, []);
            }

            this.map.get(value)?.push(i);
        }
    }

    public lookup(value: any): number[] {
        return this.map.get(value) || [];
    }
}