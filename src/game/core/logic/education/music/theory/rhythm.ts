// theory/rhythm.ts
export enum NoteValue {
    WholeNote = 1,
    HalfNote = 2,
    QuarterNote = 4,
    EighthNote = 8,
    SixteenthNote = 16,
    ThirtySecondNote = 32
}

export enum TimeSignature {
    FOUR_FOUR = '4/4',
    THREE_FOUR = '3/4',
    SIX_EIGHT = '6/8',
    FIVE_FOUR = '5/4',
    SEVEN_EIGHT = '7/8',
    TWELVE_EIGHT = '12/8'
}

export class RhythmicValue {
    private _value: NoteValue;
    private _isDotted: boolean;
    private _isTriplet: boolean;

    constructor(value: NoteValue, isDotted: boolean = false, isTriplet: boolean = false) {
        this._value = value;
        this._isDotted = isDotted;
        this._isTriplet = isTriplet;
    }

    get value(): NoteValue {
        return this._value;
    }

    get isDotted(): boolean {
        return this._isDotted;
    }

    get isTriplet(): boolean {
        return this._isTriplet;
    }

    /**
     * Get the duration of this rhythmic value in terms of quarter notes
     * Examples:
     * - A quarter note = 1.0
     * - A half note = 2.0
     * - A dotted half note = 3.0
     * - An eighth note triplet = 0.33...
     */
    getDurationInQuarterNotes(): number {
        let duration = 4 / this._value; // Base duration

        if (this._isDotted) {
            duration *= 1.5; // Dotted notes are 1.5x longer
        }

        if (this._isTriplet) {
            duration *= 2/3; // Triplets are 2/3 of their normal duration
        }

        return duration;
    }

    /**
     * Get the duration in seconds based on the given tempo (BPM)
     * @param tempo Tempo in beats per minute
     * @returns Duration in seconds
     */
    getDurationInSeconds(tempo: number): number {
        const quarterNoteDuration = 60 / tempo; // Duration of a quarter note in seconds
        return this.getDurationInQuarterNotes() * quarterNoteDuration;
    }

    /**
     * Returns a string representation of the rhythmic value
     */
    toString(): string {
        const valueNames: { [key in NoteValue]: string } = {
            [NoteValue.WholeNote]: 'whole',
            [NoteValue.HalfNote]: 'half',
            [NoteValue.QuarterNote]: 'quarter',
            [NoteValue.EighthNote]: 'eighth',
            [NoteValue.SixteenthNote]: 'sixteenth',
            [NoteValue.ThirtySecondNote]: 'thirty-second'
        };

        let result = valueNames[this._value];

        if (this._isDotted) {
            result += ' dotted';
        }

        if (this._isTriplet) {
            result += ' triplet';
        }

        return result;
    }
}

export class Measure {
    private _timeSignature: TimeSignature;
    private _rhythmicValues: RhythmicValue[];

    constructor(timeSignature: TimeSignature) {
        this._timeSignature = timeSignature;
        this._rhythmicValues = [];
    }

    get timeSignature(): TimeSignature {
        return this._timeSignature;
    }

    get rhythmicValues(): RhythmicValue[] {
        return [...this._rhythmicValues];
    }

    /**
     * Add a rhythmic value to the measure
     * @returns true if successful, false if the measure would overflow
     */
    addRhythmicValue(value: RhythmicValue): boolean {
        // Check if adding this value would exceed the time signature
        const currentDuration = this.getTotalDuration();
        const newDuration = currentDuration + value.getDurationInQuarterNotes();

        if (newDuration > this.getMeasureDuration()) {
            return false; // Would overflow the measure
        }

        this._rhythmicValues.push(value);
        return true;
    }

    /**
     * Get the total duration of all rhythmic values in the measure
     * @returns Duration in quarter notes
     */
    getTotalDuration(): number {
        return this._rhythmicValues.reduce(
            (sum, value) => sum + value.getDurationInQuarterNotes(),
            0
        );
    }

    /**
     * Check if the measure is full according to its time signature
     */
    isFull(): boolean {
        return Math.abs(this.getTotalDuration() - this.getMeasureDuration()) < 0.001;
    }

    /**
     * Check if the measure has space for more rhythmic values
     */
    hasSpace(): boolean {
        return this.getTotalDuration() < this.getMeasureDuration();
    }

    /**
     * Get the maximum duration of the measure based on its time signature
     * @returns Duration in quarter notes
     */
    getMeasureDuration(): number {
        switch (this._timeSignature) {
            case TimeSignature.FOUR_FOUR: return 4;
            case TimeSignature.THREE_FOUR: return 3;
            case TimeSignature.SIX_EIGHT: return 3; // 6/8 is 6 eighth notes = 3 quarter notes
            case TimeSignature.FIVE_FOUR: return 5;
            case TimeSignature.SEVEN_EIGHT: return 3.5; // 7/8 is 7 eighth notes = 3.5 quarter notes
            case TimeSignature.TWELVE_EIGHT: return 6; // 12/8 is 12 eighth notes = 6 quarter notes
            default: throw new Error(`Unknown time signature: ${this._timeSignature}`);
        }
    }

    /**
     * Clear all rhythmic values from the measure
     */
    clear(): void {
        this._rhythmicValues = [];
    }
}

export class Rhythm {
    private _measures: Measure[];
    private _tempo: number; // in BPM

    constructor(tempo: number, timeSignature: TimeSignature = TimeSignature.FOUR_FOUR) {
        this._tempo = tempo;
        this._measures = [new Measure(timeSignature)];
    }

    get measures(): Measure[] {
        return [...this._measures];
    }

    get tempo(): number {
        return this._tempo;
    }

    set tempo(value: number) {
        if (value <= 0) {
            throw new Error("Tempo must be greater than 0");
        }
        this._tempo = value;
    }

    /**
     * Add a rhythmic value to the rhythm
     * Will automatically create new measures as needed
     */
    addRhythmicValue(value: RhythmicValue): void {
        let currentMeasure = this._measures[this._measures.length - 1];

        // Try to add to the current measure
        if (!currentMeasure.addRhythmicValue(value)) {
            // If it doesn't fit, create a new measure and try again
            currentMeasure = new Measure(currentMeasure.timeSignature);
            this._measures.push(currentMeasure);

            // It still might not fit if the value is larger than a measure
            if (!currentMeasure.addRhythmicValue(value)) {
                throw new Error("Rhythmic value too large for measure");
            }
        }
    }

    /**
     * Add multiple rhythmic values to the rhythm
     */
    addRhythmicValues(values: RhythmicValue[]): void {
        values.forEach(value => this.addRhythmicValue(value));
    }

    /**
     * Get the total duration of the rhythm in seconds
     */
    getTotalDurationInSeconds(): number {
        const quarterNoteDuration = 60 / this._tempo;
        const totalQuarterNotes = this._measures.reduce(
            (sum, measure) => sum + measure.getTotalDuration(),
            0
        );

        return totalQuarterNotes * quarterNoteDuration;
    }

    /**
     * Get the total number of quarter notes in the rhythm
     */
    getTotalQuarterNotes(): number {
        return this._measures.reduce(
            (sum, measure) => sum + measure.getTotalDuration(),
            0
        );
    }

    /**
     * Generate a random rhythm with the given constraints
     * @param numMeasures Number of measures to generate
     * @param complexity How complex the rhythm should be (0-1)
     * @param timeSignature Time signature to use
     */
    static generateRandomRhythm(
        numMeasures: number,
        tempo: number,
        complexity: number = 0.5,
        timeSignature: TimeSignature = TimeSignature.FOUR_FOUR
    ): Rhythm {
        const rhythm = new Rhythm(tempo, timeSignature);

        // Define possible note values based on complexity
        let possibleValues: NoteValue[] = [
            NoteValue.QuarterNote,
            NoteValue.HalfNote
        ];

        if (complexity > 0.3) {
            possibleValues.push(NoteValue.EighthNote);
        }

        if (complexity > 0.6) {
            possibleValues.push(NoteValue.SixteenthNote);
        }

        if (complexity > 0.8) {
            possibleValues.push(NoteValue.ThirtySecondNote);
        }

        // The probability of dotted notes and triplets increases with complexity
        const dottedProbability = complexity * 0.3;
        const tripletProbability = complexity * 0.3;

        // Fill each measure
        for (let i = 0; i < numMeasures; i++) {
            const measure = new Measure(timeSignature);

            // Keep adding notes until the measure is full
            while (measure.hasSpace()) {
                // Randomly select a note value
                const valueIndex = Math.floor(Math.random() * possibleValues.length);
                const value = possibleValues[valueIndex];

                // Decide if it should be dotted or a triplet
                const isDotted = Math.random() < dottedProbability;
                const isTriplet = !isDotted && Math.random() < tripletProbability; // Can't be both dotted and triplet

                const rhythmicValue = new RhythmicValue(value, isDotted, isTriplet);

                // If it fits, add it to the measure
                if (measure.addRhythmicValue(rhythmicValue)) {
                    // Added successfully
                } else {
                    // Try with smaller values
                    const smallerValues = possibleValues.filter(v => v > value);
                    if (smallerValues.length > 0) {
                        const smallerValue = smallerValues[0];
                        const smallerRhythmicValue = new RhythmicValue(smallerValue);
                        if (measure.addRhythmicValue(smallerRhythmicValue)) {
                            // Added successfully
                        } else {
                            // Give up on this measure
                            break;
                        }
                    } else {
                        // No smaller values available, give up on this measure
                        break;
                    }
                }
            }

            // Add the filled measure to the rhythm
            rhythm.addRhythmicValues(measure.rhythmicValues);
        }

        return rhythm;
    }
}

/**
 * A polyrhythm represents two or more rhythms played simultaneously with different divisions
 */
export class Polyrhythm {
    private _rhythms: Rhythm[];
    private _tempo: number;

    constructor(tempo: number) {
        this._tempo = tempo;
        this._rhythms = [];
    }

    get rhythms(): Rhythm[] {
        return [...this._rhythms];
    }

    get tempo(): number {
        return this._tempo;
    }

    /**
     * Add a rhythm to the polyrhythm
     */
    addRhythm(rhythm: Rhythm): void {
        // Adjust the tempo of the added rhythm to match
        rhythm.tempo = this._tempo;
        this._rhythms.push(rhythm);
    }

    /**
     * Create a traditional polyrhythm with the given ratio
     * @param tempo The tempo in BPM
     * @param ratio The polyrhythm ratio (e.g., [3, 4] for 3:4)
     * @param measures How many measures to create
     */
    static createRatioPolyrhythm(tempo: number, ratio: [number, number], measures: number = 1): Polyrhythm {
        const polyrhythm = new Polyrhythm(tempo);

        // Create the first rhythm
        const rhythm1 = new Rhythm(tempo);
        for (let i = 0; i < measures; i++) {
            for (let j = 0; j < ratio[0]; j++) {
                rhythm1.addRhythmicValue(new RhythmicValue(NoteValue.QuarterNote));
            }
        }

        // Create the second rhythm
        const rhythm2 = new Rhythm(tempo);
        for (let i = 0; i < measures; i++) {
            for (let j = 0; j < ratio[1]; j++) {
                rhythm2.addRhythmicValue(new RhythmicValue(NoteValue.QuarterNote));
            }
        }

        polyrhythm.addRhythm(rhythm1);
        polyrhythm.addRhythm(rhythm2);

        return polyrhythm;
    }
}