import {Board} from "../board/board.ts";
import {Color} from "../board/square.ts";
import {Piece} from "./piece.ts";

export class Knight extends Piece {
    get type(): string {
        return 'Knight';
    }

    isValidMove(targetPosition: string, board: Board): boolean {
        const targetFile = targetPosition.charAt(0);
        const targetRank = parseInt(targetPosition.charAt(1));

        const currentFile = this.getFile();
        const currentRank = this.getRank();

        const fileDistance = Math.abs(targetFile.charCodeAt(0) - currentFile.charCodeAt(0));
        const rankDistance = Math.abs(targetRank - currentRank);

        // Knight moves in an L shape: 2 squares in one direction and 1 in perpendicular
        const isLShape = (fileDistance === 1 && rankDistance === 2) || (fileDistance === 2 && rankDistance === 1);

        if (!isLShape) {
            return false;
        }

        // Check if target is empty or has an enemy piece
        const targetPiece = board.getPiece(targetPosition);
        return targetPiece === undefined || targetPiece.color !== this.color;
    }
}