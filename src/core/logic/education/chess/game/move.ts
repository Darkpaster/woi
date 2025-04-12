import {Piece} from "../pieces/piece.ts";

export class Move {
    public from: string;
    public to: string;
    public piece: Piece;
    public capturedPiece: Piece | null;
    public promotion: Piece | null;
    public castling: { rookFrom: string, rookTo: string } | null;
    public enPassant: string | null;
    public check: boolean;
    public checkmate: boolean;
    public timestamp: number;

    constructor(from: string, to: string, piece: Piece, capturedPiece: Piece | null = null) {
        this.from = from;
        this.to = to;
        this.piece = piece;
        this.capturedPiece = capturedPiece;
        this.promotion = null;
        this.castling = null;
        this.enPassant = null;
        this.check = false;
        this.checkmate = false;
        this.timestamp = Date.now();
    }

    public isCapture(): boolean {
        return this.capturedPiece !== null || this.enPassant !== null;
    }

    public isPromotion(): boolean {
        return this.promotion !== null;
    }

    public isCastling(): boolean {
        return this.castling !== null;
    }

    public isEnPassant(): boolean {
        return this.enPassant !== null;
    }

    public isCheck(): boolean {
        return this.check;
    }

    public isCheckmate(): boolean {
        return this.checkmate;
    }

    public toSAN(): string {
        // This would return a string in Standard Algebraic Notation
        // Implementation depends on your notation system
        // For now, return a basic representation
        let notation = '';

        // Add piece symbol (except for pawns)
        if (this.piece.type !== 'pawn') {
            notation += this.piece.getNotationSymbol().toUpperCase();
        }

        // Add from square for disambiguation if needed
        // This should be implemented based on your full game state

        // Add capture symbol
        if (this.isCapture()) {
            if (this.piece.type === 'pawn') {
                notation += this.from.charAt(0);
            }
            notation += 'x';
        }

        // Add destination square
        notation += this.to;

        // Add promotion piece
        if (this.isPromotion() && this.promotion) {
            notation += '=' + this.promotion.getNotationSymbol().toUpperCase();
        }

        // Add check/checkmate
        if (this.isCheckmate()) {
            notation += '#';
        } else if (this.isCheck()) {
            notation += '+';
        }

        // Special case for castling
        if (this.isCastling()) {
            if (this.to.charAt(0) === 'g') {
                notation = 'O-O'; // Kingside
            } else {
                notation = 'O-O-O'; // Queenside
            }

            // Add check/checkmate for castling too
            if (this.isCheckmate()) {
                notation += '#';
            } else if (this.isCheck()) {
                notation += '+';
            }
        }

        return notation;
    }

    public toLongAN(): string {
        // Long Algebraic Notation (e.g., e2-e4)
        let notation = this.from + (this.isCapture() ? 'x' : '-') + this.to;

        // Add promotion piece
        if (this.isPromotion() && this.promotion) {
            notation += '=' + this.promotion.getNotationSymbol().toUpperCase();
        }

        return notation;
    }

    public toUCI(): string {
        // Universal Chess Interface notation (e.g., e2e4)
        let notation = this.from + this.to;

        // Add promotion piece in lowercase
        if (this.isPromotion() && this.promotion) {
            notation += this.promotion.getNotationSymbol().toLowerCase();
        }

        return notation;
    }

    public clone(): Move {
        const clonedMove = new Move(this.from, this.to, this.piece, this.capturedPiece);
        clonedMove.promotion = this.promotion;
        clonedMove.castling = this.castling;
        clonedMove.enPassant = this.enPassant;
        clonedMove.check = this.check;
        clonedMove.checkmate = this.checkmate;
        clonedMove.timestamp = this.timestamp;
        return clonedMove;
    }
}