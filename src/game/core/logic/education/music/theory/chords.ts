// theory/chords.ts
import { Note, Scale } from './scales.ts';

export enum ChordType {
    Major = 'major',
    Minor = 'minor',
    Diminished = 'diminished',
    Augmented = 'augmented',
    Major7 = 'major7',
    Dominant7 = 'dominant7',
    Minor7 = 'minor7',
    HalfDiminished = 'halfDiminished',
    Diminished7 = 'diminished7',
    Sus2 = 'sus2',
    Sus4 = 'sus4',
    Add9 = 'add9',
}

export class Chord {
    private _root: Note;
    private _type: ChordType;
    private _notes: Note[];
    private _inversion: number = 0;

    constructor(root: Note, type: ChordType) {
        this._root = root;
        this._type = type;
        this._notes = this.buildChord();
    }

    get root(): Note {
        return this._root;
    }

    get type(): ChordType {
        return this._type;
    }

    get notes(): Note[] {
        return [...this._notes];
    }

    get inversion(): number {
        return this._inversion;
    }

    private buildChord(): Note[] {
        const notes: Note[] = [this._root];

        switch (this._type) {
            case ChordType.Major:
                notes.push(Note.fromSemitones(this._root, 4)); // Major 3rd
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                break;
            case ChordType.Minor:
                notes.push(Note.fromSemitones(this._root, 3)); // Minor 3rd
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                break;
            case ChordType.Diminished:
                notes.push(Note.fromSemitones(this._root, 3)); // Minor 3rd
                notes.push(Note.fromSemitones(this._root, 6)); // Diminished 5th
                break;
            case ChordType.Augmented:
                notes.push(Note.fromSemitones(this._root, 4)); // Major 3rd
                notes.push(Note.fromSemitones(this._root, 8)); // Augmented 5th
                break;
            case ChordType.Major7:
                notes.push(Note.fromSemitones(this._root, 4)); // Major 3rd
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                notes.push(Note.fromSemitones(this._root, 11)); // Major 7th
                break;
            case ChordType.Dominant7:
                notes.push(Note.fromSemitones(this._root, 4)); // Major 3rd
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                notes.push(Note.fromSemitones(this._root, 10)); // Minor 7th
                break;
            case ChordType.Minor7:
                notes.push(Note.fromSemitones(this._root, 3)); // Minor 3rd
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                notes.push(Note.fromSemitones(this._root, 10)); // Minor 7th
                break;
            case ChordType.HalfDiminished:
                notes.push(Note.fromSemitones(this._root, 3)); // Minor 3rd
                notes.push(Note.fromSemitones(this._root, 6)); // Diminished 5th
                notes.push(Note.fromSemitones(this._root, 10)); // Minor 7th
                break;
            case ChordType.Diminished7:
                notes.push(Note.fromSemitones(this._root, 3)); // Minor 3rd
                notes.push(Note.fromSemitones(this._root, 6)); // Diminished 5th
                notes.push(Note.fromSemitones(this._root, 9)); // Diminished 7th
                break;
            case ChordType.Sus2:
                notes.push(Note.fromSemitones(this._root, 2)); // Major 2nd
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                break;
            case ChordType.Sus4:
                notes.push(Note.fromSemitones(this._root, 5)); // Perfect 4th
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                break;
            case ChordType.Add9:
                notes.push(Note.fromSemitones(this._root, 4)); // Major 3rd
                notes.push(Note.fromSemitones(this._root, 7)); // Perfect 5th
                notes.push(Note.fromSemitones(this._root, 14)); // 9th
                break;
        }

        return notes;
    }

    /**
     * Creates an inversion of the chord
     * @param inversionNumber The number of the inversion (0 = root position, 1 = first inversion, etc.)
     * @returns A new Chord object with the specified inversion
     */
    invert(inversionNumber: number): Chord {
        if (inversionNumber < 0 || inversionNumber >= this._notes.length) {
            throw new Error(`Invalid inversion number. Must be between 0 and ${this._notes.length - 1}`);
        }

        const newChord = new Chord(this._root, this._type);
        newChord._inversion = inversionNumber;

        // Create the inversion by moving notes from the bottom to the top
        let invertedNotes = [...this._notes];
        for (let i = 0; i < inversionNumber; i++) {
            const note = invertedNotes.shift()!;
            invertedNotes.push(Note.fromSemitones(note, 12)); // Move an octave higher
        }

        newChord._notes = invertedNotes;
        return newChord;
    }

    /**
     * Checks if the given notes form this chord
     * @param notes Array of notes to check
     * @returns True if the notes form this chord, false otherwise
     */
    matches(notes: Note[]): boolean {
        if (notes.length !== this._notes.length) {
            return false;
        }

        // Convert all notes to their pitch class (0-11) for comparison
        const thisNoteClasses = this._notes.map(n => n.pitchClass);
        const otherNoteClasses = notes.map(n => n.pitchClass);

        // Sort both arrays to ensure we can compare them regardless of order
        thisNoteClasses.sort();
        otherNoteClasses.sort();

        // Compare each note class
        for (let i = 0; i < thisNoteClasses.length; i++) {
            if (thisNoteClasses[i] !== otherNoteClasses[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Return a string representation of the chord
     */
    toString(): string {
        let result = this._root.toString();

        switch (this._type) {
            case ChordType.Major:
                // Major triads typically don't have a suffix
                break;
            case ChordType.Minor:
                result += 'm';
                break;
            case ChordType.Diminished:
                result += 'dim';
                break;
            case ChordType.Augmented:
                result += 'aug';
                break;
            case ChordType.Major7:
                result += 'maj7';
                break;
            case ChordType.Dominant7:
                result += '7';
                break;
            case ChordType.Minor7:
                result += 'm7';
                break;
            case ChordType.HalfDiminished:
                result += 'm7b5';
                break;
            case ChordType.Diminished7:
                result += 'dim7';
                break;
            case ChordType.Sus2:
                result += 'sus2';
                break;
            case ChordType.Sus4:
                result += 'sus4';
                break;
            case ChordType.Add9:
                result += 'add9';
                break;
        }

        if (this._inversion > 0) {
            result += `/${this._notes[0].toString()}`;
        }

        return result;
    }

    /**
     * Gets the notes of the chord within a specific octave range
     * @param minOctave The minimum octave
     * @param maxOctave The maximum octave
     * @returns Array of notes within the octave range
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
     * Factory method to create a chord from a given scale degree
     */
    static fromScaleDegree(scale: Scale, degree: number, chordType?: ChordType): Chord {
        if (degree < 1 || degree > scale.notes.length) {
            throw new Error(`Invalid scale degree. Must be between 1 and ${scale.notes.length}`);
        }

        const root = scale.notes[degree - 1];

        // If chord type is not specified, determine it based on the scale and degree
        if (!chordType) {
            // This is a simplified version. In a real implementation, you'd analyze the scale
            // to determine the chord quality based on the scale degrees
            const scaleType = scale.type;

            if (scaleType === 'major') {
                // In major scales: I, IV, V are major; ii, iii, vi are minor; vii° is diminished
                switch (degree) {
                    case 1: case 4: case 5: return new Chord(root, ChordType.Major);
                    case 2: case 3: case 6: return new Chord(root, ChordType.Minor);
                    case 7: return new Chord(root, ChordType.Diminished);
                    default: return new Chord(root, ChordType.Major);
                }
            } else if (scaleType === 'minor') {
                // In natural minor: i, iv, v are minor; III, VI, VII are major; ii° is diminished
                switch (degree) {
                    case 1: case 4: case 5: return new Chord(root, ChordType.Minor);
                    case 3: case 6: case 7: return new Chord(root, ChordType.Major);
                    case 2: return new Chord(root, ChordType.Diminished);
                    default: return new Chord(root, ChordType.Minor);
                }
            }

            // Default to major if we can't determine
            return new Chord(root, ChordType.Major);
        }

        return new Chord(root, chordType);
    }
}