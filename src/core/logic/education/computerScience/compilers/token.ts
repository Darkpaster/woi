export class Token {
    public type: TokenType;
    public value: string;
    public line: number;
    public column: number;

    constructor(type: TokenType, value: string, line: number, column: number) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

export enum TokenType {
    Keyword,
    Identifier,
    Literal,
    Operator,
    Separator,
    Comment
}