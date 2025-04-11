import { Piece } from './Piece';
import { Color } from '../board/Square';
import { Board } from '../board/Board';

export class Rook extends Piece {
    get type(): string {
        return 'Rook';
    }

    isValidMove(targetPosition: string, board: Board): boolean {
        const targetFile = targetPosition.charAt(0);
        const targetRank = parseInt(targetPosition.charAt(1));

        const currentFile = this.getFile();
        const currentRank = this.getRank();

        // Rook can only move horizontally or vertically
        if (targetFile !== currentFile && targetRank !== currentRank) {
            return false;
        }

        // Check for pieces in the path
        if (targetFile === currentFile) {
            // Vertical move
            const start = Math.min(targetRank, currentRank) + 1;
            const end = Math.max(targetRank, currentRank);

            for (let rank = start; rank < end; rank++) {
                if (board.isSquareOccupied(`${currentFile}${rank}`)) {
                    return false;
                }
            }
        } else {
            // Horizontal move
            const start = String.fromCharCode(Math.min(targetFile.charCodeAt(0), currentFile.charCodeAt(0)) + 1);
            const end = String.fromCharCode(Math.max(targetFile.charCodeAt(0), currentFile.charCodeAt(0)));

            for (let fileCode = start.charCodeAt(0); fileCode < end.charCodeAt(0); fileCode++) {
                const file = String.fromCharCode(fileCode);
                if (board.isSquareOccupied(`${file}${currentRank}`)) {
                    return false;
                }
            }
        }

        // Check if target is empty or has an enemy piece
        const targetPiece = board.getPiece(targetPosition);
        return targetPiece === undefined || targetPiece.color !== this.color;
    }
}
