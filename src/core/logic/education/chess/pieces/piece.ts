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
}