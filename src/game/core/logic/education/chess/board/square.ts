export enum Color {
    WHITE = 'white',
    BLACK = 'black',
}

export enum SquareColor {
    LIGHT = 'light',
    DARK = 'dark',
}

export class Square {
    readonly file: string;
    readonly rank: number;
    readonly color: SquareColor;
    readonly notation: string;

    constructor(file: string, rank: number) {
        this.file = file;
        this.rank = rank;
        this.notation = `${file}${rank}`;

        // Determine square color (light or dark)
        const fileIndex = 'abcdefgh'.indexOf(file);
        this.color = (fileIndex + rank) % 2 === 0 ? SquareColor.DARK : SquareColor.LIGHT;
    }
}