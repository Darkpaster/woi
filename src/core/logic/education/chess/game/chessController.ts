import { Game, GameStatus } from './Game';
import { Board } from '../board/Board';
import { ChessRenderer } from '../visualization/ChessRenderer';
import { Color } from '../board/Square';
import { PGNNotation } from '../notation/PGNNotation';
import { EventEmitter } from '../utils/EventEmitter';

export class ChessController {
    private game: Game;
    private renderer: ChessRenderer;
    private selectedSquare: string | null;
    private validMoves: string[];
    private events: EventEmitter;

    constructor(game: Game, renderer: ChessRenderer) {
        this.game = game;
        this.renderer = renderer;
        this.selectedSquare = null;
        this.validMoves = [];
        this.events = new EventEmitter();

        this.setupCanvas();
    }

    private setupCanvas(): void {
        const canvas = this.renderer['canvas'];

        // Add click event listener
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.handleClick(x, y);
        });
    }

    private handleClick(x: number, y: number): void {
        const clickedSquare = this.renderer.getSquareFromCoords(x, y);
        if (!clickedSquare) return;

        // Check if a piece is already selected
        if (this.selectedSquare) {
            // Try to move the selected piece to the clicked square
            if (this.validMoves.includes(clickedSquare)) {
                const moveSuccess = this.game.makeMove(this.selectedSquare, clickedSquare);

                if (moveSuccess) {
                    // Update last move for highlighting
                    this.renderer.setLastMove(this.selectedSquare, clickedSquare);

                    // Clear selection
                    this.selectedSquare = null;
                    this.validMoves = [];
                    this.renderer.setSelectedSquare(null);
                    this.renderer.setValidMoves([]);

                    // Update the renderer with the new board state
                    this.renderer.setBoard(this.game.board);
                    this.renderer.render();

                    // Check game status and emit events
                    this.checkGameStatus();
                }
            } else {
                // If clicked on a different piece of same color, select that piece instead
                const piece = this.game.board.getPiece(clickedSquare);
                if (piece && piece.color === this.game.currentTurn) {
                    this.selectSquare(clickedSquare);
                } else {
                    // Clear selection
                    this.selectedSquare = null;
                    this.validMoves = [];
                    this.renderer.setSelectedSquare(null);
                    this.renderer.setValidMoves([]);
                    this.renderer.render();
                }
            }
        } else {
            // If no piece is selected, select the clicked square if it has a piece
            const piece = this.game.board.getPiece(clickedSquare);
            if (piece && piece.color === this.game.currentTurn) {
                this.selectSquare(clickedSquare);
            }
        }
    }

    private selectSquare(square: string): void {
        this.selectedSquare = square;
        this.validMoves = this.game.getValidMoves(square);

        // Update the renderer
        this.renderer.setSelectedSquare(square);
        this.renderer.setValidMoves(this.validMoves);
        this.renderer.render();
    }

    private checkGameStatus(): void {
        const status = this.game.getStatus();

        if (status === GameStatus.CHECK) {
            this.events.emit('check', this.game.currentTurn);
        } else if (status === GameStatus.CHECKMATE) {
            // Determine the winner (opposite of current turn since current turn is in checkmate)
            const winner = this.game.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE;
            this.events.emit('checkmate', winner);
            this.endGame('checkmate');
        } else if (status === GameStatus.STALEMATE) {
            this.events.emit('stalemate');
            this.endGame('stalemate');
        } else if (status === GameStatus.DRAW) {
            this.events.emit('draw');
            this.endGame('draw');
        }
    }

    private endGame(reason: string): void {
        // Disable further moves
        this.selectedSquare = null;
        this.validMoves = [];
        this.renderer.setSelectedSquare(null);
        this.renderer.setValidMoves([]);

        // Emit game over event with reason
        this.events.emit('gameOver', reason);
    }

    // Public methods for game control
    public startNewGame(): void {
        this.game.reset();
        this.selectedSquare = null;
        this.validMoves = [];
        this.renderer.setSelectedSquare(null);
        this.renderer.setValidMoves([]);
        this.renderer.setLastMove(null, null);
        this.renderer.setBoard(this.game.board);
        this.renderer.render();

        this.events.emit('newGame');
    }

    public undoLastMove(): boolean {
        const success = this.game.undoMove();
        if (success) {
            this.selectedSquare = null;
            this.validMoves = [];
            this.renderer.setSelectedSquare(null);
            this.renderer.setValidMoves([]);
            this.renderer.setLastMove(null, null);
            this.renderer.setBoard(this.game.board);
            this.renderer.render();

            this.events.emit('moveUndo');
            return true;
        }
        return false;
    }

    public loadPositionFromFEN(fen: string): boolean {
        const success = this.game.loadFromFEN(fen);
        if (success) {
            this.selectedSquare = null;
            this.validMoves = [];
            this.renderer.setSelectedSquare(null);
            this.renderer.setValidMoves([]);
            this.renderer.setLastMove(null, null);
            this.renderer.setBoard(this.game.board);
            this.renderer.render();

            this.events.emit('positionLoaded', fen);
            return true;
        }
        return false;
    }

    public getCurrentFEN(): string {
        return this.game.getFEN();
    }

    public getPGN(): string {
        return this.game.getPGN();
    }

    // Event handling methods
    public on(event: string, callback: Function): void {
        this.events.on(event, callback);
    }

    public off(event: string, callback: Function): void {
        this.events.off(event, callback);
    }

    // AI move method
    public makeAIMove(engineFunction: (board: Board, color: Color) => {from: string, to: string}): boolean {
        if (this.game.getStatus() !== GameStatus.ACTIVE) {
            return false;
        }

        const move = engineFunction(this.game.board, this.game.currentTurn);
        if (!move) return false;

        const moveSuccess = this.game.makeMove(move.from, move.to);
        if (moveSuccess) {
            // Update last move for highlighting
            this.renderer.setLastMove(move.from, move.to);

            // Update the renderer with the new board state
            this.renderer.setBoard(this.game.board);
            this.renderer.render();

            // Check game status
            this.checkGameStatus();
            return true;
        }

        return false;
    }

    // Enable/disable board interaction
    public enableInteraction(): void {
        // Implementation depends on how you handle disabled state
        // Could be a flag to check in handleClick
        this.setupCanvas();
    }

    public disableInteraction(): void {
        // Remove event listeners or set a flag
        const canvas = this.renderer['canvas'];
        const newCanvas = canvas.cloneNode(true);
        canvas.parentNode?.replaceChild(newCanvas, canvas);

        // Update the renderer's canvas reference
        this.renderer['canvas'] = newCanvas;
    }

    // Helper method to promote a pawn
    public promotePawn(square: string, pieceType: string): boolean {
        const success = this.game.promotePawn(square, pieceType);
        if (success) {
            this.renderer.setBoard(this.game.board);
            this.renderer.render();
            return true;
        }
        return false;
    }

    // Method to get current game state
    public getGameState(): {
        board: Board,
        currentTurn: Color,
        status: GameStatus,
        moveHistory: string[]
    } {
        return {
            board: this.game.board,
            currentTurn: this.game.currentTurn,
            status: this.game.getStatus(),
            moveHistory: this.game.getMoveHistory()
        };
    }
}