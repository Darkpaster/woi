// import { ChessEngine, MoveEvaluation, EngineOptions } from './ChessEngine';
// import { Board } from '../board/Board';
// import { Color } from '../board/Square';
//
// export class MinimaxEngine extends ChessEngine {
//     private nodeCount: number;
//     private startTime: number;
//
//     constructor(options: EngineOptions = {}) {
//         super(options);
//         this.nodeCount = 0;
//         this.startTime = 0;
//     }
//
//     public async getBestMove(board: Board, color: Color): Promise<{ from: string, to: string }> {
//         this.isThinking = true;
//         this.nodeCount = 0;
//         this.startTime = Date.now();
//
//         try {
//             const depth = this.options.depth || 3;
//             const moves = this.getValidMoves(board, color);
//
//             if (moves.length === 0) {
//                 throw new Error('No valid moves available');
//             }
//
//             // If there's only one move, return it immediately
//             if (moves.length === 1) {
//                 return moves[0];
//             }
//
//             let bestMove = moves[0];
//             let bestEval = color === Color.WHITE ? -Infinity : Infinity;
//
//             for (const move of moves) {
//                 if (!this.isThinking) {
//                     break; // Stop thinking if requested
//                 }
//
//                 // Apply the move to a clone of the board
//                 const tempBoard = board.clone();
//                 tempBoard.movePiece(move.from, move.to);
//
//                 // Evaluate the resulting position
//                 const evaluation = await this.minimax(
//                     tempBoard,
//                     depth - 1,
//                     -Infinity,
//                     Infinity,
//                     color === Color.WHITE ? false : true
//                 );
//
//                 // Update best move if needed
//                 if ((color === Color.WHITE && evaluation > bestEval) ||
//                     (color === Color.BLACK && evaluation < bestEval)) {
//                     bestEval = evaluation;
//                     bestMove = move;
//                 }
//             }
//
//             // Add some randomness for lower skill levels
//             if (this.options.skillLevel && this.options.skillLevel < 20) {
//                 const randomFactor = 20 - this.options.skillLevel;
//                 if (Math.random() * 20 < randomFactor) {
//                     const randomIndex = Math.floor(Math.random() * moves.length);
//                     bestMove = moves[randomIndex];
//                 }
//             }
//
//             console.log(`Engine evaluated ${this.nodeCount} nodes in ${Date.now() - this.startTime}ms`);
//             return bestMove;
//         } finally {
//             this.isThinking = false;
//         }
//     }
//
//     public evaluatePosition(board: Board): number {
//         // Basic evaluation function - can be improved with positional understanding
//         let score = this.evaluateMaterial(board);
//
//         // Add positional evaluation
//         score += this.evaluatePositional(board);
//
//         return score;
//     }
//
//     public async evaluateMoves(board: Board, color: Color, depth: number = 2): Promise<MoveEvaluation[]> {
//         const moves = this.getValidMoves(board, color);
//         const evaluations: MoveEvaluation[] = [];
//
//         this.isThinking = true;
//         this.nodeCount = 0;
//         this.startTime = Date.now();
//
//         try {
//             for (const move of moves) {
//                 if (!this.isThinking) {
//                     break;
//                 }
//
//                 // Apply the move to a clone of the board
//                 const tempBoard = board.clone();
//                 tempBoard.movePiece(move.from, move.to);
//
//                 // Evaluate the resulting position
//                 const evaluation = await this.minimax(
//                     tempBoard,
//                     depth - 1,
//                     -Infinity,
//                     Infinity,
//                     color === Color.WHITE ? false : true
//                 );
//
//                 evaluations.push({
//                     move,
//                     evaluation,
//                     depth
//                 });
//             }
//
//             // Sort evaluations (best first)
//             if (color === Color.WHITE) {
//                 evaluations.sort((a, b) => b.evaluation - a.evaluation);
//             } else {
//                 evaluations.sort((a, b) => a.evaluation - b.evaluation);
//             }
//
//             return evaluations;
//         } finally {
//             this.isThinking = false;
//         }
//     }
//
//     private async minimax(board: Board, depth: number, alpha: number, beta