import {Color, Square} from "./square.ts";
import {Piece} from "../pieces/piece.ts";
import {Pawn} from "../pieces/pawn.ts";
import {Rook} from "../pieces/rook.ts";
import {Knight} from "../pieces/knight.ts";
import {Bishop} from "../pieces/bishop.ts";
import {Queen} from "../pieces/queen.ts";
import {King} from "../pieces/king.ts";

export class Board {
    squares: Square[][];
    pieces: Map<string, Piece>;
    private enPassantTarget: string | null | undefined;

    constructor() {
        this.squares = this.createSquares();
        this.pieces = new Map<string, Piece>();
        this.setupPieces();
    }

    createSquares(): Square[][] {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

        return ranks.map(rank =>
            files.map(file => new Square(file, rank))
        );
    }

    setupPieces(): void {
        // Set up pawns
        for (let file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
            this.addPiece(new Pawn(Color.WHITE, `${file}2`));
            this.addPiece(new Pawn(Color.BLACK, `${file}7`));
        }

        // Set up rooks
        this.addPiece(new Rook(Color.WHITE, 'a1'));
        this.addPiece(new Rook(Color.WHITE, 'h1'));
        this.addPiece(new Rook(Color.BLACK, 'a8'));
        this.addPiece(new Rook(Color.BLACK, 'h8'));

        // Set up knights
        this.addPiece(new Knight(Color.WHITE, 'b1'));
        this.addPiece(new Knight(Color.WHITE, 'g1'));
        this.addPiece(new Knight(Color.BLACK, 'b8'));
        this.addPiece(new Knight(Color.BLACK, 'g8'));

        // Set up bishops
        this.addPiece(new Bishop(Color.WHITE, 'c1'));
        this.addPiece(new Bishop(Color.WHITE, 'f1'));
        this.addPiece(new Bishop(Color.BLACK, 'c8'));
        this.addPiece(new Bishop(Color.BLACK, 'f8'));

        // Set up queens
        this.addPiece(new Queen(Color.WHITE, 'd1'));
        this.addPiece(new Queen(Color.BLACK, 'd8'));

        // Set up kings
        this.addPiece(new King(Color.WHITE, 'e1'));
        this.addPiece(new King(Color.BLACK, 'e8'));
    }

    addPiece(piece: Piece): void {
        this.pieces.set(piece.position, piece);
    }

    getPiece(position: string): Piece | undefined {
        return this.pieces.get(position);
    }

    removePiece(position: string): Piece | undefined {
        const piece = this.pieces.get(position);
        if (piece) {
            this.pieces.delete(position);
        }
        return piece;
    }

    movePiece(from: string, to: string): boolean {
        const piece = this.getPiece(from);
        if (!piece) return false;

        // Check if the move is valid
        if (!piece.isValidMove(to, this)) return false;

        // Remove captured piece if any
        this.removePiece(to);

        // Update piece position
        this.pieces.delete(from);
        piece.position = to;
        this.pieces.set(to, piece);

        // Mark piece as moved
        piece.hasMoved = true;

        return true;
    }

    getSquareByNotation(notation: string): Square | undefined {
        const file = notation.charAt(0);
        const rank = parseInt(notation.charAt(1));

        const fileIndex = 'abcdefgh'.indexOf(file);
        const rankIndex = 8 - rank;

        if (fileIndex === -1 || rankIndex < 0 || rankIndex > 7) {
            return undefined;
        }

        return this.squares[rankIndex][fileIndex];
    }

    /**
     * Sets the target square for en passant capture
     * @param target The algebraic notation of the target square (e.g., 'e3') or null if no en passant is possible
     */
    public setEnPassantTarget(target: string | null): void {
        this.enPassantTarget = target;
    }

    /**
     * Converts the current board position to Forsyth-Edwards Notation (FEN)
     * @returns The FEN string representing the current board state
     */
    public toFEN(): string {
        let fen = '';

        // 1. Piece placement (from 8th rank to 1st rank)
        for (let rank = 7; rank >= 0; rank--) {
            let emptySquares = 0;

            for (let file = 0; file < 8; file++) {
                const square = String.fromCharCode(97 + file) + (rank + 1);
                const piece = this.getPiece(square);

                if (piece) {
                    if (emptySquares > 0) {
                        fen += emptySquares;
                        emptySquares = 0;
                    }

                    let symbol = piece.getNotationSymbol();
                    fen += piece.color === Color.WHITE ? symbol.toUpperCase() : symbol.toLowerCase();
                } else {
                    emptySquares++;
                }
            }

            if (emptySquares > 0) {
                fen += emptySquares;
            }

            if (rank > 0) {
                fen += '/';
            }
        }

        // 2. Active color
        // fen += ' ' + (this. === Color.WHITE ? 'w' : 'b');

        // 3. Castling availability
        let castling = '';
        // if (this.castlingRights.whiteKingside) castling += 'K';
        // if (this.castlingRights.whiteQueenside) castling += 'Q';
        // if (this.castlingRights.blackKingside) castling += 'k';
        // if (this.castlingRights.blackQueenside) castling += 'q';
        fen += ' ' + (castling || '-');

        // 4. En passant target square
        fen += ' ' + (this.enPassantTarget || '-');

        // 5. Halfmove clock (for 50-move rule)
        // fen += ' ' + this.halfmoveClock;

        // 6. Fullmove number
        // fen += ' ' + this.fullMoveNumber;

        return fen;
    }

    isSquareOccupied(position: string): boolean {
        return this.pieces.has(position);
    }

    isSquareAttacked(position: string, by: Color): boolean {
        for (const [_, piece] of this.pieces) {
            if (piece.color === by && piece.canAttack(position, this)) {
                return true;
            }
        }
        return false;
    }

    clone(): Board {
        return JSON.parse(JSON.stringify(this));
    }

    reset(): void {
        this.pieces.clear();
        this.setupPieces();
    }
}