import { Piece } from './Piece';
import { Color } from '../board/Square';
import { Board } from '../board/Board';

export class Bishop extends Piece {
    get type(): string {
        return 'Bishop';
    }

    isValidMove(targetPosition: string, board: Board): boolean {
        const targetFile = targetPosition.charAt(0);
        const targetRank = parseInt(targetPosition.charAt(1));

        const currentFile = this.getFile();
        const currentRank = this.getRank();

        const fileDistance = Math.abs(targetFile.charCodeAt(0) - currentFile.charCodeAt(0));
        const rankDistance = Math.abs(targetRank - currentRank);

        // Bishop can only move diagonally
        if (fileDistance !== rankDistance) {
            return false;
        }

        // Check for pieces in the path
        const fileDirection = targetFile > currentFile ? 1 : -1;
        const rankDirection = targetRank > currentRank ? 1 : -1;

        let file = currentFile.charCodeAt(0) + fileDirection;
        let rank = currentRank + rankDirection;

        while (file !== targetFile.charCodeAt(0) && rank !== targetRank) {
            const position = `${String.fromCharCode(file)}${rank}`;
            if (board.isSquareOccupied(position)) {
                return false;
            }
            file += fileDirection;
            rank += rankDirection;
        }

        // Check if target is empty or has an enemy piece
        const targetPiece = board.getPiece(targetPosition);
        return targetPiece === undefined || targetPiece.color !== this.color;
    }
}