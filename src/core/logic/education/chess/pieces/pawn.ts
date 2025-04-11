import { Piece } from './Piece';
import { Color } from '../board/Square';
import { Board } from '../board/Board';

export class Pawn extends Piece {
    get type(): string {
        return 'Pawn';
    }

    isValidMove(targetPosition: string, board: Board): boolean {
        const targetFile = targetPosition.charAt(0);
        const targetRank = parseInt(targetPosition.charAt(1));

        const currentFile = this.getFile();
        const currentRank = this.getRank();

        const fileDistance = Math.abs(targetFile.charCodeAt(0) - currentFile.charCodeAt(0));
        const rankDistance = this.color === Color.WHITE ?
            targetRank - currentRank :
            currentRank - targetRank;

        // Regular move (forward one square)
        if (fileDistance === 0 && rankDistance === 1) {
            return !board.isSquareOccupied(targetPosition);
        }

        // First move (option to move forward two squares)
        if (!this.hasMoved && fileDistance === 0 && rankDistance === 2) {
            const intermediateRank = this.color === Color.WHITE ? currentRank + 1 : currentRank - 1;
            const intermediatePos = `${currentFile}${intermediateRank}`;

            return !board.isSquareOccupied(intermediatePos) && !board.isSquareOccupied(targetPosition);
        }

        // Capture (diagonally)
        if (fileDistance === 1 && rankDistance === 1) {
            // Check if there's an opponent's piece on the target square
            const targetPiece = board.getPiece(targetPosition);
            return targetPiece !== undefined && targetPiece.color !== this.color;

            // En passant is not implemented here for simplicity
        }

        return false;
    }

    canAttack(targetPosition: string, board: Board): boolean {
        const targetFile = targetPosition.charAt(0);
        const targetRank = parseInt(targetPosition.charAt(1));

        const currentFile = this.getFile();
        const currentRank = this.getRank();

        const fileDistance = Math.abs(targetFile.charCodeAt(0) - currentFile.charCodeAt(0));
        const rankDistance = this.color === Color.WHITE ?
            targetRank - currentRank :
            currentRank - targetRank;

        // Pawns attack diagonally
        return fileDistance === 1 && rankDistance === 1;
    }
}
