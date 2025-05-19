import {Board} from "../board/board.ts";
import {Color} from "../board/square.ts";

export interface MoveEvaluation {
    move: { from: string, to: string };
    evaluation: number; // Positive values favor white, negative favor black
    depth?: number;
    bestLine?: string[];
}

export interface EngineOptions {
    depth?: number;
    timeLimit?: number;
    useOpening?: boolean;
    useEndgame?: boolean;
    skillLevel?: number; // 0-20 scale, 20 being strongest
}

export abstract class ChessEngine {
    protected options: EngineOptions;
    protected isThinking: boolean;

    constructor(options: EngineOptions = {}) {
        this.options = {
            depth: 3,
            timeLimit: 1000,
            useOpening: true,
            useEndgame: true,
            skillLevel: 10,
            ...options
        };
        this.isThinking = false;
    }

    public setOptions(options: Partial<EngineOptions>): void {
        this.options = { ...this.options, ...options };
    }

    public abstract getBestMove(board: Board, color: Color): Promise<{ from: string, to: string }>;

    public abstract evaluatePosition(board: Board): number;

    public abstract evaluateMoves(board: Board, color: Color, depth?: number): Promise<MoveEvaluation[]>;

    public stopThinking(): void {
        this.isThinking = false;
    }

    protected getValidMoves(board: Board, color: Color): { from: string, to: string }[] {
        const moves: { from: string, to: string }[] = [];

        // Iterate through all squares
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const square = String.fromCharCode(file) + rank;
                const piece = board.getPiece(square);

                // If square has a piece of the current color
                if (piece && piece.color === color) {
                    // Get all valid destination squares for this piece
                    const destinations = piece.getPossibleMoves(square, board);

                    // Add each valid move to the list
                    for (const destination of destinations) {
                        moves.push({ from: square, to: destination });
                    }
                }
            }
        }

        return moves;
    }

    // A simple material-based evaluation function
    protected evaluateMaterial(board: Board): number {
        let value = 0;

        // Piece values (standard values)
        const pieceValues: Record<string, number> = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };

        // Count material for both sides
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const square = String.fromCharCode(file) + rank;
                const piece = board.getPiece(square);

                if (piece) {
                    const pieceValue = pieceValues[piece.getType()] || 0;

                    // Add value for white, subtract for black
                    if (piece.color === Color.WHITE) {
                        value += pieceValue;
                    } else {
                        value -= pieceValue;
                    }
                }
            }
        }

        return value;
    }

    // Check if the game is in an endgame state (simplified)
    protected isEndgame(board: Board): boolean {
        let queens = 0;
        let minorPieces = 0;

        // Count major pieces
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const square = String.fromCharCode(file) + rank;
                const piece = board.getPiece(square);

                if (piece) {
                    if (piece.getType() === 'queen') {
                        queens++;
                    } else if (piece.getType() === 'rook' ||
                        piece.getType() === 'bishop' ||
                        piece.getType() === 'knight') {
                        minorPieces++;
                    }
                }
            }
        }

        // Endgame if no queens or few pieces left
        return queens === 0 || (queens <= 1 && minorPieces <= 2);
    }
}