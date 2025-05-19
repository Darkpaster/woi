import {Move} from "../game/move.ts";

export class PGNNotation {
    private tags: Map<string, string>;

    constructor() {
        this.tags = new Map<string, string>();
        this.initDefaultTags();
    }

    private initDefaultTags(): void {
        const date = new Date().toISOString().substring(0, 10).replace(/-/g, '.');
        this.tags.set('Event', '?');
        this.tags.set('Site', '?');
        this.tags.set('Date', date);
        this.tags.set('Round', '?');
        this.tags.set('White', '?');
        this.tags.set('Black', '?');
        this.tags.set('Result', '*');
    }

    public setTag(key: string, value: string): void {
        this.tags.set(key, value);
    }

    public getTag(key: string): string | undefined {
        return this.tags.get(key);
    }

    public moveToNotation(move: Move): string {
        return move.toSAN();
    }

    public generatePGN(moves: Move[]): string {
        let pgn = '';

        // Add tags
        this.tags.forEach((value, key) => {
            pgn += `[${key} "${value}"]\n`;
        });
        pgn += '\n';

        // Add moves
        let moveNum = 1;
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];

            // Add move number for white's move
            if (i % 2 === 0) {
                pgn += `${moveNum}. `;
            }

            // Add the move notation
            pgn += this.moveToNotation(move) + ' ';

            // Increment move number after black's move
            if (i % 2 === 1) {
                moveNum++;

                // Add newline every few moves for readability
                if (moveNum % 5 === 1) {
                    pgn += '\n';
                }
            }
        }

        // Add result
        pgn += ' ' + this.tags.get('Result');

        return pgn;
    }

    public parsePGN(pgn: string): { tags: Map<string, string>, moves: string[] } {
        const tags = new Map<string, string>();
        const moves: string[] = [];

        // Split into lines
        const lines = pgn.split('\n');

        // Process the header section (tags)
        let i = 0;
        while (i < lines.length && lines[i].trim().startsWith('[')) {
            const line = lines[i].trim();
            const tagMatch = line.match(/\[(\w+)\s+"(.*)"\]/);

            if (tagMatch) {
                tags.set(tagMatch[1], tagMatch[2]);
            }

            i++;
        }

        // Skip empty lines between tags and movetext
        while (i < lines.length && lines[i].trim() === '') {
            i++;
        }

        // Process the movetext section
        let movetext = '';
        while (i < lines.length) {
            movetext += ' ' + lines[i].trim();
            i++;
        }

        // Clean up the movetext
        movetext = movetext.trim()
            .replace(/\s+/g, ' ')              // Normalize whitespace
            .replace(/\{[^}]*}/g, '')         // Remove comments in curly braces
            .replace(/;.*/g, '')               // Remove comments starting with semicolon
            .replace(/\$\d+/g, '')             // Remove NAG annotations
            .replace(/\([^)]*\)/g, '')         // Remove variations in parentheses
            .replace(/\s+/g, ' ')              // Normalize whitespace again after removing comments
            .trim();

        // Extract moves
        const moveRegex = /\d+\.+\s+(\S+)\s+(\S+)|\d+\.+\s+(\S+)/g;
        let match;

        while ((match = moveRegex.exec(movetext)) !== null) {
            if (match[1]) moves.push(match[1]);
            if (match[2]) moves.push(match[2]);
            if (match[3]) moves.push(match[3]);
        }

        // Remove result indicator from the last move if present
        const lastMove = moves[moves.length - 1];
        if (lastMove && (lastMove === '1-0' || lastMove === '0-1' || lastMove === '1/2-1/2' || lastMove === '*')) {
            moves.pop();
        }

        return { tags, moves };
    }
}