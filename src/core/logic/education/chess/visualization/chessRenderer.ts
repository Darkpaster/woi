import { Board } from '../board/Board';
import { Color, SquareColor } from '../board/Square';
import { AssetLoader } from './AssetLoader';

export interface RenderOptions {
    lightSquareColor: string;
    darkSquareColor: string;
    highlightColor: string;
    selectedSquareColor: string;
    lastMoveColor: string;
    coordinates: boolean;
    pieceTheme: string;
}

export class ChessRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private board: Board;
    private squareSize: number;
    private options: RenderOptions;
    private selectedSquare: string | null;
    private validMoves: string[];
    private lastMove: { from: string, to: string } | null;

    constructor(canvas: HTMLCanvasElement, board: Board) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.board = board;
        this.squareSize = Math.floor(canvas.width / 8);
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;

        this.options = {
            lightSquareColor: '#f0d9b5',
            darkSquareColor: '#b58863',
            highlightColor: 'rgba(155, 199, 0, 0.5)',
            selectedSquareColor: 'rgba(20, 85, 30, 0.5)',
            lastMoveColor: 'rgba(155, 199, 0, 0.3)',
            coordinates: true,
            pieceTheme: 'standard'
        };
    }

    setBoard(board: Board): void {
        this.board = board;
    }

    setOptions(options: Partial<RenderOptions>): void {
        this.options = { ...this.options, ...options };
    }

    setSelectedSquare(square: string | null): void {
        this.selectedSquare = square;
    }

    setValidMoves(moves: string[]): void {
        this.validMoves = moves;
    }

    setLastMove(from: string, to: string): void {
        this.lastMove = { from, to };
    }

    drawBoard(): void {
        const { lightSquareColor, darkSquareColor, coordinates } = this.options;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const x = file * this.squareSize;
                const y = rank * this.squareSize;

                // Determine square color
                const isLightSquare = (file + rank) % 2 !== 0;
                this.ctx.fillStyle = isLightSquare ? lightSquareColor : darkSquareColor;

                // Draw square
                this.ctx.fillRect(x, y, this.squareSize, this.squareSize);

                // Draw coordinates if enabled
                if (coordinates) {
                    if (rank === 7) {
                        // Draw file letters at the bottom
                        this.ctx.fillStyle = isLightSquare ? darkSquareColor : lightSquareColor;
                        this.ctx.font = `${Math.floor(this.squareSize / 5)}px Arial`;
                        this.ctx.textAlign = 'left';
                        this.ctx.textBaseline = 'bottom';
                        this.ctx.fillText(
                            String.fromCharCode(97 + file),
                            x + 3,
                            y + this.squareSize - 2
                        );
                    }

                    if (file === 0) {
                        // Draw rank numbers on the left
                        this.ctx.fillStyle = isLightSquare ? darkSquareColor : lightSquareColor;
                        this.ctx.font = `${Math.floor(this.squareSize / 5)}px Arial`;
                        this.ctx.textAlign = 'left';
                        this.ctx.textBaseline = 'top';
                        this.ctx.fillText(
                            String(8 - rank),
                            x + 3,
                            y + 3
                        );
                    }
                }
            }
        }

        // Highlight last move
        if (this.lastMove) {
            this.highlightSquare(this.lastMove.from, this.options.lastMoveColor);
            this.highlightSquare(this.lastMove.to, this.options.lastMoveColor);
        }

        // Highlight selected square
        if (this.selectedSquare) {
            this.highlightSquare(this.selectedSquare, this.options.selectedSquareColor);

            // Highlight valid moves
            for (const move of this.validMoves) {
                this.highlightSquare(move, this.options.highlightColor);
            }
        }
    }

    drawPieces(): void {
        const assetLoader = AssetLoader.getInstance();

        for (const [position, piece] of this.board.pieces) {
            const file = position.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
            const rank = 8 - parseInt(position.charAt(1)); // Convert '1' to 7, '2' to 6, etc.

            const x = file * this.squareSize;
            const y = rank * this.squareSize;

            const assetKey = piece.assetName;
            const pieceImg = assetLoader.getAsset(assetKey);

            if (pieceImg) {
                this.ctx.drawImage(
                    pieceImg,
                    x,
                    y,
                    this.squareSize,
                    this.squareSize
                );
            } else {
                // Fallback if image is not loaded
                this.drawFallbackPiece(piece, x, y);
            }
        }
    }

    private drawFallbackPiece(piece: any, x: number, y: number): void {
        const color = piece.color === Color.WHITE ? 'white' : 'black';
        const size = this.squareSize;

        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = piece.color === Color.WHITE ? 'black' : 'white';
        this.ctx.lineWidth = 1;

        // Draw a simple representation based on piece type
        switch (piece.type) {
            case 'Pawn':
                this.ctx.beginPath();
                this.ctx.arc(x + size / 2, y + size / 2, size / 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'Rook':
                this.ctx.fillRect(x + size / 4, y + size / 4, size / 2, size / 2);
                this.ctx.strokeRect(x + size / 4, y + size / 4, size / 2, size / 2);
                break;
            case 'Knight':
                this.ctx.beginPath();
                this.ctx.moveTo(x + size / 4, y + size / 4);
                this.ctx.lineTo(x + size / 4, y + size * 3 / 4);
                this.ctx.lineTo(x + size * 3 / 4, y + size * 3 / 4);
                this.ctx.lineTo(x + size * 3 / 4, y + size / 2);
                this.ctx.lineTo(x + size / 2, y + size / 4);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'Bishop':
                this.ctx.beginPath();
                this.ctx.moveTo(x + size / 2, y + size / 4);
                this.ctx.lineTo(x + size / 4, y + size * 3 / 4);
                this.ctx.lineTo(x + size * 3 / 4, y + size * 3 / 4);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'Queen':
                this.ctx.beginPath();
                this.ctx.arc(x + size / 2, y + size / 2, size / 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'King':
                this.ctx.beginPath();
                this.ctx.arc(x + size / 2, y + size / 2, size / 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();

                // Draw a cross
                this.ctx.beginPath();
                this.ctx.moveTo(x + size / 2, y + size / 4);
                this.ctx.lineTo(x + size / 2, y + size * 3 / 4);
                this.ctx.moveTo(x + size / 4, y + size / 2);
                this.ctx.lineTo(x + size * 3 / 4, y + size / 2);
                this.ctx.stroke();
                break;
        }
    }

    private highlightSquare(position: string, color: string): void {
        const file = position.charCodeAt(0) - 97;
        const rank = 8 - parseInt(position.charAt(1));

        const x = file * this.squareSize;
        const y = rank * this.squareSize;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
    }

    render(): void {
        this.drawBoard();
        this.drawPieces();
    }

    getSquareFromCoords(x: number, y: number): string | null {
        const file = Math.floor(x / this.squareSize);
        const rank = Math.floor(y / this.squareSize);

        if (file < 0 || file > 7 || rank < 0 || rank > 7) {
            return null;
        }

        const fileChar = String.fromCharCode(97 + file);
        const rankChar = String(8 - rank);

        return `${fileChar}${rankChar}`;
    }
}