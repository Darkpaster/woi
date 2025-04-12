import {Visualizer, VisualizationOptions, DEFAULT_VISUALIZATION_OPTIONS} from './visualizer';

export interface PianoRollOptions extends VisualizationOptions {
    keyboardWidth: number;
    timeWindow: number; // in seconds
    minNote: number;    // MIDI note number for the lowest note
    maxNote: number;    // MIDI note number for the highest note
    noteColor: string;
    activeNoteColor: string;
    whiteKeyColor: string;
    blackKeyColor: string;
    gridColor: string;
}

export const DEFAULT_PIANO_ROLL_OPTIONS: PianoRollOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    keyboardWidth: 80,
    timeWindow: 8,      // 8 seconds
    minNote: 36,        // C2
    maxNote: 84,        // C6
    noteColor: '#4a90e2',
    activeNoteColor: '#ff6b6b',
    whiteKeyColor: '#ffffff',
    blackKeyColor: '#333333',
    gridColor: '#555555'
};

export interface PianoRollNote {
    midiNote: number;
    startTime: number;
    duration: number;
    velocity: number;
    active?: boolean;
}

export class PianoRoll extends Visualizer {
    private options: PianoRollOptions;
    private notes: PianoRollNote[] = [];
    private playbackTime: number = 0;

    constructor(canvas: HTMLCanvasElement, options: Partial<PianoRollOptions> = {}) {
        super(canvas, options);
        this.options = {...DEFAULT_PIANO_ROLL_OPTIONS, ...options};
    }

    public setNotes(notes: PianoRollNote[]): void {
        this.notes = notes;
        this.render();
    }

    public setPlaybackTime(time: number): void {
        this.playbackTime = time;
        this.render();
    }

    private midiNoteToY(midiNote: number): number {
        const {height, minNote, maxNote} = this.options;
        const totalNotes = maxNote - minNote + 1;

        // Normalize to 0-1 range (inverted, as y increases downward)
        const normalizedNote = 1 - (midiNote - minNote) / totalNotes;

        // Map to canvas height
        return normalizedNote * height;
    }

    private timeToX(time: number): number {
        const {width, keyboardWidth, timeWindow} = this.options;
        const gridWidth = width - keyboardWidth;

        // Normalize to 0-1 range
        const normalizedTime = time / timeWindow;

        // Map to grid width, offset by keyboard width
        return keyboardWidth + (normalizedTime * gridWidth);
    }

    // private drawKeyboard(): void {
    //     const { height, keyboardWidth, minNote, maxNote, whiteKeyColor, blackKeyColor } = this.options;
    //
    //     // Draw white keys first
    //     const keyHeight = height / (maxNote - minNote + 1);
    //
    //     for (let midiNote = minNote; midiNote <= maxNote; midiNote++) {
    //         const isBlackKey = [1, 3, 6, 8, 10].includes(midiNote % 12);
    //
    //         if (!isBlackKey) {
    //             const y = this.midiNoteToY(midiNote);
    //             this.drawRectangle(0, y, keyboardWidth, keyHeight, whiteKeyColor);
    //             this.drawRectangle(0, y, keyboardWidth, keyHeight, blackKeyColor, false);
    //
    //             // Draw note name for C notes
    //             if (midiNote % 12 === 0) {
    //                 const octave = Math.floor(midiNote / 12) - 1;
}