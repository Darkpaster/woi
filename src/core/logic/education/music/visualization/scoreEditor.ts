import {DEFAULT_MUSIC_STAFF_OPTIONS, MusicNotation, MusicStaffOptions, Note} from "./musicNotation.ts";

export interface ScoreEditorOptions extends MusicStaffOptions {
    editable: boolean;
    snapToGrid: boolean;
    gridResolution: number; // in beats (e.g., 0.25 for sixteenth notes)
    showPlayhead: boolean;
    allowKeySignatureChange: boolean;
    allowTimeSignatureChange: boolean;
    allowClefChange: boolean;
    allowTempoChange: boolean;
    undoStackSize: number;
}

export const DEFAULT_SCORE_EDITOR_OPTIONS: ScoreEditorOptions = {
    ...DEFAULT_MUSIC_STAFF_OPTIONS,
    editable: true,
    snapToGrid: true,
    gridResolution: 0.25,
    showPlayhead: true,
    allowKeySignatureChange: true,
    allowTimeSignatureChange: true,
    allowClefChange: true,
    allowTempoChange: true,
    undoStackSize: 50
};

export class ScoreEditor extends MusicNotation {
    private options: ScoreEditorOptions;
    private selectedNoteIndex: number | null = null;
    private dragStartX: number | null = null;
    private dragStartY: number | null = null;
    private undoStack: Array<Array<Note>> = [];
    private redoStack: Array<Array<Note>> = [];
    private isPlaying: boolean = false;
    private playbackStartTime: number | null = null;

    constructor(canvas: string, options: Partial<ScoreEditorOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_SCORE_EDITOR_OPTIONS, ...options };
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.canvas || !this.options.editable) return;

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private handleMouseDown(event: MouseEvent): void {
        if (!this.options.editable) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Save for potential drag operation
        this.dragStartX = x;
        this.dragStartY = y;

        // Check if we're clicking on a note
        this.selectedNoteIndex = this.getNoteAtPosition(x, y);

        // Force redraw
        this.render();
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.options.editable || this.selectedNoteIndex === null || this.dragStartX === null) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const deltaX = x - this.dragStartX;
        const deltaY = y - this.dragStartY;

        // Save current state for undo if this is the first move
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            if (this.dragStartX === x && this.dragStartY === y) {
                this.saveToUndoStack();
            }

            // Move the note
            this.moveSelectedNote(deltaX, deltaY);

            // Update drag start position
            this.dragStartX = x;
            this.dragStartY = y;

            // Force redraw
            this.render();
        }
    }

    private handleMouseUp(): void {
        // Reset drag state
        this.dragStartX = null;
        this.dragStartY = null;
    }

    private handleDoubleClick(event: MouseEvent): void {
        if (!this.options.editable) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if we double-clicked on a note
        const noteIndex = this.getNoteAtPosition(x, y);

        if (noteIndex !== null) {
            // Edit existing note
            this.selectedNoteIndex = noteIndex;
            this.editSelectedNote();
        } else {
            // Create new note at position
            this.saveToUndoStack();
            this.createNoteAtPosition(x, y);
        }

        // Force redraw
        this.render();
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.options.editable) return;

        // Handle keyboard shortcuts
        if (event.key === 'Delete' && this.selectedNoteIndex !== null) {
            // Delete selected note
            this.saveToUndoStack();
            this.options.notes.splice(this.selectedNoteIndex, 1);
            this.selectedNoteIndex = null;
            this.render();
        } else if (event.ctrlKey || event.metaKey) {
            if (event.key === 'z') {
                // Undo
                if (!event.shiftKey) {
                    this.undo();
                } else {
                    // Redo (Shift+Ctrl+Z)
                    this.redo();
                }
            } else if (event.key === 'y') {
                // Redo
                this.redo();
            } else if (event.key === 'c' && this.selectedNoteIndex !== null) {
                // Copy
                this.copySelectedNote();
            } else if (event.key === 'v') {
                // Paste
                this.pasteNote();
            }
        }
    }

    private getNoteAtPosition(x: number, y: number): number | null {
        const { notes, lineSpacing, measureWidth, timeSignature } = this.options;
        const staffY = this.canvas.height / 2 - lineSpacing * 2;
        const beatsPerMeasure = timeSignature.numerator;
        const startX = -this.scrollPosition;

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const measure = Math.floor(note.startTime / beatsPerMeasure);
            const beatInMeasure = note.startTime % beatsPerMeasure;
            const noteX = startX + measure * measureWidth + (measureWidth / beatsPerMeasure) * beatInMeasure;

            // Get pitch position
            const pitch = note.pitch;
            const pitchBase = pitch.slice(0, -1);
            const octave = parseInt(pitch.slice(-1));
            const pitchKey = `${pitchBase}${octave}`;

            // Get position on staff
            let position = this.pitchMap.get(pitchKey) || 0;

            // Calculate Y position on staff
            const basePosition = 14; // E4 in treble clef
            const noteY = staffY + (4 - (position - basePosition) / 2) * lineSpacing;

            // Check if click is within note boundaries
            const noteRadius = lineSpacing;
            if (
                Math.abs(x - noteX) < noteRadius &&
                Math.abs(y - noteY) < noteRadius
            ) {
                return i;
            }
        }

        return null;
    }

    private moveSelectedNote(deltaX: number, deltaY: number): void {
        if (this.selectedNoteIndex === null) return;

        const note = this.options.notes[this.selectedNoteIndex];
        const { measureWidth, timeSignature, lineSpacing } = this.options;
        const beatsPerMeasure = timeSignature.numerator;

        // Update position horizontally (time)
        if (Math.abs(deltaX) > 0) {
            const timeChange = (deltaX / measureWidth) * beatsPerMeasure;

            // Snap to grid if enabled
            if (this.options.snapToGrid) {
                const resolution = this.options.gridResolution;
                const snappedTime = Math.round((note.startTime + timeChange) / resolution) * resolution;
                note.startTime = Math.max(0, snappedTime);
            } else {
                note.startTime = Math.max(0, note.startTime + timeChange);
            }
        }

        // Update position vertically (pitch)
        if (Math.abs(deltaY) > 0) {
            // Convert deltaY to pitch change
            // Each semitone is half a lineSpacing
            const pitchChange = Math.round(-deltaY / (lineSpacing / 2));

            if (pitchChange !== 0) {
                // Parse current pitch
                const pitchClass = note.pitch.replace(/[0-9]/g, '');
                const octave = parseInt(note.pitch.match(/[0-9]+/)[0]);

                // Get new pitch
                const pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                let pitchIndex = pitchClasses.indexOf(pitchClass);

                if (pitchIndex !== -1) {
                    // Calculate new pitch index with octave changes
                    let totalSemitones = octave * 12 + pitchIndex + pitchChange;
                    let newOctave = Math.floor(totalSemitones / 12);
                    let newPitchIndex = totalSemitones % 12;
                    if (newPitchIndex < 0) {
                        newPitchIndex += 12;
                        newOctave--;
                    }

                    // Limit to reasonable range (C2 to C7)
                    newOctave = Math.max(2, Math.min(7, newOctave));

                    // Update note pitch
                    note.pitch = pitchClasses[newPitchIndex] + newOctave;

                    // Update accidental
                    if (note.pitch.includes('#')) {
                        note.accidental = 'sharp';
                    } else if (note.pitch.includes('b')) {
                        note.accidental = 'flat';
                    } else {
                        note.accidental = 'natural';
                    }
                }
            }
        }

        // Re-sort notes by start time
        this.options.notes.sort((a, b) => a.startTime - b.startTime);

        // Update selected note index after sorting
        this.selectedNoteIndex = this.options.notes.indexOf(note);
    }

    private createNoteAtPosition(x: number, y: number): void {
        const { measureWidth, timeSignature, lineSpacing } = this.options;
        const beatsPerMeasure = timeSignature.numerator;
        const staffY = this.canvas.height / 2 - lineSpacing * 2;
        const startX = -this.scrollPosition;

        // Calculate time (x position)
        const measureIndex = Math.floor((x - startX) / measureWidth);
        const beatInMeasure = ((x - startX) % measureWidth) / measureWidth * beatsPerMeasure;

        let startTime = measureIndex * beatsPerMeasure + beatInMeasure;

        // Snap to grid if enabled
        if (this.options.snapToGrid) {
            const resolution = this.options.gridResolution;
            startTime = Math.round(startTime / resolution) * resolution;
        }

        // Calculate pitch (y position)
        // In treble clef: E4 (position 14) is the first line from bottom
        const basePosition = 14;
        const deltaPosition = Math.round((staffY + 2 * lineSpacing - y) / (lineSpacing / 2));
        const position = basePosition + deltaPosition;

        // Convert position to pitch
        const pitchClasses = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const octave = Math.floor(position / 7) + 2;
        const pitchIndex = position % 7;
        const pitch = pitchClasses[pitchIndex] + octave;

        // Create new note
        const newNote: Note = {
            pitch,
            duration: 1, // Quarter note by default
            startTime,
            velocity: 80,
            accidental: null
        };

        // Add to notes array
        this.options.notes.push(newNote);

        // Sort notes by start time
        this.options.notes.sort((a, b) => a.startTime - b.startTime);

        // Select the new note
        this.selectedNoteIndex = this.options.notes.indexOf(newNote);
    }

    private editSelectedNote(): void {
        // This could open a dialog or form to edit note properties
        // For simplicity, we'll just toggle the duration
        if (this.selectedNoteIndex === null) return;

        const note = this.options.notes[this.selectedNoteIndex];
        const durations = [0.25, 0.5, 1, 2, 4]; // 16th, 8th, quarter, half, whole

        // Find current duration index
        let currentIndex = durations.indexOf(note.duration);
        if (currentIndex === -1) {
            currentIndex = 2; // Default to quarter note
        }

        // Move to next duration
        currentIndex = (currentIndex + 1) % durations.length;
        note.duration = durations[currentIndex];
    }

    private saveToUndoStack(): void {
        // Save current state to undo stack
        this.undoStack.push(JSON.parse(JSON.stringify(this.options.notes)));

        // Limit stack size
        if (this.undoStack.length > this.options.undoStackSize) {
            this.undoStack.shift();
        }

        // Clear redo stack
        this.redoStack = [];
    }

    private undo(): void {
        if (this.undoStack.length === 0) return;

        // Save current state to redo stack
        this.redoStack.push(JSON.parse(JSON.stringify(this.options.notes)));

        // Restore previous state
        this.options.notes = this.undoStack.pop();
        this.selectedNoteIndex = null;

        // Force redraw
        this.render();
    }

    private redo(): void {
        if (this.redoStack.length === 0) return;

        // Save current state to undo stack
        this.undoStack.push(JSON.parse(JSON.stringify(this.options.notes)));

        // Restore next state
        this.options.notes = this.redoStack.pop();
        this.selectedNoteIndex = null;

        // Force redraw
        this.render();
    }

    private copySelectedNote(): void {
        if (this.selectedNoteIndex === null) return;

        // Store in localStorage for simplicity
        localStorage.setItem('scoreEditorClipboard', JSON.stringify(this.options.notes[this.selectedNoteIndex]));
    }

    private pasteNote(): void {
        const clipboard = localStorage.getItem('scoreEditorClipboard');
        if (!clipboard) return;

        try {
            const note: Note = JSON.parse(clipboard);

            // Save current state for undo
            this.saveToUndoStack();

            // Create a copy of the note at the current cursor position
            const newNote = { ...note };

            // Adjust position if there's a selected note
            if (this.selectedNoteIndex !== null) {
                newNote.startTime = this.options.notes[this.selectedNoteIndex].startTime + 1;
            }

            // Add to notes array
            this.options.notes.push(newNote);

            // Sort notes by start time
            this.options.notes.sort((a, b) => a.startTime - b.startTime);

            // Select the new note
            this.selectedNoteIndex = this.options.notes.indexOf(newNote);

            // Force redraw
            this.render();
        } catch (error) {
            console.error('Failed to paste note:', error);
        }
    }

    public startPlayback(): void {
        this.isPlaying = true;
        this.playbackStartTime = performance.now();
        this.setCurrentBeat(0);
        this.playbackLoop();
    }

    public stopPlayback(): void {
        this.isPlaying = false;
        this.playbackStartTime = null;
    }

    private playbackLoop(): void {
        if (!this.isPlaying || this.playbackStartTime === null) return;

        const elapsed = (performance.now() - this.playbackStartTime) / 1000; // seconds
        const { tempo } = this.options;
        const beatsPerSecond = tempo / 60;
        const currentBeat = elapsed * beatsPerSecond;

        // Update current beat
        this.setCurrentBeat(currentBeat);

        // Schedule next update
        requestAnimationFrame(this.playbackLoop.bind(this));
    }

    public override render(): void {
        super.render();

        // Add editor-specific rendering
        if (!this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Highlight selected note
        if (this.selectedNoteIndex !== null) {
            this.drawSelectedNoteHighlight(ctx);
        }
    }

    private drawSelectedNoteHighlight(ctx: CanvasRenderingContext2D): void {
        if (this.selectedNoteIndex === null) return;

        const note = this.options.notes[this.selectedNoteIndex];
        const { lineSpacing, measureWidth, timeSignature } = this.options;
        const staffY = this.canvas.height / 2 - lineSpacing * 2;
        const beatsPerMeasure = timeSignature.numerator;
        const startX = -this.scrollPosition;

        // Calculate note position
        const measure = Math.floor(note.startTime / beatsPerMeasure);
        const beatInMeasure = note.startTime % beatsPerMeasure;
        const noteX = startX + measure * measureWidth + (measureWidth / beatsPerMeasure) * beatInMeasure;

        // Get pitch position
        const pitch = note.pitch;
        const pitchBase = pitch.slice(0, -1);
        const octave = parseInt(pitch.slice(-1));
        const pitchKey = `${pitchBase}${octave}`;

        // Get position on staff
        let position = this.pitchMap.get(pitchKey) || 0;

        // Calculate Y position on staff
        const basePosition = 14; // E4 in treble clef
        const noteY = staffY + (4 - (position - basePosition) / 2) * lineSpacing;

        // Draw selection highlight
        ctx.strokeStyle = '#1E90FF'; // Dodger blue
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(noteX, noteY, lineSpacing * 1.2, 0, Math.PI * 2);
        ctx.stroke();
    }

    public override dispose(): void {
        // Remove event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
            this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
            this.canvas.removeEventListener('dblclick', this.handleDoubleClick.bind(this));
        }
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));

        // Stop playback
        this.stopPlayback();

        // Call parent dispose
        super.dispose();
    }
}