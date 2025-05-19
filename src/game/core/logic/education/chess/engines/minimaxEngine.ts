import {Board} from "../board/board.ts";
import {Color} from "../board/square.ts";
import {ChessEngine, EngineOptions, MoveEvaluation} from "./chessEngine.ts";

export class MinimaxEngine extends ChessEngine {
    private nodeCount: number;
    private startTime: number;

    constructor(options: EngineOptions = {}) {
        super(options);
        this.nodeCount = 0;
        this.startTime = 0;
    }

    public async getBestMove(board: Board, color: Color): Promise<{ from: string, to: string }> {
        this.isThinking = true;
        this.nodeCount = 0;
        this.startTime = Date.now();

        try {
            const depth = this.options.depth || 3;
            const moves = this.getValidMoves(board, color);

            if (moves.length === 0) {
                throw new Error('No valid moves available');
            }

            // If there's only one move, return it immediately
            if (moves.length === 1) {
                return moves[0];
            }

            let bestMove = moves[0];
            let bestEval = color === Color.WHITE ? -Infinity : Infinity;

            for (const move of moves) {
                if (!this.isThinking) {
                    break; // Stop thinking if requested
                }

                // Apply the move to a clone of the board
                const tempBoard = board.clone();
                tempBoard.movePiece(move.from, move.to);

                // Evaluate the resulting position
                const evaluation = await this.minimax(
                    tempBoard,
                    depth - 1,
                    -Infinity,
                    Infinity,
                    color === Color.WHITE ? false : true
                );

                // Update best move if needed
                if ((color === Color.WHITE && evaluation > bestEval) ||
                    (color === Color.BLACK && evaluation < bestEval)) {
                    bestEval = evaluation;
                    bestMove = move;
                }
            }

            // Add some randomness for lower skill levels
            if (this.options.skillLevel && this.options.skillLevel < 20) {
                const randomFactor = 20 - this.options.skillLevel;
                if (Math.random() * 20 < randomFactor) {
                    const randomIndex = Math.floor(Math.random() * moves.length);
                    bestMove = moves[randomIndex];
                }
            }

            console.log(`Engine evaluated ${this.nodeCount} nodes in ${Date.now() - this.startTime}ms`);
            return bestMove;
        } finally {
            this.isThinking = false;
        }
    }

    public evaluatePosition(board: Board): number {
        // Basic evaluation function - can be improved with positional understanding
        let score = this.evaluateMaterial(board);

        // Add positional evaluation
        score += this.evaluatePositional(board);

        return score;
    }

    public async evaluateMoves(board: Board, color: Color, depth: number = 2): Promise<MoveEvaluation[]> {
        const moves = this.getValidMoves(board, color);
        const evaluations: MoveEvaluation[] = [];

        this.isThinking = true;
        this.nodeCount = 0;
        this.startTime = Date.now();

        try {
            for (const move of moves) {
                if (!this.isThinking) {
                    break;
                }

                // Apply the move to a clone of the board
                const tempBoard = board.clone();
                tempBoard.movePiece(move.from, move.to);

                // Evaluate the resulting position
                const evaluation = await this.minimax(
                    tempBoard,
                    depth - 1,
                    -Infinity,
                    Infinity,
                    color === Color.WHITE ? false : true
                );

                evaluations.push({
                    move,
                    evaluation,
                    depth
                });
            }

            // Sort evaluations (best first)
            if (color === Color.WHITE) {
                evaluations.sort((a, b) => b.evaluation - a.evaluation);
            } else {
                evaluations.sort((a, b) => a.evaluation - b.evaluation);
            }

            return evaluations;
        } finally {
            this.isThinking = false;
        }
    }

    private async minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): Promise<number> {
        this.nodeCount++;

        // Check if thinking should stop
        if (!this.isThinking) {
            return 0;
        }

        // Base case: reached leaf node or terminal position
        if (depth === 0 || board.isGameOver()) {
            return this.evaluatePosition(board);
        }

        // Get current player color
        const currentColor = isMaximizing ? Color.WHITE : Color.BLACK;
        const moves = this.getValidMoves(board, currentColor);

        // Check for checkmate or stalemate
        if (moves.length === 0) {
            if (board.isInCheck(currentColor)) {
                // Checkmate, return worst possible score for current player
                return isMaximizing ? -9999 : 9999;
            } else {
                // Stalemate
                return 0;
            }
        }

        // Add processing delay if configured
        if (this.options.thinkingDelay) {
            await new Promise(resolve => setTimeout(resolve, this.options.thinkingDelay));
        }

        if (isMaximizing) {
            let maxEval = -Infinity;

            for (const move of moves) {
                // Apply the move to a clone of the board
                const tempBoard = board.clone();
                tempBoard.movePiece(move.from, move.to);

                // Evaluate the resulting position recursively
                const evaluation = await this.minimax(tempBoard, depth - 1, alpha, beta, false);

                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);

                // Alpha-beta pruning
                if (beta <= alpha) {
                    break;
                }
            }

            return maxEval;
        } else {
            let minEval = Infinity;

            for (const move of moves) {
                // Apply the move to a clone of the board
                const tempBoard = board.clone();
                tempBoard.movePiece(move.from, move.to);

                // Evaluate the resulting position recursively
                const evaluation = await this.minimax(tempBoard, depth - 1, alpha, beta, true);

                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);

                // Alpha-beta pruning
                if (beta <= alpha) {
                    break;
                }
            }

            return minEval;
        }
    }

    private evaluateMaterial(board: Board): number {
        let score = 0;

        // Iterate through all squares on the board
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = board.getSquare(i, j);
                const piece = square.getPiece();

                if (!piece) continue;

                // Material values for pieces
                let pieceValue = 0;
                switch (piece.getType()) {
                    case 'pawn':
                        pieceValue = 100;
                        break;
                    case 'knight':
                        pieceValue = 320;
                        break;
                    case 'bishop':
                        pieceValue = 330;
                        break;
                    case 'rook':
                        pieceValue = 500;
                        break;
                    case 'queen':
                        pieceValue = 900;
                        break;
                    case 'king':
                        pieceValue = 20000;
                        break;
                }

                // Add to score for white, subtract for black
                if (piece.getColor() === Color.WHITE) {
                    score += pieceValue;
                } else {
                    score -= pieceValue;
                }
            }
        }

        return score;
    }

    private evaluatePositional(board: Board): number {
        let score = 0;

        // Piece-square tables
        const pawnTable = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5, 5, 10, 25, 25, 10, 5, 5],
            [0, 0, 0, 20, 20, 0, 0, 0],
            [5, -5, -10, 0, 0, -10, -5, 5],
            [5, 10, 10, -20, -20, 10, 10, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        const knightTable = [
            [-50, -40, -30, -30, -30, -30, -40, -50],
            [-40, -20, 0, 0, 0, 0, -20, -40],
            [-30, 0, 10, 15, 15, 10, 0, -30],
            [-30, 5, 15, 20, 20, 15, 5, -30],
            [-30, 0, 15, 20, 20, 15, 0, -30],
            [-30, 5, 10, 15, 15, 10, 5, -30],
            [-40, -20, 0, 5, 5, 0, -20, -40],
            [-50, -40, -30, -30, -30, -30, -40, -50]
        ];

        const bishopTable = [
            [-20, -10, -10, -10, -10, -10, -10, -20],
            [-10, 0, 0, 0, 0, 0, 0, -10],
            [-10, 0, 10, 10, 10, 10, 0, -10],
            [-10, 5, 5, 10, 10, 5, 5, -10],
            [-10, 0, 5, 10, 10, 5, 0, -10],
            [-10, 5, 5, 5, 5, 5, 5, -10],
            [-10, 0, 5, 0, 0, 5, 0, -10],
            [-20, -10, -10, -10, -10, -10, -10, -20]
        ];

        const rookTable = [
            [0, 0, 0, 5, 5, 0, 0, 0],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [5, 10, 10, 10, 10, 10, 10, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        const queenTable = [
            [-20, -10, -10, -5, -5, -10, -10, -20],
            [-10, 0, 0, 0, 0, 0, 0, -10],
            [-10, 0, 5, 5, 5, 5, 0, -10],
            [-5, 0, 5, 5, 5, 5, 0, -5],
            [0, 0, 5, 5, 5, 5, 0, -5],
            [-10, 5, 5, 5, 5, 5, 0, -10],
            [-10, 0, 5, 0, 0, 0, 0, -10],
            [-20, -10, -10, -5, -5, -10, -10, -20]
        ];

        const kingMiddleGameTable = [
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-20, -30, -30, -40, -40, -30, -30, -20],
            [-10, -20, -20, -20, -20, -20, -20, -10],
            [20, 20, 0, 0, 0, 0, 20, 20],
            [20, 30, 10, 0, 0, 10, 30, 20]
        ];

        const kingEndGameTable = [
            [-50, -40, -30, -20, -20, -30, -40, -50],
            [-30, -20, -10, 0, 0, -10, -20, -30],
            [-30, -10, 20, 30, 30, 20, -10, -30],
            [-30, -10, 30, 40, 40, 30, -10, -30],
            [-30, -10, 30, 40, 40, 30, -10, -30],
            [-30, -10, 20, 30, 30, 20, -10, -30],
            [-30, -30, 0, 0, 0, 0, -30, -30],
            [-50, -30, -30, -30, -30, -30, -30, -50]
        ];

        // Determine if we're in the endgame (simplified check)
        const isEndgame = this.isEndgame(board);

        // Apply piece-square values
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = board.getSquare(i, j);
                const piece = square.getPiece();

                if (!piece) continue;

                let positionValue = 0;

                // Use appropriate piece-square table based on piece type
                switch (piece.getType()) {
                    case 'pawn':
                        positionValue = pawnTable[i][j];
                        break;
                    case 'knight':
                        positionValue = knightTable[i][j];
                        break;
                    case 'bishop':
                        positionValue = bishopTable[i][j];
                        break;
                    case 'rook':
                        positionValue = rookTable[i][j];
                        break;
                    case 'queen':
                        positionValue = queenTable[i][j];
                        break;
                    case 'king':
                        positionValue = isEndgame ? kingEndGameTable[i][j] : kingMiddleGameTable[i][j];
                        break;
                }

                // Flip the table for black pieces
                if (piece.getColor() === Color.BLACK) {
                    positionValue = -positionValue;
                    // We also need to flip the board coordinates for black
                    positionValue = -pawnTable[7 - i][j];
                } else {
                    positionValue = pawnTable[i][j];
                }

                score += positionValue;
            }
        }

        // Bonus for mobility, development, king safety, etc. could be added here
        // For example:
        score += this.evaluateMobility(board);
        score += this.evaluateKingSafety(board);

        return score;
    }

    private isEndgame(board: Board): boolean {
        // Simple endgame detection: both sides have no queens or
        // one side has no queen and fewer than 2 minor pieces
        let whiteQueens = 0, blackQueens = 0;
        let whiteMinorPieces = 0, blackMinorPieces = 0;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = board.getSquare(i, j);
                const piece = square.getPiece();

                if (!piece) continue;

                if (piece.getType() === 'queen') {
                    if (piece.getColor() === Color.WHITE) {
                        whiteQueens++;
                    } else {
                        blackQueens++;
                    }
                } else if (piece.getType() === 'knight' || piece.getType() === 'bishop') {
                    if (piece.getColor() === Color.WHITE) {
                        whiteMinorPieces++;
                    } else {
                        blackMinorPieces++;
                    }
                }
            }
        }

        return (whiteQueens === 0 && blackQueens === 0) ||
            (whiteQueens === 0 && whiteMinorPieces < 2) ||
            (blackQueens === 0 && blackMinorPieces < 2);
    }

    private evaluateMobility(board: Board): number {
        // Simplified mobility evaluation
        let whiteMobility = 0;
        let blackMobility = 0;

        // Count legal moves for each side
        const whiteMoves = this.getValidMoves(board, Color.WHITE);
        const blackMoves = this.getValidMoves(board, Color.BLACK);

        whiteMobility = whiteMoves.length;
        blackMobility = blackMoves.length;

        // Return mobility difference with a small weight
        return (whiteMobility - blackMobility) * 0.1;
    }

    private evaluateKingSafety(board: Board): number {
        let score = 0;

        // Get king positions
        const whiteKingPos = this.findKingPosition(board, Color.WHITE);
        const blackKingPos = this.findKingPosition(board, Color.BLACK);

        if (!whiteKingPos || !blackKingPos) return 0;

        // Penalize exposed kings
        score += this.evaluateKingExposure(board, whiteKingPos, Color.WHITE);
        score -= this.evaluateKingExposure(board, blackKingPos, Color.BLACK);

        // Bonus for castling or having castled
        if (board.hasWhiteCastled()) {
            score += 50;
        }

        if (board.hasBlackCastled()) {
            score -= 50;
        }

        return score;
    }

    private findKingPosition(board: Board, color: Color): { row: number, col: number } | null {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = board.getSquare(i, j);
                const piece = square.getPiece();

                if (piece && piece.getType() === 'king' && piece.getColor() === color) {
                    return {row: i, col: j};
                }
            }
        }

        return null;
    }

    private evaluateKingExposure(board: Board, kingPos: { row: number, col: number }, color: Color): number {
        let exposure = 0;

        // Check how many squares around the king are attacked by enemy pieces
        const enemyColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

        // Check surrounding squares
        for (let i = Math.max(0, kingPos.row - 1); i <= Math.min(7, kingPos.row + 1); i++) {
            for (let j = Math.max(0, kingPos.col - 1); j <= Math.min(7, kingPos.col + 1); j++) {
                if (i === kingPos.row && j === kingPos.col) continue;

                if (board.isSquareAttacked(i, j, enemyColor)) {
                    exposure += 10;
                }
            }
        }

        // Penalize for lack of pawn shield in front of king (simplified)
        if (color === Color.WHITE && kingPos.row < 7) {
            for (let j = Math.max(0, kingPos.col - 1); j <= Math.min(7, kingPos.col + 1); j++) {
                const square = board.getSquare(kingPos.row - 1, j);
                const piece = square.getPiece();

                if (!piece || piece.getType() !== 'pawn' || piece.getColor() !== Color.WHITE) {
                    exposure += 5;
                }
            }
        } else if (color === Color.BLACK && kingPos.row > 0) {
            for (let j = Math.max(0, kingPos.col - 1); j <= Math.min(7, kingPos.col + 1); j++) {
                const square = board.getSquare(kingPos.row + 1, j);
                const piece = square.getPiece();

                if (!piece || piece.getType() !== 'pawn' || piece.getColor() !== Color.BLACK) {
                    exposure += 5;
                }
            }
        }

        return -exposure; // Negative because exposure is bad
    }
}