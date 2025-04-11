import { Piece } from './Piece';
import { Color } from '../board/Square';
import { Board } from '../board/Board';
import { Rook } from './Rook';
import { Bishop } from './Bishop';

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