import { Board } from '../board/Board';
import { Square, Color } from '../board/Square';
import { Piece } from '../pieces/Piece';
import { Pawn } from '../pieces/Pawn';
import { Rook } from '../pieces/Rook';
import { Knight } from '../pieces/Knight';
import { Bishop } from '../pieces/Bishop';
import { Queen } from '../pieces/Queen';
import { King } from '../pieces/King';

export class FENNotation {
    // Standard starting position in FEN
    private readonly INITIAL_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    constructor() { }

    public parseFEN(fen: string): {
        board: Board,
        activeColor: Color,
        halfMoveClock: number,
        fullMoveNumber: number
    } {
        const parts = fen.trim().split(/\s+/);
        if (parts.length !== 6) {
            throw new Error('Invalid FEN string: incorrect number of fields');
        }

        const [position, activeColor, castling, enPassant, halfMoveClockStr, fullMoveNumberStr] = parts;

        // Create a new board
        const board = new Board();

        // Clear the board first
        board.clear();

        // Parse the position
        const ranks = position.split('/');
        if (ranks.length !== 8) {
            throw new Error('Invalid FEN string: incorrect number of ranks');
        }

        // Loop through ranks (8 to 1)
        for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
            const rank = ranks[rankIndex];
            let fileIndex = 0;

            for (let i = 0; i < rank.length; i++) {
                const char = rank.charAt(i);

                if (/[1-8]/.test(char)) {
                    // Skip empty squares
                    fileIndex += parseInt(char);
                } else {
                    if (fileIndex >= 8) {
                        throw new Error('Invalid FEN string: too many pieces in rank');
                    }

                    // Convert file index to file letter (a-h)
                    const file = String.fromCharCode('a'.charCodeAt(0) + fileIndex);
                    // Convert rank index to rank number (8-1)
                    const rankNum = 8 - rankIndex;
                    const square = file + rankNum;

                    // Create piece based on character
                    const piece = this.createPieceFromChar(char);
                    if (piece) {
                        board.setPiece(square, piece);
                    }

                    fileIndex++;
                }
            }

            if (fileIndex !== 8) {
                throw new Error('Invalid FEN string: incorrect number of squares in rank');
            }
        }

        // Parse active color
        const color = activeColor === 'w' ? Color.WHITE : Color.BLACK;

        // Store castling rights and en passant target
        // These would normally be used to set appropriate flags on the board or pieces
        this.parseCastlingRights(board, castling);
        this.parseEnPassantTarget(board, enPassant);

        // Parse half-move clock and full move number
        const halfMoveClock = parseInt(halfMoveClockStr);
        const fullMoveNumber = parseInt(fullMoveNumberStr);

        if (isNaN(halfMoveClock) || isNaN(fullMoveNumber)) {
            throw new Error('Invalid FEN string: invalid half-move clock or full move number');
        }

        return {
            board,
            activeColor: color,
            halfMoveClock,
            fullMoveNumber
        };
    }

    public generateFEN(
        board: Board,
        activeColor: Color,
        castlingRights: string,
        enPassantTarget: string,
        halfMoveClock: number,
        fullMoveNumber: number
    ): string {
        let fen = '';

        // Position
        for (let rank = 8; rank >= 1; rank--) {
            let emptyCount = 0;

            for (let fileCode = 'a'.charCodeAt(0); fileCode <= 'h'.charCodeAt(0); fileCode++) {
                const file = String.fromCharCode(fileCode);
                const square = file + rank;
                const piece = board.getPiece(square);

                if (piece) {
                    // If there were empty squares before this piece, add the count
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }

                    // Add piece character
                    fen += this.getPieceChar(piece);
                } else {
                    // Increment empty square count
                    emptyCount++;
                }
            }

            // If the rank ends with empty squares, add the count
            if (emptyCount > 0) {
                fen += emptyCount;
            }

            // Add rank separator except for the last rank
            if (rank > 1) {
                fen += '/';
            }
        }

        // Active color
        fen += ' ' + (activeColor === Color.WHITE ? 'w' : 'b');

        // Castling availability
        fen += ' ' + (castlingRights || '-');

        // En passant target square
        fen += ' ' + (enPassantTarget || '-');

        // Halfmove clock
        fen += ' ' + halfMoveClock;

        // Fullmove number
        fen += ' ' + fullMoveNumber;

        return fen;
    }

    // Private helper methods
    private createPieceFromChar(char: string): Piece | null {
        const color = char === char.toUpperCase() ? Color.WHITE : Color.BLACK;
        const pieceChar = char.toLowerCase();

        switch (pieceChar) {
            case 'p': return new Pawn(color);
            case 'r': return new Rook(color);
            case 'n': return new Knight(color);
            case 'b': return new Bishop(color);
            case 'q': return new Queen(color);
            case 'k': return new King(color);
            default: return null;
        }
    }

    private getPieceChar(piece: Piece): string {
        let char = '';

        switch (piece.getType()) {
            case 'pawn': char = 'p'; break;
            case 'rook': char = 'r'; break;
            case 'knight': char = 'n'; break;
            case 'bishop': char = 'b'; break;
            case 'queen': char = 'q'; break;
            case 'king': char = 'k'; break;
        }

        // Uppercase for white pieces
        if (piece.color === Color.WHITE) {
            char = char.toUpperCase();
        }

        return char;
    }

    private parseCastlingRights(board: Board, castling: string): void {
        // Implementation depends on how you track castling rights
        // This could involve setting flags on the king and rook pieces

        // White king
        const whiteKing = board.getPiece('e1');
        if (whiteKing && whiteKing.getType() === 'king') {
            // Set hasMoved flag based on castling rights
            whiteKing.setHasMoved(!castling.includes('K') && !castling.includes('Q'));
        }

        // Black king
        const blackKing = board.getPiece('e8');
        if (blackKing && blackKing.getType() === 'king') {
            // Set hasMoved flag based on castling rights
            blackKing.setHasMoved(!castling.includes('k') && !castling.includes('q'));
        }

        // White rooks
        const whiteRookH = board.getPiece('h1');
        if (whiteRookH && whiteRookH.getType() === 'rook') {
            whiteRookH.setHasMoved(!castling.includes('K'));
        }

        const whiteRookA = board.getPiece('a1');
        if (whiteRookA && whiteRookA.getType() === 'rook') {
            whiteRookA.setHasMoved(!castling.includes('Q'));
        }

        // Black rooks
        const blackRookH = board.getPiece('h8');
        if (blackRookH && blackRookH.getType() === 'rook') {
            blackRookH.setHasMoved(!castling.includes('k'));
        }

        const blackRookA = board.getPiece('a8');
        if (blackRookA && blackRookA.getType() === 'rook') {
            blackRookA.setHasMoved(!castling.includes('q'));
        }
    }

    private parseEnPassantTarget(board: Board, enPassant: string): void {
        // Implementation depends on how you track en passant possibilities
        // This could involve setting a flag on the board or specific pawns

        if (enPassant !== '-') {
            board.setEnPassantTarget(enPassant);
        } else {
            board.setEnPassantTarget(null);
        }
    }
}