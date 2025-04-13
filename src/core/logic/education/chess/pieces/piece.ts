import {Board} from "../board/board.ts";
import {Color} from "../board/square.ts";

export abstract class Piece {
    readonly color: Color;
    position: string;
    hasMoved: boolean;

    constructor(color: Color, position: string) {
        this.color = color;
        this.position = position;
        this.hasMoved = false;
    }

    abstract get type(): string;

    abstract isValidMove(targetPosition: string, board: Board): boolean;

    canAttack(targetPosition: string, board: Board): boolean {
        return this.isValidMove(targetPosition, board);
    }

    getFile(): string {
        return this.position.charAt(0);
    }

    getRank(): number {
        return parseInt(this.position.charAt(1));
    }

    isSamePosition(position: string): boolean {
        return this.position === position;
    }

    isSameColor(piece: Piece): boolean {
        return this.color === piece.color;
    }

    // Get FEN symbol for the piece
    get fenSymbol(): string {
        const symbol = this.type.charAt(0).toLowerCase();
        return this.color === Color.WHITE ? symbol.toUpperCase() : symbol;
    }

    // For rendering
    get assetName(): string {
        return `${this.color}_${this.type.toLowerCase()}`;
    }

    /**
     * Gets the notation symbol for the piece
     * @returns The symbol representing the piece in notation (e.g., 'K' for king)
     */
    public getNotationSymbol(): string {
        // This should be overridden by specific piece classes
        switch (this.type) {
            case "king":
                return 'K';
            case "queen":
                return 'Q';
            case "rook":
                return 'R';
            case "bishop":
                return 'B';
            case "knight":
                return 'N';
            case "pawn":
                return 'P';
            default:
                return '?';
        }
    }

    /**
     * Gets all possible moves for the piece from the given square
     * @param square The current square of the piece in algebraic notation (e.g., 'e4')
     * @param board The current board state
     * @returns Array of valid target squares in algebraic notation
     */
    public getPossibleMoves(square: string, board: Board): string[] {
        // This is a base implementation that will be overridden by specific piece classes
        const moves: string[] = [];

        // Parse the square
        const file = square.charCodeAt(0) - 97; // 'a' is 97 in ASCII
        const rank = parseInt(square[1]) - 1;   // Convert to 0-based index

        // Get movement patterns based on piece type
        const patterns = this.getMovementPatterns();

        for (const pattern of patterns) {
            let targetFile = file + pattern[0];
            let targetRank = rank + pattern[1];

            // Continue in the direction for sliding pieces (Queen, Rook, Bishop)
            let continueSliding = this.isSliding();

            while (targetFile >= 0 && targetFile < 8 && targetRank >= 0 && targetRank < 8) {
                const targetSquare = String.fromCharCode(97 + targetFile) + (targetRank + 1);
                const targetPiece = board.getPiece(targetSquare);

                if (targetPiece === null) {
                    // Empty square, we can move here
                    moves.push(targetSquare);
                } else if (targetPiece.color !== this.color) {
                    // Enemy piece, we can capture it
                    moves.push(targetSquare);
                    continueSliding = false; // Can't slide past a piece
                } else {
                    // Our piece, can't move here
                    continueSliding = false; // Can't slide past a piece
                }

                if (!continueSliding) break;

                // Move further in the same direction
                targetFile += pattern[0];
                targetRank += pattern[1];
            }
        }

        // Special moves for specific pieces (implemented in subclasses)
        this.addSpecialMoves(moves, square, board);

        return moves;
    }


    // Helper methods for Piece class that would be implemented in specific piece classes
    protected getMovementPatterns(): number[][] {
        // Should be overridden by specific piece classes
        return [];
    }

    protected isSliding(): boolean {
        // For pieces that can slide (Queen, Rook, Bishop)
        return ["queen", "rook", "bishop"].includes(this.type);
    }

    protected addSpecialMoves(moves: string[], square: string, board: Board): void {
        // Should be overridden by specific piece classes that have special moves
        // For example, castling for king, en passant for pawns, etc.
    }

// Enhanced toFEN() implementation including all FEN components


}