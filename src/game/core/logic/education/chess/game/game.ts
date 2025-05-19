import {PGNNotation} from "../notation/pgnNotation.ts";
import {FENNotation} from "../notation/fenNotation.ts";
import {Move} from "./move.ts";
import {Piece} from "../pieces/piece.ts";
import {Board} from "../board/board.ts";
import {Color} from "../board/square.ts";


export enum GameStatus {
    ACTIVE,
    CHECK,
    CHECKMATE,
    STALEMATE,
    DRAW
}

export class Game {
    public board: Board;
    public currentTurn: Color;
    private moveHistory: Move[];
    private pgnNotation: PGNNotation;
    private fenNotation: FENNotation;
    private halfMoveClock: number; // For 50-move rule
    private fullMoveNumber: number;
    private positionHistory: Map<string, number>; // For threefold repetition

    constructor() {
        this.board = new Board();
        this.currentTurn = Color.WHITE;
        this.moveHistory = [];
        this.pgnNotation = new PGNNotation();
        this.fenNotation = new FENNotation();
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.positionHistory = new Map<string, number>();

        // Record initial position
        this.recordPosition();
    }

    public reset(): void {
        this.board.setupPieces();
        this.currentTurn = Color.WHITE;
        this.moveHistory = [];
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.positionHistory.clear();
        this.recordPosition();
    }

    public makeMove(from: string, to: string): boolean {
        // Validate square format
        if (!this.isValidSquare(from) || !this.isValidSquare(to)) {
            return false;
        }

        // Check if there's a piece at the starting square
        const piece = this.board.getPiece(from);
        if (!piece || piece.color !== this.currentTurn) {
            return false;
        }

        // Check if the move is valid
        const validMoves = this.getValidMoves(from);
        if (!validMoves.includes(to)) {
            return false;
        }

        // Check if this is a capture move
        const capturedPiece = this.board.getPiece(to);
        const isCapture = capturedPiece !== null;

        // Check if pawn move for half-move clock
        const isPawnMove = piece.type === 'pawn';

        // Execute the move
        const move = new Move(from, to, piece, capturedPiece);

        // Special move handling
        this.handleSpecialMoves(move);

        // Update board
        this.board.movePiece(from, to);

        // Record the move
        this.moveHistory.push(move);

        // Update half-move clock (reset on pawn move or capture)
        if (isPawnMove || isCapture) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        // Update full move number (increments after Black's move)
        if (this.currentTurn === Color.BLACK) {
            this.fullMoveNumber++;
        }

        // Switch turns
        this.currentTurn = this.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE;

        // Record position for repetition detection
        this.recordPosition();

        return true;
    }

    public getValidMoves(square: string): string[] {
        if (!this.isValidSquare(square)) {
            return [];
        }

        const piece = this.board.getPiece(square);
        if (!piece || piece.color !== this.currentTurn) {
            return [];
        }

        // Get all possible moves for the piece
        const possibleMoves = piece.getPossibleMoves(square, this.board);

        // Filter moves that would leave or put the king in check
        return possibleMoves.filter(targetSquare => {
            // Create a temporary board to simulate the move
            const tempBoard = this.board.clone();
            tempBoard.movePiece(square, targetSquare);

            // Check if the king is in check after the move
            const kingSquare = this.findKing(piece.color, tempBoard);
            return kingSquare && !this.isSquareUnderAttack(kingSquare, piece.color, tempBoard);
        });
    }

    public getStatus(): GameStatus {
        const kingSquare = this.findKing(this.currentTurn);
        if (!kingSquare) {
            return GameStatus.ACTIVE; // Should not happen in a valid game
        }

        // Check if the king is in check
        const isInCheck = this.isSquareUnderAttack(kingSquare, this.currentTurn);

        // Check if there are any valid moves for any piece
        const hasValidMoves = this.hasAnyValidMoves();

        if (isInCheck && !hasValidMoves) {
            return GameStatus.CHECKMATE;
        } else if (!isInCheck && !hasValidMoves) {
            return GameStatus.STALEMATE;
        } else if (isInCheck) {
            return GameStatus.CHECK;
        } else if (this.isDraw()) {
            return GameStatus.DRAW;
        }

        return GameStatus.ACTIVE;
    }

    public undoMove(): boolean {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastMove = this.moveHistory.pop()!;

        // Switch turns back
        this.currentTurn = this.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE;

        // Update full move number
        if (this.currentTurn === Color.BLACK) {
            this.fullMoveNumber--;
        }

        // Restore board state
        this.board.movePiece(lastMove.to, lastMove.from);

        // Restore captured piece if any
        if (lastMove.capturedPiece) {
            this.board.addPiece(lastMove.capturedPiece);
        }

        // Handle special move undos (castling, en passant)
        this.undoSpecialMoves(lastMove);

        // Update position history
        this.positionHistory.clear();
        for (let i = 0; i < this.moveHistory.length; i++) {
            const fen = this.board.toFEN();
            this.positionHistory.set(fen, (this.positionHistory.get(fen) || 0) + 1);
        }

        return true;
    }

    public loadFromFEN(fen: string): boolean {
        try {
            const result = this.fenNotation.parseFEN(fen);
            this.board = result.board;
            this.currentTurn = result.activeColor;
            this.halfMoveClock = result.halfMoveClock;
            this.fullMoveNumber = result.fullMoveNumber;
            this.moveHistory = [];
            this.positionHistory.clear();
            this.recordPosition();
            return true;
        } catch (error) {
            console.error("Invalid FEN string:", error);
            return false;
        }
    }

    public getFEN(): string {
        return this.fenNotation.generateFEN(
            this.board,
            this.currentTurn,
            this.getCastlingRights(),
            this.getEnPassantTarget(),
            this.halfMoveClock,
            this.fullMoveNumber
        );
    }

    public getPGN(): string {
        return this.pgnNotation.generatePGN(this.moveHistory);
    }

    public promotePawn(square: string, pieceType: string): boolean {
        const piece = this.board.getPiece(square);
        if (!piece || piece.type !== 'pawn') {
            return false;
        }

        // Ensure we're on a promotion rank
        const rank = square.charAt(1);
        if ((piece.color === Color.WHITE && rank !== '8') ||
            (piece.color === Color.BLACK && rank !== '1')) {
            return false;
        }

        // Create new piece based on type
        const newPiece = this.createPieceFromType(pieceType, piece.color);
        if (!newPiece) {
            return false;
        }

        // Set the new piece
        this.board.addPiece(newPiece);

        // Update the last move to reflect promotion
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            lastMove.promotion = newPiece;
        }

        return true;
    }

    public getMoveHistory(): string[] {
        return this.moveHistory.map(move => {
            return this.pgnNotation.moveToNotation(move);
        });
    }

    // Private helper methods
    private isValidSquare(square: string): boolean {
        return square.length === 2 &&
            square[0] >= 'a' && square[0] <= 'h' &&
            square[1] >= '1' && square[1] <= '8';
    }

    private findKing(color: Color, customBoard?: Board): string | null {
        const board = customBoard || this.board;
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const square = String.fromCharCode(file) + rank;
                const piece = board.getPiece(square);
                if (piece && piece.type === 'king' && piece.color === color) {
                    return square;
                }
            }
        }
        return null;
    }

    private isSquareUnderAttack(square: string, color: Color, customBoard?: Board): boolean {
        const board = customBoard || this.board;
        const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

        // Check every square for opponent pieces that could attack the target square
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const fromSquare = String.fromCharCode(file) + rank;
                const piece = board.getPiece(fromSquare);

                if (piece && piece.color === opponentColor) {
                    // Check if this piece can move to the target square
                    const movesWithoutCheck = piece.getPossibleMoves(fromSquare, board);
                    if (movesWithoutCheck.includes(square)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private hasAnyValidMoves(): boolean {
        // Check if the current player has any valid moves
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const square = String.fromCharCode(file) + rank;
                const piece = this.board.getPiece(square);

                if (piece && piece.color === this.currentTurn) {
                    const validMoves = this.getValidMoves(square);
                    if (validMoves.length > 0) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private handleSpecialMoves(move: Move): void {
        const piece = move.piece;

        // Castling
        if (piece.type === 'king' && Math.abs(move.from.charCodeAt(0) - move.to.charCodeAt(0)) > 1) {
            // Determine if it's kingside or queenside castling
            const isKingside = move.to.charAt(0) === 'g';
            const rank = move.from.charAt(1);

            if (isKingside) {
                // Move the rook from h to f
                const rookFrom = 'h' + rank;
                const rookTo = 'f' + rank;
                this.board.movePiece(rookFrom, rookTo);
                move.castling = { rookFrom, rookTo };
            } else {
                // Move the rook from a to d
                const rookFrom = 'a' + rank;
                const rookTo = 'd' + rank;
                this.board.movePiece(rookFrom, rookTo);
                move.castling = { rookFrom, rookTo };
            }
        }

        // En passant
        if (piece.type === 'pawn' &&
            move.from.charAt(0) !== move.to.charAt(0) &&
            !move.capturedPiece) {
            const rank = move.from.charAt(1);
            const captureSquare = move.to.charAt(0) + rank;
            move.capturedPiece = this.board.getPiece(captureSquare);
            this.board.removePiece(captureSquare);
            move.enPassant = captureSquare;
        }
    }

    private undoSpecialMoves(move: Move): void {
        // Undo castling
        if (move.castling) {
            this.board.movePiece(move.castling.rookTo, move.castling.rookFrom);
        }

        // Undo en passant
        if (move.enPassant && move.capturedPiece) {
            this.board.addPiece(move.capturedPiece);
        }
    }

    private isDraw(): boolean {
        // 50-move rule
        if (this.halfMoveClock >= 100) { // 50 moves = 100 half moves
            return true;
        }

        // Threefold repetition
        const currentPosition = this.getFEN().split(' ').slice(0, 4).join(' ');
        const repetitions = this.positionHistory.get(currentPosition) || 0;
        if (repetitions >= 3) {
            return true;
        }

        // Insufficient material
        return this.hasInsufficientMaterial();
    }

    private hasInsufficientMaterial(): boolean {
        let pieces: Piece[] = [];

        // Collect all pieces on the board
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const square = String.fromCharCode(file) + rank;
                const piece = this.board.getPiece(square);
                if (piece) {
                    pieces.push(piece);
                }
            }
        }

        // Count pieces by type and color
        const whitePieces = pieces.filter(p => p.color === Color.WHITE);
        const blackPieces = pieces.filter(p => p.color === Color.BLACK);

        // K vs K
        if (whitePieces.length === 1 && blackPieces.length === 1) {
            return true;
        }

        // K vs K+B or K vs K+N
        if ((whitePieces.length === 1 && blackPieces.length === 2) ||
            (whitePieces.length === 2 && blackPieces.length === 1)) {
            const minorPieces = pieces.filter(p => p.type === 'bishop' || p.type === 'knight');
            if (minorPieces.length === 1) {
                return true;
            }
        }

        // K+B vs K+B (same color bishops)
        if (whitePieces.length === 2 && blackPieces.length === 2) {
            const whiteBishops = whitePieces.filter(p => p.type === 'bishop');
            const blackBishops = blackPieces.filter(p => p.type === 'bishop');

            if (whiteBishops.length === 1 && blackBishops.length === 1) {
                // Check if bishops are on same colored squares
                let whiteSquare = '';
                let blackSquare = '';

                for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
                    for (let rank = 1; rank <= 8; rank++) {
                        const square = String.fromCharCode(file) + rank;
                        const piece = this.board.getPiece(square);
                        if (piece && piece.type === 'bishop') {
                            if (piece.color === Color.WHITE) {
                                whiteSquare = square;
                            } else {
                                blackSquare = square;
                            }
                        }
                    }
                }

                // If both bishops are on same colored squares
                const isWhiteSquareLight = (whiteSquare.charCodeAt(0) - 'a'.charCodeAt(0) + parseInt(whiteSquare.charAt(1))) % 2 === 0;
                const isBlackSquareLight = (blackSquare.charCodeAt(0) - 'a'.charCodeAt(0) + parseInt(blackSquare.charAt(1))) % 2 === 0;

                if (isWhiteSquareLight === isBlackSquareLight) {
                    return true;
                }
            }
        }

        return false;
    }

    private recordPosition(): void {
        const position = this.getFEN().split(' ').slice(0, 4).join(' ');
        this.positionHistory.set(position, (this.positionHistory.get(position) || 0) + 1);
    }

    private getCastlingRights(): string {
        let rights = '';

        // White kingside
        if (this.canCastle(Color.WHITE, true)) {
            rights += 'K';
        }

        // White queenside
        if (this.canCastle(Color.WHITE, false)) {
            rights += 'Q';
        }

        // Black kingside
        if (this.canCastle(Color.BLACK, true)) {
            rights += 'k';
        }

        // Black queenside
        if (this.canCastle(Color.BLACK, false)) {
            rights += 'q';
        }

        return rights || '-';
    }

    private canCastle(color: Color, kingside: boolean): boolean {
        // Check if king has moved
        const kingSquare = color === Color.WHITE ? 'e1' : 'e8';
        const king = this.board.getPiece(kingSquare);

        if (!king || king.type !== 'king' || king.hasMoved) {
            return false;
        }

        // Check if rook has moved
        const rookSquare = kingside
            ? (color === Color.WHITE ? 'h1' : 'h8')
            : (color === Color.WHITE ? 'a1' : 'a8');
        const rook = this.board.getPiece(rookSquare);

        if (!rook || rook.type !== 'rook' || rook.hasMoved) {
            return false;
        }

        return true;
    }

    private getEnPassantTarget(): string {
        if (this.moveHistory.length === 0) {
            return '-';
        }

        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        const piece = lastMove.piece;

        // Check if last move was a pawn moving two squares
        if (piece.type === 'pawn' &&
            Math.abs(parseInt(lastMove.from.charAt(1)) - parseInt(lastMove.to.charAt(1))) === 2) {
            // Calculate the en passant target square
            const file = lastMove.to.charAt(0);
            const rank = lastMove.piece.color === Color.WHITE ? '3' : '6';
            return file + rank;
        }

        return '-';
    }

    private createPieceFromType(type: string, color: Color): Piece | null {
        // Implementation depends on your piece class hierarchy
        // This would typically create a new piece instance based on the type string
        // Return null if type is invalid

        // This is a placeholder - you'll need to implement this based on your piece classes
        switch (type.toLowerCase()) {
            case 'queen':
            // return new Queen(color);
            case 'rook':
            // return new Rook(color);
            case 'bishop':
            // return new Bishop(color);
            case 'knight':
            // return new Knight(color);
            default:
                return null;
        }
    }
}