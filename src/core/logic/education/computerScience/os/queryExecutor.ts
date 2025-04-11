import {DatabaseSystem} from "./databaseSystem.ts";
import {Transaction} from "./transaction.ts";
import {QueryResult} from "./queryResult.ts";

export class QueryExecutor {
    private db: DatabaseSystem;

    constructor(db: DatabaseSystem) {
        this.db = db;
    }

    public execute(query: string, transaction?: Transaction): QueryResult {
        // This is a simplified implementation
        // In reality, this would parse and execute SQL queries

        try {
            if (query.toLowerCase().startsWith("select")) {
                return this.executeSelect(query);
            } else if (query.toLowerCase().startsWith("insert")) {
                return this.executeInsert(query, transaction);
            } else if (query.toLowerCase().startsWith("update")) {
                return this.executeUpdate(query, transaction);
            } else if (query.toLowerCase().startsWith("delete")) {
                return this.executeDelete(query, transaction);
            } else if (query.toLowerCase().startsWith("create table")) {
                return this.executeCreateTable(query);
            } else {
                return new QueryResult([], [], 0, `Unsupported query: ${query}`);
            }
        } catch (error: any) {
            return new QueryResult([], [], 0, error.message);
        }
    }

    private executeSelect(query: string): QueryResult {
        // Very simplified implementation - would need a proper SQL parser
        const tableName = this.extractTableName(query);
        const table = this.db.getTable(tableName);

        if (!table) {
            return new QueryResult([], [], 0, `Table not found: ${tableName}`);
        }

        const columns = table.getColumns();
        const columnNames = columns.map(column => column.getName());
        const rows = table.selectRows();

        return new QueryResult(columnNames, rows, 0);
    }

    private executeInsert(query: string, transaction?: Transaction): QueryResult {
        // Simplified implementation
        const tableName = this.extractTableName(query);
        const table = this.db.getTable(tableName);

        if (!table) {
            return new QueryResult([], [], 0, `Table not found: ${tableName}`);
        }

        // Extract values (very simplified)
        const valuesMatch = query.match(/VALUES\s*\((.*)\)/i);
        if (!valuesMatch) {
            return new QueryResult([], [], 0, "Invalid INSERT statement");
        }

        const valueStr = valuesMatch[1];
        const values = valueStr.split(",").map(value => value.trim());

        const success = table.insertRow(values);

        return new QueryResult([], [], success ? 1 : 0, success ? null : "Insert failed");
    }

    private executeUpdate(query: string, transaction?: Transaction): QueryResult {
        // Simplified implementation
        return new QueryResult([], [], 0, "Update not implemented");
    }

    private executeDelete(query: string, transaction?: Transaction): QueryResult {
        // Simplified implementation
        return new QueryResult([], [], 0, "Delete not implemented");
    }

    private executeCreateTable(query: string): QueryResult {
        // Simplified implementation
        return new QueryResult([], [], 0, "Create table not implemented");
    }

    private extractTableName(query: string): string {
        // Very simplified - would need proper SQL parsing
        const fromMatch = query.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    }

    // Completing the QueryExecutor.extractTableName method first
    private extractTableName(query: string): string {
        // Very simplified - would need proper SQL parsing
        const fromMatch = query.match(/FROM\s+([a-zA-Z0-9_]+)/i);
        if (fromMatch && fromMatch[1]) {
            return fromMatch[1];
        }

        const insertMatch = query.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
        if (insertMatch && insertMatch[1]) {
            return insertMatch[1];
        }

        const updateMatch = query.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
        if (updateMatch && updateMatch[1]) {
            return updateMatch[1];
        }

        const deleteMatch = query.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)/i);
        if (deleteMatch && deleteMatch[1]) {
            return deleteMatch[1];
        }

        return "";
    }
}