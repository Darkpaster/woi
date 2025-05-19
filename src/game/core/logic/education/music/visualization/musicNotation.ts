// visualization/musicNotation.ts
import {Visualizer, VisualizationOptions} from './visualizer.ts';

export interface Note {
    pitch: string;    // e.g., 'C4', 'D#5', 'Bb3'
    duration: number; // in beats
    startTime: number; // in beats
    velocity: number; // 0-127
    accidental?: 'sharp' | 'flat' | 'natural' | null;
    isRest?: boolean;
}

export interface TimeSignature {
    numerator: number;
    denominator: number;
}

export interface Clef {
    type: 'treble' | 'bass' | 'alto' | 'tenor';
    octaveChange?: number;
}

export interface MusicStaffOptions extends VisualizationOptions {
    notes: Note[];
    clef: Clef;
    timeSignature: TimeSignature;
    keySignature: string; // e.g., 'C', 'G', 'F', 'Bb'
    tempo: number; // BPM
    lineSpacing: number;
    measureWidth: number;
    noteColor: string;
    lineColor: string;
    textColor: string;
    highlightColor: string;
    currentBeat: number;
    showMeasureNumbers: boolean;
    autoScroll: boolean;
    showTimeSignature: boolean;
    showKeySignature: boolean;
    showClef: boolean;
}

export const DEFAULT_MUSIC_STAFF_OPTIONS: MusicStaffOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    notes: [],
    clef: {type: 'treble'},
    timeSignature: {numerator: 4, denominator: 4},
    keySignature: 'C',
    tempo: 120,
    lineSpacing: 10,
    measureWidth: 200,
    noteColor: '#000000',
    lineColor: '#333333',
    textColor: '#000000',
    highlightColor: 'rgba(97, 218, 251, 0.3)',
    currentBeat: 0,
    showMeasureNumbers: true,
    autoScroll: true,
    showTimeSignature: true,
    showKeySignature: true,
    showClef: true
};

export class MusicNotation extends Visualizer {
    private options: MusicStaffOptions;
    private scrollPosition: number = 0;
    private pitchMap: Map<string, number> = new Map();
    private accidentalMap: Map<string, string> = new Map();
    private animationFrameId: number | null = null;

    constructor(canvas: HTMLCanvasElement, options: Partial<MusicStaffOptions> = {}) {
        super(canvas, options);
        this.options = {...DEFAULT_MUSIC_STAFF_OPTIONS, ...options};
        this.initializePitchMap();
        this.updateKeySignatureMap();
        this.startAnimation();
    }

    private initializePitchMap(): void {
        // Map pitch names to staff positions
        // For treble clef: E4 is the first line from bottom
        const pitches = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const octaves = [2, 3, 4, 5, 6];

        let position = 0;
        octaves.forEach(octave => {
            pitches.forEach(pitch => {
                this.pitchMap.set(`${pitch}${octave}`, position);
                position++;
            });
        });
    }

    private updateKeySignatureMap(): void {
        // Clear previous accidentals
        this.accidentalMap.clear();

        const keySignature = this.options.keySignature;

        // Define key signatures and their accidentals
        const keySignatures: Record<string, { type: 'sharp' | 'flat', pitches: string[] }> = {
            'C': {type: 'natural', pitches: []},
            'G': {type: 'sharp', pitches: ['F']},
            'D': {type: 'sharp', pitches: ['F', 'C']},
            'A': {type: 'sharp', pitches: ['F', 'C', 'G']},
            'E': {type: 'sharp', pitches: ['F', 'C', 'G', 'D']},
            'B': {type: 'sharp', pitches: ['F', 'C', 'G', 'D', 'A']},
            'F#': {type: 'sharp', pitches: ['F', 'C', 'G', 'D', 'A', 'E']},
            'C#': {type: 'sharp', pitches: ['F', 'C', 'G', 'D', 'A', 'E', 'B']},
            'F': {type: 'flat', pitches: ['B']},
            'Bb': {type: 'flat', pitches: ['B', 'E']},
            'Eb': {type: 'flat', pitches: ['B', 'E', 'A']},
            'Ab': {type: 'flat', pitches: ['B', 'E', 'A', 'D']},
            'Db': {type: 'flat', pitches: ['B', 'E', 'A', 'D', 'G']},
            'Gb': {type: 'flat', pitches: ['B', 'E', 'A', 'D', 'G', 'C']},
            'Cb': {type: 'flat', pitches: ['B', 'E', 'A', 'D', 'G', 'C', 'F']}
        };

        const key = keySignatures[keySignature];
        if (!key) return;

        // Apply accidentals for the key signature
        if (key.type === 'sharp') {
            key.pitches.forEach(pitch => {
                this.accidentalMap.set(pitch, 'sharp');
            });
        } else if (key.type === 'flat') {
            key.pitches.forEach(pitch => {
                this.accidentalMap.set(pitch, 'flat');
            });
        }
    }

    private startAnimation(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const animate = () => {
            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    public render(): void {
        if (!this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Apply background
        this.applyBackground(ctx);

        // Update scroll position if auto-scroll is enabled
        if (this.options.autoScroll) {
            this.updateScrollPosition();
        }

        // Draw staff
        this.drawStaff(ctx);

        // Draw notes
        this.drawNotes(ctx);
    }

    private updateScrollPosition(): void {
        const {measureWidth, timeSignature, currentBeat} = this.options;
        const beatsPerMeasure = timeSignature.numerator;
        const currentMeasure = Math.floor(currentBeat / beatsPerMeasure);
        const targetScrollPosition = currentMeasure * measureWidth;

        // Smooth scrolling
        this.scrollPosition += (targetScrollPosition - this.scrollPosition) * 0.1;
    }

    private drawStaff(ctx: CanvasRenderingContext2D): void {
        const {
            width,
            height,
            lineSpacing,
            measureWidth,
            lineColor,
            textColor,
            showMeasureNumbers,
            showTimeSignature,
            showKeySignature,
            showClef,
            timeSignature,
            clef
        } = this.options;

        // Calculate staff dimensions
        const staffHeight = lineSpacing * 4; // 5 lines = 4 spaces
        const staffY = height / 2 - staffHeight / 2;

        // Draw staff lines
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;

        for (let i = 0; i < 5; i++) {
            const y = staffY + i * lineSpacing;

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Calculate visible measures
        const startX = -this.scrollPosition;
        const visibleMeasures = Math.ceil(width / measureWidth) + 1;
        const startMeasure = Math.max(0, Math.floor(this.scrollPosition / measureWidth));

        // Draw measure lines and numbers
        for (let i = startMeasure; i < startMeasure + visibleMeasures; i++) {
            const x = startX + i * measureWidth;

            // Skip if out of view
            if (x < -measureWidth || x > width) continue;

            // Draw measure line
            ctx.beginPath();
            ctx.moveTo(x, staffY);
            ctx.lineTo(x, staffY + staffHeight);
            ctx.stroke();

            // Draw measure number if enabled
            if (showMeasureNumbers && i > 0) {
                ctx.fillStyle = textColor;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(i.toString(), x - measureWidth / 2, staffY + staffHeight + 5);
            }
        }

        // Draw clef if enabled
        if (showClef) {
            this.drawClef(ctx, startX, staffY, lineSpacing, clef);
        }

        // Draw time signature if enabled
        if (showTimeSignature) {
            const timeSignatureX = startX + (showClef ? 50 : 20);
            this.drawTimeSignature(ctx, timeSignatureX, staffY, lineSpacing, timeSignature);
        }

        // Draw key signature if enabled
        if (showKeySignature) {
            const keySignatureX = startX + (showClef ? 70 : 40) + (showTimeSignature ? 20 : 0);
            this.drawKeySignature(ctx, keySignatureX, staffY, lineSpacing);
        }
    }

    private drawClef(ctx: CanvasRenderingContext2D, x: number, staffY: number, lineSpacing: number, clef: Clef): void {
        ctx.fillStyle = this.options.noteColor;
        ctx.font = `${lineSpacing * 6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let symbol = '';
        let yOffset = 0;

        switch (clef.type) {
            case 'treble':
                symbol = '𝄞'; // G clef
                yOffset = lineSpacing;
                break;
            case 'bass':
                symbol = '𝄢'; // F clef
                yOffset = lineSpacing * 2;
                break;
            case 'alto':
                symbol = '𝄡'; // C clef
                yOffset = lineSpacing;
                break;
            case 'tenor':
                symbol = '𝄡'; // C clef
                yOffset = lineSpacing * 2;
                break;
        }

        ctx.fillText(symbol, x + 25, staffY + lineSpacing * 2 + yOffset);
    }

    private drawTimeSignature(
        ctx: CanvasRenderingContext2D,
        x: number,
        staffY: number,
        lineSpacing: number,
        timeSignature: TimeSignature
    ): void {
        ctx.fillStyle = this.options.noteColor;
        ctx.font = `bold ${lineSpacing * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw numerator
        ctx.fillText(
            timeSignature.numerator.toString(),
            x,
            staffY + lineSpacing
        );

        // Draw denominator
        ctx.fillText(
            timeSignature.denominator.toString(),
            x,
            staffY + lineSpacing * 3
        );
    }

    private drawKeySignature(ctx: CanvasRenderingContext2D, x: number, staffY: number, lineSpacing: number): void {
        const keySignature = this.options.keySignature;

        // Skip for C major/A minor (no accidentals)
        if (keySignature === 'C') return;

        // Define key signatures and their accidentals
        const keySignatures: Record<string, { type: 'sharp' | 'flat', pitches: string[] }> = {
            'C': {type: 'natural', pitches: []},
            'G': {type: 'sharp', pitches: ['F']},
            'D': {type: 'sharp', pitches: ['F', 'C']},
            'A': {type: 'sharp', pitches: ['F', 'C', 'G']},
            'E': {type: 'sharp', pitches: ['F', 'C', 'G', 'D']},
            'B': {type: 'sharp', pitches: ['F', 'C', 'G', 'D', 'A']},
            'F#': {type: 'sharp', pitches: ['F', 'C', 'G', 'D', 'A', 'E']},
            'C#': {type: 'sharp', pitches: ['F', 'C', 'G', 'D', 'A', 'E', 'B']},
            'F': {type: 'flat', pitches: ['B']},
            'Bb': {type: 'flat', pitches: ['B', 'E']},
            'Eb': {type: 'flat', pitches: ['B', 'E', 'A']},
            'Ab': {type: 'flat', pitches: ['B', 'E', 'A', 'D']},
            'Db': {type: 'flat', pitches: ['B', 'E', 'A', 'D', 'G']},
            'Gb': {type: 'flat', pitches: ['B', 'E', 'A', 'D', 'G', 'C']},
            'Cb': {type: 'flat', pitches: ['B', 'E', 'A', 'D', 'G', 'C', 'F']}
        };

        const key = keySignatures[keySignature];
        if (!key) return;

        ctx.fillStyle = this.options.noteColor;
        ctx.font = `${lineSpacing * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Define staff positions for accidentals
        const positions: Record<string, number> = {
            'F': 5, // Top line in treble clef
            'C': 2, // Middle line in treble clef
            'G': 6, // Top space in treble clef
            'D': 3, // Middle space in treble clef
            'A': 0, // Second line from bottom in treble clef
            'E': 4, // Fourth line from bottom in treble clef
            'B': 1  // Second space from bottom in treble clef
        };

        // Positions for sharps and flats are different
        const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
        const flatOrder = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

        if (key.type === 'sharp') {
            // Draw sharps in standard order
            for (let i = 0; i < key.pitches.length; i++) {
                const pitch = sharpOrder[i];
                const position = positions[pitch];
                const symY = staffY + (4 - position / 2) * lineSpacing;
                ctx.fillText('♯', x + i * 10, symY);
            }
        } else if (key.type === 'flat') {
            // Draw flats in standard order
            for (let i = 0; i < key.pitches.length; i++) {
                const pitch = flatOrder[i];
                const position = positions[pitch];
                const symY = staffY + (4 - position / 2) * lineSpacing;
                ctx.fillText('♭', x + i * 10, symY);
            }
        }
    }

    private drawNotes(ctx: CanvasRenderingContext2D): void {
        const {
            notes,
            lineSpacing,
            measureWidth,
            timeSignature,
            noteColor,
            highlightColor,
            currentBeat
        } = this.options;

        // Calculate staff dimensions
        const staffHeight = lineSpacing * 4;
        const staffY = this.canvas.height / 2 - staffHeight / 2;

        // Calculate beats per measure and visible range
        const beatsPerMeasure = timeSignature.numerator;
        const startX = -this.scrollPosition;

        // Draw highlighting for current beat
        const currentMeasure = Math.floor(currentBeat / beatsPerMeasure);
        const beatInMeasure = currentBeat % beatsPerMeasure;
        const highlightX = startX + currentMeasure * measureWidth + (measureWidth / beatsPerMeasure) * beatInMeasure;
        const highlightWidth = measureWidth / beatsPerMeasure;

        ctx.fillStyle = highlightColor;
        ctx.fillRect(highlightX, staffY - lineSpacing, highlightWidth, staffHeight + 2 * lineSpacing);

        // Draw each note
        for (const note of notes) {
            // Skip rests
            if (note.isRest) continue;

            // Calculate note position
            const measure = Math.floor(note.startTime / beatsPerMeasure);
            const beatInMeasure = note.startTime % beatsPerMeasure;
            const noteX = startX + measure * measureWidth + (measureWidth / beatsPerMeasure) * beatInMeasure;

            // Skip if out of view
            if (noteX < -50 || noteX > this.canvas.width + 50) continue;

            // Get pitch position
            const pitch = note.pitch;
            const pitchBase = pitch.slice(0, -1); // e.g., 'C' from 'C4'
            const octave = parseInt(pitch.slice(-1));
            const pitchKey = `${pitchBase}${octave}`;

            // Get position on staff
            let position = this.pitchMap.get(pitchKey) || 0;

            // Adjust position for sharps and flats
            if (note.accidental === 'sharp') {
                // No change to position, just draw the symbol
            } else if (note.accidental === 'flat') {
                // No change to position, just draw the symbol
            }

            // Calculate Y position on staff
            // In treble clef: E4 (position 14) is the first line from bottom
            const basePosition = 14; // E4 in treble clef
            const noteY = staffY + (4 - (position - basePosition) / 2) * lineSpacing;

            // Draw note
            this.drawNote(ctx, noteX, noteY, note, lineSpacing);
        }
    }

    private drawNote(ctx: CanvasRenderingContext2D, x: number, y: number, note: Note, lineSpacing: number): void {
        ctx.fillStyle = this.options.noteColor;

        // Draw accidental if needed
        if (note.accidental) {
            let accidentalSymbol = '';
            switch (note.accidental) {
                case 'sharp':
                    accidentalSymbol = '♯';
                    break;
                case 'flat':
                    accidentalSymbol = '♭';
                    break;
                case 'natural':
                    accidentalSymbol = '♮';
                    break;
            }

            ctx.font = `${lineSpacing * 2}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(accidentalSymbol, x - lineSpacing, y);
        }

        // Draw note head
        ctx.beginPath();
        ctx.ellipse(x, y, lineSpacing * 0.8, lineSpacing * 0.6, 0, 0, Math.PI * 2);

        // Fill or stroke based on duration
        if (note.duration < 2) {
            // Filled for quarter notes and shorter
            ctx.fill();
        } else {
            // Hollow for half notes and longer
            ctx.stroke();
        }

        // Draw stem (for all except whole notes)
        if (note.duration < 4) {
            ctx.beginPath();
            // Stem direction based on pitch (up for low notes, down for high notes)
            const stemDirection = y > this.canvas.height / 2 ? -1 : 1;
            ctx.moveTo(x + lineSpacing * 0.7, y);
            ctx.lineTo(x + lineSpacing * 0.7, y + stemDirection * 3 * lineSpacing);
            ctx.stroke();

            // Draw flags for eighth notes and shorter
            if (note.duration <= 0.5) {
                const flagCount = note.duration <= 0.25 ? 2 : 1;

                for (let i = 0; i < flagCount; i++) {
                    const flagY = y + stemDirection * (3 - i * 0.5) * lineSpacing;

                    ctx.beginPath();
                    ctx.moveTo(x + lineSpacing * 0.7, flagY);
                    ctx.bezierCurveTo(
                        x + lineSpacing * 2, flagY - stemDirection * lineSpacing * 0.5,
                        x + lineSpacing * 1.5, flagY,
                        x + lineSpacing * 0.7, flagY - stemDirection * lineSpacing * 0.5
                    );
                    ctx.stroke();
                }
            }
        }

        // Draw ledger lines if needed
        const staffTop = this.canvas.height / 2 - 2 * lineSpacing;
        const staffBottom = this.canvas.height / 2 + 2 * lineSpacing;

        if (y < staffTop) {
            // Draw ledger lines above staff
            for (let lineY = staffTop - lineSpacing; lineY >= y - lineSpacing / 2; lineY -= lineSpacing) {
                ctx.beginPath();
                ctx.moveTo(x - lineSpacing, lineY);
                ctx.lineTo(x + lineSpacing, lineY);
                ctx.stroke();
            }
        } else if (y > staffBottom) {
            // Draw ledger lines below staff
            for (let lineY = staffBottom + lineSpacing; lineY <= y + lineSpacing / 2; lineY += lineSpacing) {
                ctx.beginPath();
                ctx.moveTo(x - lineSpacing, lineY);
                ctx.lineTo(x + lineSpacing, lineY);
                ctx.stroke();
            }
        }
    }

    public addNote(note: Note): void {
        this.options.notes.push(note);

        // Sort notes by start time
        this.options.notes.sort((a, b) => a.startTime - b.startTime);
    }

    public clearNotes(): void {
        this.options.notes = [];
    }

    public setCurrentBeat(beat: number): void {
        this.options.currentBeat = beat;
    }

    public updateOptions(options: Partial<MusicStaffOptions>): void {
        this.options = {...this.options, ...options};

        // Update key signature map if it changed
        if (options.keySignature) {
            this.updateKeySignatureMap();
        }
    }

    public updateKeySignatureMap(): void {
        this.accidentalMap.clear();

        if (options.keySignature) {
            this.updateKeySignatureMap();
        }
    }

    public dispose(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        super.dispose();
    }
}