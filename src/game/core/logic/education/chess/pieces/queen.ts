import {Piece} from "./piece.ts";
import {Board} from "../board/board.ts";
import {Rook} from "./rook.ts";
import {Bishop} from "./bishop.ts";

export class Queen extends Piece {
    get type(): string {
        return 'Queen';
    }

    isValidMove(targetPosition: string, board: Board): boolean {
        // Queen moves like both a rook and a bishop
        // For simplicity, we'll check if the move would be valid for either
        const rookMovement = new Rook(this.color, this.position);
        const bishopMovement = new Bishop(this.color, this.position);

        return rookMovement.isValidMove(targetPosition, board) ||
            bishopMovement.isValidMove(targetPosition, board);
    }
}