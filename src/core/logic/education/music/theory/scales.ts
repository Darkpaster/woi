// theory/scales.ts
export enum NoteName {
    C = 'C',
    CSharp = 'C#',
    D = 'D',
    DSharp = 'D#',
    E = 'E',
    F = 'F',
    FSharp = 'F#',
    G = 'G',
    GSharp = 'G#',
    A = 'A',
    ASharp = 'A#',
    B = 'B'
}

// Map for enharmonic equivalents (flat notes)
const FLAT_EQUIVALENTS: { [key: string]: string } = {
    'C#': 'Db',
    'D#': 'Eb',
    'F#': 'Gb',
    'G#': 'Ab',
    'A#': 'Bb'
};

export class Note {
    private _name: NoteName;
    private _octave: number;
    private _frequency: number;
    private _midiNumber: number;

    constructor(name: NoteName | string, octave: number) {
        this._name = name as NoteName;
        this._octave = octave;
        this._midiNumber = this.calculateMidiNumber();
        this._frequency = this.calculateFrequency();
    }

    get name(): NoteName {
        return this._name;
    }

    get octave(): number {
        return this._octave;
    }

    get frequency(): number {
        return this._frequency;
    }

    get midiNumber(): number {
        return this._midiNumber;
    }

    /**
     * Get the pitch class (0-11) of the note, where C=0, C#=1, ..., B=11
     */
    get pitchClass(): number {
        const noteOrder = [
            NoteName.C, NoteName.CSharp, NoteName.D, NoteName.DSharp,
            NoteName.E, NoteName.F, NoteName.FSharp, NoteName.G,
            NoteName.GSharp, NoteName.A, NoteName.ASharp, NoteName.B
        ];
        return noteOrder.indexOf(this._name);
    }

    /**
     * Create a new note that is a specified number of semitones away from this note
     */
    transpose(semitones: number): Note {
        const newMidiNumber = this._midiNumber + semitones;
        return Note.fromMidiNumber(newMidiNumber);
    }

    /**
     * Calculate the MIDI note number (middle C = 60)
     */
    private calculateMidiNumber(): number {
        const noteOrder = [
            NoteName.C, NoteName.CSharp, NoteName.D, NoteName.DSharp,
            NoteName.E, NoteName.F, NoteName.FSharp, NoteName.G,
            NoteName.GSharp, NoteName.A, NoteName.ASharp, NoteName.B
        ];

        const noteIndex = noteOrder.indexOf(this._name);
        return (this._octave + 1) * 12 + noteIndex;
    }

    /**
     * Calculate frequency using standard tuning (A4 = 440Hz)
     */
    private calculateFrequency(): number {
        // A4 is MIDI note 69, at 440Hz
        const a4 = 69;
        const a4Freq = 440;
        return a4Freq * Math.pow(2, (this._midiNumber - a4) / 12);
    }

    /**
     * Return the name of the note with octave, e.g. "C4"
     */
    toString(): string {
        return `${this._name}${this._octave}`;
    }

    /**
     * Return flat notation if applicable
     */
    toFlatString(): string {
        const flatName = FLAT_EQUIVALENTS[this._name] || this._name;
        return `${flatName}${this._octave}`;
    }

    /**
     * Factory method to create a note from a MIDI number
     */
    static fromMidiNumber(midiNumber: number): Note {
        const noteNames = [
            NoteName.C, NoteName.CSharp, NoteName.D, NoteName.DSharp,
            NoteName.E, NoteName.F, NoteName.FSharp, NoteName.G,
            NoteName.GSharp, NoteName.A, NoteName.ASharp, NoteName.B
        ];

        const octave = Math.floor(midiNumber / 12) - 1;
        const noteIndex = midiNumber % 12;
        const noteName = noteNames[noteIndex];

        return new Note(noteName, octave);
    }

    /**
     * Factory method to create a note from a frequency
     */
    static fromFrequency(frequency: number): Note {
        // A4 is 440Hz
        const a4Freq = 440;
        const a4MidiNum = 69;

        // Calculate MIDI number from frequency
        // formula: 12 * log2(f/440) + 69
        const midiNumber = Math.round(12 * Math.log2(frequency / a4Freq) + a4MidiNum);

        return Note.fromMidiNumber(midiNumber);
    }

    /**
     * Create a note that is a specified number of semitones away from a reference note
     */
    static fromSemitones(referenceNote: Note, semitones: number): Note {
        return referenceNote.transpose(semitones);
    }

    /**
     * Create a note from a string like "C4" or "F#5"
     */
    static fromString(noteString: string): Note {
        // Parse the note string (e.g., "C4", "F#5")
        const match = noteString.match(/^([A-G][#]?)(\d+)$/);
        if (!match) {
            throw new Error(`Invalid note string: ${noteString}`);
        }

        const [, name, octaveStr] = match;
        const octave = parseInt(octaveStr, 10);

        return new Note(name as NoteName, octave);
    }
}

export type ScaleType = 'major' | 'minor' | 'harmonicMinor' | 'melodicMinor' |
    'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian' |
    'pentatonicMajor' | 'pentatonicMinor' | 'blues' | 'chromatic';

export class Scale {
    private _root: Note;
    private _type: ScaleType;
    private _notes: Note[];

    constructor(root: Note, type: ScaleType) {
        this._root = root;
        this._type = type;
        this._notes = this.buildScale();
    }

    get root(): Note {
        return this._root;
    }

    get type(): ScaleType {
        return this._type;
    }

    get notes(): Note[] {
        return [...this._notes];
    }

    /**
     * Builds the notes of the scale based on the root and type
     */
    private buildScale(): Note[] {
        // Define scale patterns as semitone intervals from the root
        const patterns: { [key in ScaleType]: number[] } = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
            melodicMinor: [0, 2, 3, 5, 7, 9, 11],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            phrygian: [0, 1, 3, 5, 7, 8, 10],
            lydian: [0, 2, 4, 6, 7, 9, 11],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            locrian: [0, 1, 3, 5, 6, 8, 10],
            pentatonicMajor: [0, 2, 4, 7, 9],
            pentatonicMinor: [0, 3, 5, 7, 10],
            blues: [0, 3, 5, 6, 7, 10],
            chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        };

        const intervals = patterns[this._type];
        return intervals.map(interval => Note.fromSemitones(this._root, interval));
    }

    /**
     * Get the scale degree (1-based) of the given note
     */
    getDegree(note: Note): number | null {
        const noteClass = note.pitchClass;

        for (let i = 0; i < this._notes.length; i++) {
            if (this._notes[i].pitchClass === noteClass) {
                return i + 1;
            }
        }

        return null; // Note is not in the scale
    }

    /**
     * Get the note at the specified scale degree (1-based)
     */
    getNoteAtDegree(degree: number): Note | null {
        if (degree < 1 || degree > this._notes.length) {
            return null;
        }

        return this._notes[degree - 1];
    }

    /**
     * Checks if the given note is in the scale
     */
    contains(note: Note): boolean {
        return this.getDegree(note) !== null;
    }

    /**
     * Returns a string representation of the scale
     */
    toString(): string {
        const rootName = this._root.toString().replace(/\d+$/, ''); // Remove octave number
        return `${rootName} ${this._type}`;
    }

    /**
     * Get all notes of the scale within a specific octave range
     */
    getNotesInOctaveRange(minOctave: number, maxOctave: number): Note[] {
        const result: Note[] = [];

        for (let octave = minOctave; octave <= maxOctave; octave++) {
            for (const note of this._notes) {
                const noteInOctave = new Note(note.name, octave);
                result.push(noteInOctave);
            }
        }

        return result;
    }

    /**
     * Transpose the scale to a new root note
     */
    transpose(newRoot: Note): Scale {
        return new Scale(newRoot, this._type);
    }

    /**
     * Get the parallel scale (same root, different type)
     * e.g., C major -> C minor
     */
    getParallelScale(newType: ScaleType): Scale {
        return new Scale(this._root, newType);
    }

    /**
     * Get the relative scale
     * e.g., C major -> A minor
     */
    getRelativeScale(): Scale | null {
        let relativeRoot: Note | null = null;
        let relativeType: ScaleType | null = null;

        if (this._type === 'major') {
            // Relative minor is 3 semitones down from the root of the major scale
            relativeRoot = Note.fromSemitones(this._root, -3);
            relativeType = 'minor';
        } else if (this._type === 'minor') {
            // Relative major is 3 semitones up from the root of the minor scale
            relativeRoot = Note.fromSemitones(this._root, 3);
            relativeType = 'major';
        } else {
            return null; // Only implemented for major/minor relations
        }

        return new Scale(relativeRoot, relativeType);
    }
}