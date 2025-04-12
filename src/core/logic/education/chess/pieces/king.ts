import {Board} from "../board/board.ts";
import {Color} from "../board/square.ts";
import {Piece} from "./piece.ts";

export class King extends Piece {
    get type(): string {
        return 'King';
    }

    isValidMove(targetPosition: string, board: Board): boolean {
        const targetFile = targetPosition.charAt(0);
        const targetRank = parseInt(targetPosition.charAt(1));

        const currentFile = this.getFile();
        const currentRank = this.getRank();

        const fileDistance = Math.abs(targetFile.charCodeAt(0) - currentFile.charCodeAt(0));
        const rankDistance = Math.abs(targetRank - currentRank);

        // Normal king move - one square in any direction
        const isNormalMove = fileDistance <= 1 && rankDistance <= 1;

        if (isNormalMove) {
            // Check if target is empty or has an enemy piece
            const targetPiece = board.getPiece(targetPosition);
            if (targetPiece !== undefined && targetPiece.color === this.color) {
                return false;
            }

            // Check if the target square is under attack
            // This is a simplified check that doesn't handle all edge cases
            const opponentColor = this.color === Color.WHITE ? Color.BLACK : Color.WHITE;
            return !board.isSquareAttacked(targetPosition, opponentColor);
        }

        // Castling logic
        if (!this.hasMoved && rankDistance === 0 && fileDistance === 2) {
            // Kingside castling
            if (targetFile > currentFile) {
                const rookPosition = `h${currentRank}`;
                const rook = board.getPiece(rookPosition);

                if (rook && rook.type === 'Rook' && !rook.hasMoved) {
                    // Check if squares between king and rook are empty
                    const f1 = `f${currentRank}`;
                    const g1 = `g${currentRank}`;

                    if (!board.isSquareOccupied(f1) && !board.isSquareOccupied(g1)) {
                        // Check if king or squares it passes through are under attack
                        const opponentColor = this.color === Color.WHITE ? Color.BLACK : Color.WHITE;
                        if (!board.isSquareAttacked(this.position, opponentColor) &&
                            !board.isSquareAttacked(f1, opponentColor) &&
                            !board.isSquareAttacked(g1, opponentColor)) {
                            return true;
                        }
                    }
                }
            }
            // Queenside castling
            else {
                const rookPosition = `a${currentRank}`;
                const rook = board.getPiece(rookPosition);

                if (rook && rook.type === 'Rook' && !rook.hasMoved) {
                    // Check if squares between king and rook are empty
                    const b1 = `b${currentRank}`;
                    const c1 = `c${currentRank}`;
                    const d1 = `d${currentRank}`;

                    if (!board.isSquareOccupied(b1) && !board.isSquareOccupied(c1) && !board.isSquareOccupied(d1)) {
                        // Check if king or squares it passes through are under attack
                        const opponentColor = this.color === Color.WHITE ? Color.BLACK : Color.WHITE;
                        if (!board.isSquareAttacked(this.position, opponentColor) &&
                            !board.isSquareAttacked(c1, opponentColor) &&
                            !board.isSquareAttacked(d1, opponentColor)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}
