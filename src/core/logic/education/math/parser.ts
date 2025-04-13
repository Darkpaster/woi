type NodeType = 'BinaryExpression' | 'UnaryExpression' | 'Literal' | 'FunctionCall' | 'Variable';

interface Node {
    type: NodeType;
}

interface BinaryExpression extends Node {
    type: 'BinaryExpression';
    operator: string;
    left: Node;
    right: Node;
}

interface UnaryExpression extends Node {
    type: 'UnaryExpression';
    operator: string;
    argument: Node;
}

interface Literal extends Node {
    type: 'Literal';
    value: number;
}

interface FunctionCall extends Node {
    type: 'FunctionCall';
    name: string;
    arguments: Node[];
}

interface Variable extends Node {
    type: 'Variable';
    name: string;
}

interface Token {
    type: 'number' | 'operator' | 'leftParen' | 'rightParen' | 'comma' | 'identifier';
    value: string;
}

const OPERATORS = {
    '+': { precedence: 1, associativity: 'left' },
    '-': { precedence: 1, associativity: 'left' },
    '*': { precedence: 2, associativity: 'left' },
    '/': { precedence: 2, associativity: 'left' },
    '%': { precedence: 2, associativity: 'left' },
    '^': { precedence: 3, associativity: 'right' }
};

// const FUNCTIONS = new Set([
//     'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
//     'sinh', 'cosh', 'tanh',
//     'log', 'ln', 'log10', 'exp', 'sqrt', 'abs',
//     'floor', 'ceil', 'round', 'min', 'max'
// ]);

class Lexer {
    private text: string;
    private position: number;
    private currentChar: string | null;

    constructor(text: string) {
        this.text = text.replace(/\s+/g, ''); // Удаляем все пробелы
        this.position = 0;
        this.currentChar = this.text.length > 0 ? this.text[0] : null;
    }

    private advance(): void {
        this.position++;
        this.currentChar = this.position < this.text.length ? this.text[this.position] : null;
    }

    // private peek(offset: number = 1): string | null {
    //     const peekPos = this.position + offset;
    //     return peekPos < this.text.length ? this.text[peekPos] : null;
    // }

    private isDigit(char: string | null): boolean {
        return char !== null && /[0-9]/.test(char);
    }

    private isAlpha(char: string | null): boolean {
        return char !== null && /[a-zA-Z]/.test(char);
    }

    private isAlphaNumeric(char: string | null): boolean {
        return char !== null && /[0-9a-zA-Z]/.test(char);
    }

    private parseNumber(): Token {
        let numStr = '';

        // Обработка целой части
        while (this.currentChar !== null && this.isDigit(this.currentChar)) {
            numStr += this.currentChar;
            this.advance();
        }

        // Обработка десятичной точки и дробной части
        if (this.currentChar === '.') {
            numStr += '.';
            this.advance();

            while (this.currentChar !== null && this.isDigit(this.currentChar)) {
                numStr += this.currentChar;
                this.advance();
            }
        }

        // Обработка научной нотации (e.g., 1.23e-4)
        if (this.currentChar === 'e' || this.currentChar === 'E') {
            numStr += this.currentChar;
            this.advance();

            if (<string>this.currentChar === '+' || <string>this.currentChar === '-') {
                numStr += this.currentChar;
                this.advance();
            }

            while (this.currentChar !== null && this.isDigit(this.currentChar)) {
                numStr += this.currentChar;
                this.advance();
            }
        }

        return { type: 'number', value: numStr };
    }

    private parseIdentifier(): Token {
        let result = '';

        while (this.currentChar !== null && this.isAlphaNumeric(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }

        return { type: 'identifier', value: result };
    }

    public nextToken(): Token | null {
        while (this.currentChar !== null) {
            if (this.isDigit(this.currentChar)) {
                return this.parseNumber();
            }

            if (this.isAlpha(this.currentChar)) {
                return this.parseIdentifier();
            }

            if (this.currentChar === '(') {
                this.advance();
                return { type: 'leftParen', value: '(' };
            }

            if (this.currentChar === ')') {
                this.advance();
                return { type: 'rightParen', value: ')' };
            }

            if (this.currentChar === ',') {
                this.advance();
                return { type: 'comma', value: ',' };
            }

            // Операторы
            if (['+', '-', '*', '/', '%', '^'].includes(this.currentChar)) {
                const op = this.currentChar;
                this.advance();
                return { type: 'operator', value: op };
            }

            this.advance(); // Пропускаем неизвестные символы
        }

        return null;
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        let token = this.nextToken();

        while (token !== null) {
            tokens.push(token);
            token = this.nextToken();
        }

        return tokens;
    }
}

class Parser {
    private tokens: Token[];
    private current: number;

    constructor(expression: string) {
        const lexer = new Lexer(expression);
        this.tokens = lexer.tokenize();
        this.current = 0;
    }

    private peek(): Token | null {
        return this.current < this.tokens.length ? this.tokens[this.current] : null;
    }

    private consume(): Token {
        if (this.current >= this.tokens.length) {
            throw new Error('Unexpected end of expression');
        }
        return this.tokens[this.current++];
    }

    // private match(tokenType: string): boolean {
    //     const token = this.peek();
    //     if (token && token.type === tokenType) {
    //         this.consume();
    //         return true;
    //     }
    //     return false;
    // }

    private expect(tokenType: string, message: string): Token {
        const token = this.peek();
        if (token && token.type === tokenType) {
            return this.consume();
        }
        throw new Error(message || `Expected ${tokenType} but found ${token?.type || 'end of expression'}`);
    }

    public parse(): Node {
        const expression = this.parseExpression();

        if (this.peek() !== null) {
            throw new Error(`Unexpected token: ${this.peek()?.value}`);
        }

        return expression;
    }

    private parseExpression(): Node {
        return this.parseBinaryExpression(0);
    }

    private parseBinaryExpression(minPrecedence: number): Node {
        let left = this.parseUnaryExpression();

        while (true) {
            const token = this.peek();

            if (!token || token.type !== 'operator') {
                break;
            }

            const operator = token.value;
            const opInfo = OPERATORS[operator as keyof typeof OPERATORS];

            if (!opInfo || opInfo.precedence < minPrecedence) {
                break;
            }

            this.consume(); // Consume the operator

            const nextMinPrecedence = opInfo.associativity === 'left'
                ? opInfo.precedence + 1
                : opInfo.precedence;

            const right = this.parseBinaryExpression(nextMinPrecedence);

            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            } as BinaryExpression;
        }

        return left;
    }

    private parseUnaryExpression(): Node {
        // Обработка унарных операторов +, -
        if (this.peek()?.type === 'operator' && (this.peek()?.value === '+' || this.peek()?.value === '-')) {
            const operator = this.consume().value;
            const argument = this.parseUnaryExpression();

            return {
                type: 'UnaryExpression',
                operator,
                argument
            } as UnaryExpression;
        }

        return this.parsePrimary();
    }

    private parsePrimary(): Node {
        const token = this.peek();

        if (!token) {
            throw new Error('Unexpected end of expression');
        }

        // Обработка чисел
        if (token.type === 'number') {
            this.consume();
            return {
                type: 'Literal',
                value: parseFloat(token.value)
            } as Literal;
        }

        // Обработка идентификаторов (переменных и функций)
        if (token.type === 'identifier') {
            const identifier = this.consume().value;

            // Если за идентификатором следует открывающая скобка, это вызов функции
            if (this.peek()?.type === 'leftParen') {
                return this.parseFunction(identifier);
            }

            // В противном случае это переменная
            return {
                type: 'Variable',
                name: identifier
            } as Variable;
        }

        // Обработка выражений в скобках
        if (token.type === 'leftParen') {
            this.consume(); // Потребляем '('
            const expression = this.parseExpression();
            this.expect('rightParen', "Expected ')' after expression");
            return expression;
        }

        throw new Error(`Unexpected token: ${token.value}`);
    }

    private parseFunction(name: string): Node {
        this.expect('leftParen', `Expected '(' after function name '${name}'`);
        const args: Node[] = [];

        // Проверяем, есть ли аргументы
        if (this.peek()?.type !== 'rightParen') {
            // Парсим первый аргумент
            args.push(this.parseExpression());

            // Парсим остальные аргументы
            while (this.peek()?.type === 'comma') {
                this.consume(); // Потребляем ','
                args.push(this.parseExpression());
            }
        }

        this.expect('rightParen', `Expected ')' after arguments of function '${name}'`);

        return {
            type: 'FunctionCall',
            name,
            arguments: args
        } as FunctionCall;
    }
}

// Класс для вычисления значения выражения на основе AST
class Evaluator {
    private variables: Record<string, number>;

    constructor(variables: Record<string, number> = {}) {
        this.variables = {
            'pi': Math.PI,
            'e': Math.E,
            ...variables
        };
    }

    public evaluate(node: Node): number {
        switch (node.type) {
            case 'Literal':
                return (node as Literal).value;

            case 'Variable':
                const varName = (node as Variable).name;
                if (this.variables[varName] === undefined) {
                    throw new Error(`Undefined variable: ${varName}`);
                }
                return this.variables[varName];

            case 'UnaryExpression':
                const unaryNode = node as UnaryExpression;
                const value = this.evaluate(unaryNode.argument);

                switch (unaryNode.operator) {
                    case '+': return +value;
                    case '-': return -value;
                    default:
                        throw new Error(`Unknown unary operator: ${unaryNode.operator}`);
                }

            case 'BinaryExpression':
                const binaryNode = node as BinaryExpression;
                const left = this.evaluate(binaryNode.left);
                const right = this.evaluate(binaryNode.right);

                switch (binaryNode.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/':
                        if (right === 0) throw new Error('Division by zero');
                        return left / right;
                    case '%': return left % right;
                    case '^': return Math.pow(left, right);
                    default:
                        throw new Error(`Unknown binary operator: ${binaryNode.operator}`);
                }

            case 'FunctionCall':
                const funcNode = node as FunctionCall;
                const args = funcNode.arguments.map(arg => this.evaluate(arg));

                return this.callFunction(funcNode.name, args);

            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    private callFunction(name: string, args: number[]): number {
        switch (name.toLowerCase()) {
            case 'sin': return Math.sin(args[0]);
            case 'cos': return Math.cos(args[0]);
            case 'tan': return Math.tan(args[0]);
            case 'asin': return Math.asin(args[0]);
            case 'acos': return Math.acos(args[0]);
            case 'atan': return Math.atan(args[0]);
            case 'atan2': return Math.atan2(args[0], args[1]);
            case 'sinh': return Math.sinh(args[0]);
            case 'cosh': return Math.cosh(args[0]);
            case 'tanh': return Math.tanh(args[0]);
            case 'log':
                if (args.length === 1) return Math.log(args[0]);
                return Math.log(args[0]) / Math.log(args[1]); // log_base(value)
            case 'ln': return Math.log(args[0]);
            case 'log10': return Math.log10(args[0]);
            case 'exp': return Math.exp(args[0]);
            case 'sqrt': return Math.sqrt(args[0]);
            case 'abs': return Math.abs(args[0]);
            case 'floor': return Math.floor(args[0]);
            case 'ceil': return Math.ceil(args[0]);
            case 'round': return Math.round(args[0]);
            case 'min': return Math.min(...args);
            case 'max': return Math.max(...args);
            default:
                throw new Error(`Unknown function: ${name}`);
        }
    }

    // Метод для установки значения переменной
    public setVariable(name: string, value: number): void {
        this.variables[name] = value;
    }
}


// Класс для форматирования AST обратно в строковое выражение
class Formatter {
    public format(node: Node): string {
        switch (node.type) {
            case 'Literal':
                return (node as Literal).value.toString();

            case 'Variable':
                return (node as Variable).name;

            case 'UnaryExpression': {
                const unaryNode = node as UnaryExpression;
                const argStr = this.format(unaryNode.argument);

                // Добавляем скобки вокруг аргумента, если это сложное выражение
                const needParens = unaryNode.argument.type !== 'Literal' &&
                    unaryNode.argument.type !== 'Variable' &&
                    unaryNode.argument.type !== 'FunctionCall';

                return `${unaryNode.operator}${needParens ? '(' + argStr + ')' : argStr}`;
            }

            case 'BinaryExpression': {
                const binaryNode = node as BinaryExpression;
                const leftStr = this.format(binaryNode.left);
                const rightStr = this.format(binaryNode.right);

                // Определяем приоритет текущего оператора
                const currentOp = OPERATORS[binaryNode.operator as keyof typeof OPERATORS];
                const currentPrecedence = currentOp.precedence;

                // Проверяем, нужны ли скобки для левого операнда
                let leftNeedsParens = false;
                if (binaryNode.left.type === 'BinaryExpression') {
                    const leftOp = (binaryNode.left as BinaryExpression).operator;
                    const leftOpInfo = OPERATORS[leftOp as keyof typeof OPERATORS];
                    leftNeedsParens = leftOpInfo.precedence < currentPrecedence ||
                        (leftOpInfo.precedence === currentPrecedence &&
                            currentOp.associativity === 'right');
                }

                // Проверяем, нужны ли скобки для правого операнда
                let rightNeedsParens = false;
                if (binaryNode.right.type === 'BinaryExpression') {
                    const rightOp = (binaryNode.right as BinaryExpression).operator;
                    const rightOpInfo = OPERATORS[rightOp as keyof typeof OPERATORS];
                    rightNeedsParens = rightOpInfo.precedence < currentPrecedence ||
                        (rightOpInfo.precedence === currentPrecedence &&
                            currentOp.associativity === 'left');
                }

                const formattedLeft = leftNeedsParens ? `(${leftStr})` : leftStr;
                const formattedRight = rightNeedsParens ? `(${rightStr})` : rightStr;

                return `${formattedLeft} ${binaryNode.operator} ${formattedRight}`;
            }

            case 'FunctionCall': {
                const funcNode = node as FunctionCall;
                const args = funcNode.arguments.map(arg => this.format(arg)).join(', ');
                return `${funcNode.name}(${args})`;
            }

            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }
}

// Класс MathExpressionParser для удобного использования всех компонентов
class MathExpressionParser {
    private parser: Parser;
    private ast: Node | null;
    private evaluator: Evaluator;
    private formatter: Formatter;

    constructor(expression: string = '', variables: Record<string, number> = {}) {
        this.parser = new Parser(expression);
        this.ast = null;
        this.evaluator = new Evaluator(variables);
        this.formatter = new Formatter();

        if (expression) {
            this.parse(expression);
        }
    }

    // Метод для разбора выражения
    public parse(expression: string): Node {
        this.parser = new Parser(expression);
        this.ast = this.parser.parse();
        return this.ast;
    }

    // Метод для вычисления значения выражения
    public evaluate(expression?: string): number {
        if (expression) {
            this.parse(expression);
        }

        if (!this.ast) {
            throw new Error('No expression to evaluate. Please parse an expression first.');
        }

        return this.evaluator.evaluate(this.ast);
    }

    // Метод для форматирования AST обратно в строку
    public format(): string {
        if (!this.ast) {
            throw new Error('No expression to format. Please parse an expression first.');
        }

        return this.formatter.format(this.ast);
    }

    // Метод для установки значения переменной
    public setVariable(name: string, value: number): void {
        this.evaluator.setVariable(name, value);
    }

    // Метод для получения AST
    public getAST(): Node | null {
        return this.ast;
    }

    // Статический метод для быстрого вычисления выражения
    public static evaluate(expression: string, variables: Record<string, number> = {}): number {
        const parser = new MathExpressionParser(expression, variables);
        return parser.evaluate();
    }
}

let expression: string = "x";

export function setExpression(exp: string) {
    expression = exp;
}

export function f(x: number): number {
    return MathExpressionParser.evaluate(expression, { "x": x });
}