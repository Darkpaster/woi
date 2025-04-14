import {SimulationEntity} from "../../../../../utils/simulation/simulationEntity.ts";
import {Lexer} from "../compilers/lexer.ts";
import {Parser} from "../compilers/parser.ts";
import {Optimizer} from "../compilers/optimizer.ts";
import {CodeGenerator} from "../compilers/codeGenerator.ts";

export class Compiler extends SimulationEntity {
    protected sourceCode: string;
    protected targetCode: string;
    protected lexer: Lexer;
    protected parser: Parser;
    protected optimizer: Optimizer;
    protected codeGenerator: CodeGenerator;
    protected compilationPhase: CompilationPhase;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.sourceCode = "";
        this.targetCode = "";
        this.lexer = new Lexer();
        this.parser = new Parser();
        this.optimizer = new Optimizer();
        this.codeGenerator = new CodeGenerator();
        this.compilationPhase = CompilationPhase.None;
    }

    public setSourceCode(code: string): void {
        this.sourceCode = code;
    }

    public getTargetCode(): string {
        return this.targetCode;
    }

    public compile(): boolean {
        try {
            this.compilationPhase = CompilationPhase.Lexical;
            const tokens = this.lexer.tokenize(this.sourceCode);

            this.compilationPhase = CompilationPhase.Syntax;
            const ast = this.parser.parse(tokens);

            this.compilationPhase = CompilationPhase.Semantic;
            const checkedAst = this.parser.semanticCheck(ast);

            this.compilationPhase = CompilationPhase.Optimization;
            const optimizedAst = this.optimizer.optimize(checkedAst);

            this.compilationPhase = CompilationPhase.CodeGeneration;
            this.targetCode = this.codeGenerator.generate(optimizedAst);

            this.compilationPhase = CompilationPhase.Finished;
            return true;
        } catch (error) {
            console.error("Compilation error:", error);
            return false;
        }
    }

    public getCurrentPhase(): CompilationPhase {
        return this.compilationPhase;
    }

    public simulate(timeStep: number): void {
        // Simulation of the compilation process
    }

    public render(): void {
        // Visualization of the compilation process
        console.log("Compiler phase:", this.compilationPhase);
    }
}

export enum CompilationPhase {
    None,
    Lexical,
    Syntax,
    Semantic,
    Optimization,
    CodeGeneration,
    Finished
}