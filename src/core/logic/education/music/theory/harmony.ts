// theory/harmony.ts
import { Note } from './scales';
import { Chord, ChordType } from './chords';

export enum DiatonicFunction {
    Tonic = 'tonic',
    Supertonic = 'supertonic',
    Mediant = 'mediant',
    Subdominant = 'subdominant',
    Dominant = 'dominant',
    Submediant = 'submediant',
    LeadingTone = 'leadingTone'
}

export class ChordProgression {
    private _chords: Chord[];
    private _keyCenter: Note;

    constructor(keyCenter: Note, chords: Chord[] = []) {
        this._keyCenter = keyCenter;
        this._chords = [...chords];
    }

    get chords(): Chord[] {
        return [...this._chords];
    }

    get keyCenter(): Note {
        return this._keyCenter;
    }

    /**
     * Add a chord to the progression
     */
    addChord(chord: Chord): void {
        this._chords.push(chord);
    }

    /**
     * Get the chord at the specified index
     */
    getChordAt(index: number): Chord | null {
        if (index < 0 || index >= this._chords.length) {
            return null;
        }
        return this._chords[index];
    }

    /**
     * Replace a chord at the specified index
     */
    replaceChord(index: number, newChord: Chord): boolean {
        if (index < 0 || index >= this._chords.length) {
            return false;
        }
        this._chords[index] = newChord;
        return true;
    }

    /**
     * Remove a chord at the specified index
     */
    removeChord(index: number): boolean {
        if (index < 0 || index >= this._chords.length) {
            return false;
        }
        this._chords.splice(index, 1);
        return true;
    }

    /**
     * Transpose the entire chord progression
     */
    transpose(semitones: number): ChordProgression {
        const newKeyCenter = Note.fromSemitones(this._keyCenter, semitones);
        const newChords = this._chords.map(chord => {
            const newRoot = Note.fromSemitones(chord.root, semitones);
            return new Chord(newRoot, chord.type);
        });

        return new ChordProgression(newKeyCenter, newChords);
    }

    /**
     * Returns a string representation of the chord progression
     */
    toString(): string {
        return this._chords.map(chord => chord.toString()).join(' - ');
    }

    /**
     * Create a chord progression from Roman numeral notation
     * @param keyCenter The key center
     * @param numerals Array of Roman numeral strings (e.g., ['I', 'IV', 'V', 'I'])
     */
    static fromRomanNumerals(keyCenter: Note, numerals: string[]): ChordProgression {
        const progression = new ChordProgression(keyCenter);
        const majorScale = [0, 2, 4, 5, 7, 9, 11]; // Semitones from the root for a major scale

        for (const numeral of numerals) {
            // Parse the Roman numeral
            let degreeNum: number;
            let chordType: ChordType;

            // This is a simplified implementation
            // A full implementation would handle more complex numerals (e.g., "V7", "ii°", etc.)
            if (numeral === 'I') {
                degreeNum = 1;
                chordType = ChordType.Major;
            } else if (numeral === 'ii') {
                degreeNum = 2;
                chordType = ChordType.Minor;
            } else if (numeral === 'iii') {
                degreeNum = 3;
                chordType = ChordType.Minor;
            } else if (numeral === 'IV') {
                degreeNum = 4;
                chordType = ChordType.Major;
            } else if (numeral === 'V') {
                degreeNum = 5;
                chordType = ChordType.Major;
            } else if (numeral === 'vi') {
                degreeNum = 6;
                chordType = ChordType.Minor;
            } else if (numeral === 'vii°') {
                degreeNum = 7;
                chordType = ChordType.Diminished;
            } else {
                throw new Error(`Unsupported Roman numeral: ${numeral}`);
            }

            // Calculate the root note based on the degree
            const interval = majorScale[degreeNum - 1];
            const rootNote = Note.fromSemitones(keyCenter, interval);

            // Create the chord and add it to the progression
            const chord = new Chord(rootNote, chordType);
            progression.addChord(chord);
        }

        return progression;
    }

    /**
     * Create common chord progressions based on patterns
     */
    static createCommonProgression(keyCenter: Note, type: string): ChordProgression {
        const progression = new ChordProgression(keyCenter);

        switch (type.toLowerCase()) {
            case 'i-iv-v': // Classic progression
                progression.addChord(new Chord(keyCenter, ChordType.Major)); // I
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 5), ChordType.Major)); // IV
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major)); // V
                progression.addChord(new Chord(keyCenter, ChordType.Major)); // I
                break;

            case 'i-v-vi-iv': // Pop progression
                progression.addChord(new Chord(keyCenter, ChordType.Major)); // I
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major)); // V
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 9), ChordType.Minor)); // vi
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 5), ChordType.Major)); // IV
                break;

            case 'ii-v-i': // Jazz progression
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 2), ChordType.Minor)); // ii
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Dominant7)); // V7
                progression.addChord(new Chord(keyCenter, ChordType.Major7)); // Imaj7
                break;

            case 'i-vi-iv-v': // 50s progression
                progression.addChord(new Chord(keyCenter, ChordType.Major)); // I
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 9), ChordType.Minor)); // vi
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 5), ChordType.Major)); // IV
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major)); // V
                break;

            case 'vi-iv-i-v': // Andalusian cadence
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 9), ChordType.Minor)); // vi
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 5), ChordType.Major)); // IV
                progression.addChord(new Chord(keyCenter, ChordType.Major)); // I
                progression.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major)); // V
                break;

            default:
                throw new Error(`Unknown progression type: ${type}`);
        }

        return progression;
    }
}

export class Cadence {
    static readonly AUTHENTIC_PERFECT = 'authentic_perfect';
    static readonly AUTHENTIC_IMPERFECT = 'authentic_imperfect';
    static readonly PLAGAL = 'plagal';
    static readonly HALF = 'half';
    static readonly DECEPTIVE = 'deceptive';

    /**
     * Creates a cadence of the specified type
     * @param keyCenter The key center
     * @param type The type of cadence
     * @returns A chord progression representing the cadence
     */
    static createCadence(keyCenter: Note, type: string): ChordProgression {
        const cadence = new ChordProgression(keyCenter);

        switch (type) {
            case Cadence.AUTHENTIC_PERFECT:
                // V-I with root position and soprano on tonic
                cadence.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major)); // V
                cadence.addChord(new Chord(keyCenter, ChordType.Major)); // I
                break;

            case Cadence.AUTHENTIC_IMPERFECT:
                // V-I but not in root position or soprano not on tonic
                const dominantChord = new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major);
                cadence.addChord(dominantChord.invert(1)); // V in first inversion
                cadence.addChord(new Chord(keyCenter, ChordType.Major)); // I
                break;

            case Cadence.PLAGAL:
                // IV-I, the "Amen" cadence
                cadence.addChord(new Chord(Note.fromSemitones(keyCenter, 5), ChordType.Major)); // IV
                cadence.addChord(new Chord(keyCenter, ChordType.Major)); // I
                break;

            case Cadence.HALF:
                // X-V, often I-V or ii-V
                cadence.addChord(new Chord(keyCenter, ChordType.Major)); // I
                cadence.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major)); // V
                break;

            case Cadence.DECEPTIVE:
                // V-vi, the "deceptive" cadence
                cadence.addChord(new Chord(Note.fromSemitones(keyCenter, 7), ChordType.Major)); // V
                cadence.addChord(new Chord(Note.fromSemitones(keyCenter, 9), ChordType.Minor)); // vi
                break;

            default:
                throw new Error(`Unknown cadence type: ${type}`);
        }

        return cadence;
    }
}

export class VoiceLeading {
    /**
     * Analyze the voice leading between two chords
     * @param from Starting chord
     * @param to Ending chord
     * @returns Object containing analysis of voice movement
     */
    static analyzeMovement(from: Chord, to: Chord): {
        parallelFifths: boolean;
        parallelOctaves: boolean;
        voiceMovements: { interval: number; direction: 'up' | 'down' | 'same' }[];
    } {
        const fromNotes = from.notes;
        const toNotes = to.notes;

        // Ensure both chords have the same number of voices for analysis
        const minVoices = Math.min(fromNotes.length, toNotes.length);

        const voiceMovements = [];
        let parallelFifths = false;
        let parallelOctaves = false;

        // Track intervals between adjacent voices
        const fromIntervals: number[] = [];
        const toIntervals: number[] = [];

        // Calculate intervals
        for (let i = 0; i < minVoices - 1; i++) {
            fromIntervals.push(Math.abs(fromNotes[i].midiNumber - fromNotes[i + 1].midiNumber) % 12);
            toIntervals.push(Math.abs(toNotes[i].midiNumber - toNotes[i + 1].midiNumber) % 12);
        }

        // Check for parallel fifths and octaves
        for (let i = 0; i < fromIntervals.length; i++) {
            if (fromIntervals[i] === 7 && toIntervals[i] === 7) {
                parallelFifths = true;
            }

            if (fromIntervals[i] === 0 && toIntervals[i] === 0) {
                parallelOctaves = true;
            }
        }

        // Calculate interval and direction for each voice
        for (let i = 0; i < minVoices; i++) {
            const interval = Math.abs(toNotes[i].midiNumber - fromNotes[i].midiNumber);
            let direction: 'up' | 'down' | 'same';

            if (toNotes[i].midiNumber > fromNotes[i].midiNumber) {
                direction = 'up';
            } else if (toNotes[i].midiNumber < fromNotes[i].midiNumber) {
                direction = 'down';
            } else {
                direction = 'same';
            }

            voiceMovements.push({ interval, direction });
        }

        return {
            parallelFifths,
            parallelOctaves,
            voiceMovements
        };
    }

    /**
     * Create smooth voice leading between two chords
     * @param from Starting chord
     * @param to Ending chord
     * @returns Array of notes for the destination chord with optimized voice leading
     */
    static createSmoothVoiceLeading(from: Chord, to: Chord): Note[] {
        const fromNotes = from.notes;
        const toNoteOptions = to.getNotesInOctaveRange(3, 5); // Get a range of notes to choose from

        // For each note in the source chord, find the closest matching note in the target chord
        const result: Note[] = [];

        for (const fromNote of fromNotes) {
            let bestNote: Note | null = null;
            let smallestInterval = Infinity;

            for (const toNote of toNoteOptions) {
                // Check if this note is already used in our result
                if (result.some(n => n.midiNumber === toNote.midiNumber)) {
                    continue;
                }

                // Check if the note belongs to the target chord's pitch classes
                if (!to.notes.some(n => n.pitchClass === toNote.pitchClass)) {
                    continue;
                }

                const interval = Math.abs(toNote.midiNumber - fromNote.midiNumber);

                if (interval < smallestInterval) {
                    smallestInterval = interval;
                    bestNote = toNote;
                }
            }

            if (bestNote) {
                result.push(bestNote);
            }
        }

        // If we couldn't find enough notes, add missing chord tones
        const requiredPitchClasses = to.notes.map(n => n.pitchClass);
        const resultPitchClasses = result.map(n => n.pitchClass);

        for (const pitchClass of requiredPitchClasses) {
            if (!resultPitchClasses.includes(pitchClass)) {
                // Find a note with this pitch class that's not already used
                const note = toNoteOptions.find(n => n.pitchClass === pitchClass &&
                    !result.some(r => r.midiNumber === n.midiNumber));
                if (note) {
                    result.push(note);
                }
            }
        }

        return result;
    }
}