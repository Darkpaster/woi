// composition/melodyGenerator.ts
import { Note, Scale } from '../theory/scales';
import { Chord } from '../theory/chords';
import { Rhythm, RhythmicValue, TimeSignature, NoteValue } from '../theory/rhythm';

export interface MelodyNote {
    note: Note;
    rhythmicValue: RhythmicValue;
    velocity: number; // 0-127, MIDI velocity
    isRest: boolean;
}

export class Melody {
    private _notes: MelodyNote[];
    private _name: string;
    private _key: Scale;
    private _rhythm: Rhythm;

    constructor(name: string, key: Scale, rhythm: Rhythm) {
        this._name = name;
        this._key = key;
        this._rhythm = rhythm;
        this._notes = [];
    }

    get notes(): MelodyNote[] {
        return [...this._notes];
    }

    get name(): string {
        return this._name;
    }

    get key(): Scale {
        return this._key;
    }

    get rhythm(): Rhythm {
        return this._rhythm;
    }

    /**
     * Add a note to the melody
     */
    addNote(note: MelodyNote): void {
        this._notes.push(note);
    }

    /**
     * Add multiple notes to the melody
     */
    addNotes(notes: MelodyNote[]): void {
        this._notes.push(...notes);
    }

    /**
     * Get the duration of the melody in seconds
     */
    getDurationInSeconds(): number {
        const quarterNoteDuration = 60 / this._rhythm.tempo;

        return this._notes.reduce((duration, melodyNote) => {
            return duration + melodyNote.rhythmicValue.getDurationInQuarterNotes() * quarterNoteDuration;
        }, 0);
    }

    /**
     * Transpose the melody by the given number of semitones
     */
    transpose(semitones: number): Melody {
        const newKey = new Scale(
            Note.fromSemitones(this._key.root, semitones),
            this._key.type
        );

        const newMelody = new Melody(this._name, newKey, this._rhythm);

        const transposedNotes = this._notes.map(melodyNote => {
            if (melodyNote.isRest) {
                return melodyNote;
            }

            return {
                note: Note.fromSemitones(melodyNote.note, semitones),
                rhythmicValue: melodyNote.rhythmicValue,
                velocity: melodyNote.velocity,
                isRest: false
            };
        });

        newMelody.addNotes(transposedNotes);
        return newMelody;
    }

    /**
     * Apply a chord to the melody, adjusting notes to fit the chord
     */
    applyChord(chord: Chord): Melody {
        const newMelody = new Melody(this._name, this._key, this._rhythm);

        const chordNotes = chord.notes;
        const chordPitchClasses = chordNotes.map(note => note.pitchClass);

        const adjustedNotes = this._notes.map(melodyNote => {
            if (melodyNote.isRest) {
                return melodyNote;
            }

            // Check if the note is already in the chord
            if (chordPitchClasses.includes(melodyNote.note.pitchClass)) {
                return melodyNote;
            }

            // Find the closest chord tone
            let closestNote = melodyNote.note;
            let smallestDistance = Number.MAX_VALUE;

            for (const chordNote of chordNotes) {
                // Create a note in the same octave as the melody note
                const chordNoteInOctave = new Note(chordNote.name, melodyNote.note.octave);

                const distance = Math.abs(chordNoteInOctave.midiNumber - melodyNote.note.midiNumber);

                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestNote = chordNoteInOctave;
                }
            }

            return {
                note: closestNote,
                rhythmicValue: melodyNote.rhythmicValue,
                velocity: melodyNote.velocity,
                isRest: false
            };
        });

        newMelody.addNotes(adjustedNotes);
        return newMelody;
    }
}

export class MelodyGenerator {
    /**
     * Generate a melody based on a scale and rhythm
     * @param scale The scale to use for the melody
     * @param rhythm The rhythm to use for the melody
     * @param contour A number between -1 and 1 indicating the overall contour (-1 = descending, 1 = ascending)
     * @param complexity A number between 0 and 1 indicating how complex the melody should be
     * @param minOctave The minimum octave for notes
     * @param maxOctave The maximum octave for notes
     */
    static generateMelody(
        name: string,
        scale: Scale,
        rhythm: Rhythm,
        contour: number = 0,
        complexity: number = 0.5,
        minOctave: number = 4,
        maxOctave: number = 5
    ): Melody {
        const melody = new Melody(name, scale, rhythm);

        // Get all available notes from the scale in the given octave range
        const availableNotes = scale.getNotesInOctaveRange(minOctave, maxOctave);

        // Extract the rhythmic values from the rhythm
        const rhythmicValues: RhythmicValue[] = [];
        rhythm.measures.forEach(measure => {
            rhythmicValues.push(...measure.rhythmicValues);
        });

        // Determine the shape of the melody based on contour
        let noteIndex = 0;
        if (contour < 0) {
            // Start from near the top
            noteIndex = Math.floor(availableNotes.length * 0.8);
        } else if (contour > 0) {
            // Start from near the bottom
            noteIndex = Math.floor(availableNotes.length * 0.2);
        } else {
            // Start from the middle
            noteIndex = Math.floor(availableNotes.length * 0.5);
        }

        // Add rests based on complexity (lower complexity = more rests)
        const restProbability = 0.1 + (1 - complexity) * 0.2;

        // Probability of skipping notes (higher complexity = more skips)
        const skipProbability = complexity * 0.6;

        // Probability of repeating the same note
        const repeatProbability = 0.2 - (complexity * 0.15);

        // Generate a melody note for each rhythmic value
        for (const rhythmicValue of rhythmicValues) {
            // Decide if this should be a rest
            const isRest = Math.random() < restProbability;

            if (isRest) {
                melody.addNote({
                    note: availableNotes[0], // Placeholder, will be ignored
                    rhythmicValue,
                    velocity: 0,
                    isRest: true
                });
                continue;
            }

            // Decide if we should repeat the previous note
            const shouldRepeat = melody.notes.length > 0 && Math.random() < repeatProbability;

            if (shouldRepeat && !melody.notes[melody.notes.length - 1].isRest) {
                const previousNote = melody.notes[melody.notes.length - 1];
                melody.addNote({
                    note: previousNote.note,
                    rhythmicValue,
                    velocity: 64 + Math.floor(Math.random() * 32), // Random velocity between 64-95
                    isRest: false
                });
                continue;
            }

            // Decide how far to move based on complexity and contour
            let step: number;

            if (Math.random() < skipProbability) {
                // Larger skip (3-4 steps)
                step = Math.floor(Math.random() * 2) + 3;
                if