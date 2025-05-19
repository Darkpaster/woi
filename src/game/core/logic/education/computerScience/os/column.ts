export class Column {
    private name: string;
    private dataType: DataType;
    private notNull: boolean;
    private primaryKey: boolean;

    constructor(name: string, dataType: DataType, notNull: boolean = false, primaryKey: boolean = false) {
        this.name = name;
        this.dataType = dataType;
        this.notNull = notNull;
        this.primaryKey = primaryKey;
    }

    public getName(): string {
        return this.name;
    }

    public getDataType(): DataType {
        return this.dataType;
    }

    public isNotNull(): boolean {
        return this.notNull;
    }

    public isPrimaryKey(): boolean {
        return this.primaryKey;
    }

    public validateValue(value: any): boolean {
        if (value === null || value === undefined) {
            return !this.notNull;
        }

        switch (this.dataType) {
            case DataType.Integer:
                return Number.isInteger(value);
            case DataType.Float:
                return typeof value === 'number';
            case DataType.String:
                return typeof value === 'string';
            case DataType.Boolean:
                return typeof value === 'boolean';
            case DataType.Date:
                return value instanceof Date;
            default:
                return false;
        }
    }
}

export enum DataType {
    Integer,
    Float,
    String,
    Boolean,
    Date
}