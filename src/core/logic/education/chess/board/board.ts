import { Square } from './Square';
import { Piece } from '../pieces/Piece';
import { Pawn } from '../pieces/Pawn';
import { Rook } from '../pieces/Rook';
import { Knight } from '../pieces/Knight';
import { Bishop } from '../pieces/Bishop';
import { Queen } from '../pieces/Queen';
import { King } from '../pieces/King';
import { Color } from './Square';

export class Board {
    squares: Square[][];
    pieces: Map<string, Piece>;

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

    reset(): void {
        this.pieces.clear();
        this.setupPieces();
    }
}