import {Note} from "./musicNotation.ts";
import {Visualizer} from "./visualizer.ts";
import {DEFAULT_VISUALIZATION_OPTIONS, VisualizationOptions} from "../../../../../utils/math/graphics.ts";

export interface PianoRollOptions extends VisualizationOptions {
    keyboardVisible: boolean;
    keyboardHeight: number;
    whiteKeyColor: string;
    blackKeyColor: string;
    activeKeyColor: string;
    gridColor: string;
    octaveStartNote: number;  // MIDI note number (e.g., 21 for A0)
    octavesVisible: number;   // Number of octaves to display
    noteHeight: number;
    noteBorderRadius: number;
    showNoteNames: boolean;
    useFlats: boolean;
    playbackSpeed: number;    // Playback speed multiplier
    showBeatMarkers: boolean;
    beatsPerMeasure: number;
    snapToGrid: boolean;
    gridResolution: number;   // In ticks (e.g., 16th notes = 120 ticks @ 480 PPQ)
}

export const DEFAULT_PIANO_ROLL_OPTIONS: PianoRollOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    keyboardVisible: true,
    keyboardHeight: 120,
    whiteKeyColor: '#ffffff',
    blackKeyColor: '#222222',
    activeKeyColor: '#61dafb',
    gridColor: 'rgba(100, 100, 100, 0.3)',
    octaveStartNote: 48,  // C3
    octavesVisible: 3,
    noteHeight: 16,
    noteBorderRadius: 3,
    showNoteNames: true,
    useFlats: false,
    playbackSpeed: 1.0,
    showBeatMarkers: true,
    beatsPerMeasure: 4,
    snapToGrid: true,
    gridResolution: 120   // 16th notes at 480 PPQ
};

export class PianoRoll extends Visualizer {
    private options: PianoRollOptions;
    private notes: Note[] = [];
    private activeNotes: Set<number> = new Set();
    private selectedNotes: Note[] = [];
    private dragStartPos: { x: number, y: number } | null = null;
    private isPlaying: boolean = false;
    private playbackStartTime: number | null = null;
    private currentTime: number = 0;
    private timelineWidth: number = 0;
    private animationFrameId: number | null = null;
    private keyboardWidth: number = 80;
    private mouseDown: boolean = false;

    constructor(canvasId: string, options: Partial<PianoRollOptions> = {}) {
        super(canvasId, options);
        this.options = { ...DEFAULT_PIANO_ROLL_OPTIONS, ...options };

        this.setupEventListeners();
        this.startAnimation();
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private removeEventListeners(): void {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.removeEventListener('click', this.handleClick.bind(this));
        this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    public setNotes(notes: Note[]): void {
        this.notes = [...notes];
    }

    public addNote(note: Note): void {
        this.notes.push(note);
    }

    public removeNote(note: Note): void {
        const index = this.notes.indexOf(note);
        if (index !== -1) {
            this.notes.splice(index, 1);
        }
    }

    public clearNotes(): void {
        this.notes = [];
    }

    public setActiveNote(pitch: number, active: boolean): void {
        if (active) {
            this.activeNotes.add(pitch);
        } else {
            this.activeNotes.delete(pitch);
        }
    }

    private startAnimation(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const animate = (timestamp: number) => {
            if (this.isPlaying) {
                if (this.playbackStartTime === null) {
                    this.playbackStartTime = timestamp;
                }

                this.currentTime = (timestamp - this.playbackStartTime) / 1000 * this.options.playbackSpeed;
            }

            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    public render(): void {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const contentWidth = this.canvas.width - this.keyboardWidth;
        const contentHeight = this.canvas.height - (this.options.keyboardVisible ? this.options.keyboardHeight : 0);

        // Draw grid
        this.drawGrid(ctx, contentWidth, contentHeight);

        // Draw piano keyboard if visible
        if (this.options.keyboardVisible) {
            this.drawKeyboard(ctx, contentHeight);
        }

        // Draw timeline
        this.drawTimeline(ctx);

        // Draw notes
        this.drawNotes(ctx, contentWidth, contentHeight);

        // Draw playhead
        this.drawPlayhead(ctx, contentHeight);
    }

    private drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        const totalNotes = this.options.octavesVisible * 12;
        const noteHeight = height / totalNotes;

        ctx.strokeStyle = this.options.gridColor;
        ctx.lineWidth = 1;

        // Draw horizontal lines (pitch lines)
        for (let i = 0; i <= totalNotes; i++) {
            const y = i * noteHeight;

            ctx.beginPath();
            ctx.moveTo(this.keyboardWidth, y);
            ctx.lineTo(this.canvas.width, y);

            // Highlight C notes with a slightly darker line
            if ((this.options.octaveStartNote + i) % 12 === 0) {
                ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = this.options.gridColor;
                ctx.lineWidth = 1;
            }

            ctx.stroke();
        }

        // Draw vertical lines (beat/measure markers)
        const pixelsPerBeat = 80; // Arbitrary value, could be calculated based on time signature
        const beatsVisible = Math.ceil(width / pixelsPerBeat);

        for (let i = 0; i <= beatsVisible; i++) {
            const x = this.keyboardWidth + (i * pixelsPerBeat);

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);

            // Highlight measure lines
            if (i % this.options.beatsPerMeasure === 0) {
                ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = this.options.gridColor;
                ctx.lineWidth = 1;
            }

            ctx.stroke();
        }
    }

    private drawKeyboard(ctx: CanvasRenderingContext2D, contentHeight: number): void {
        const totalNotes = this.options.octavesVisible * 12;
        const noteHeight = contentHeight / totalNotes;
        const keyboardY = this.canvas.height - this.options.keyboardHeight;

        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, this.keyboardWidth, this.canvas.height);

        // Draw white keys first
        for (let i = 0; i < totalNotes; i++) {
            const pitch = this.options.octaveStartNote + i;
            const pitchClass = pitch % 12;

            // If it's a white key
            if ([0, 2, 4, 5, 7, 9, 11].includes(pitchClass)) {
                const y = contentHeight - ((i + 1) * noteHeight);

                ctx.fillStyle = this.activeNotes.has(pitch) ? this.options.activeKeyColor : this.options.whiteKeyColor;
                ctx.fillRect(0, y, this.keyboardWidth - 1, noteHeight);

                // Draw note name
                if (this.options.showNoteNames && pitchClass === 0) { // Show only C notes
                    ctx.fillStyle = '#000';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    const octave = Math.floor(pitch / 12) - 1;
                    ctx.fillText(`C${octave}`, this.keyboardWidth / 2, y + noteHeight - 4);
                }
            }
        }

        // Then draw black keys on top
        for (let i = 0; i < totalNotes; i++) {
            const pitch = this.options.octaveStartNote + i;
            const pitchClass = pitch % 12;

            // If it's a black key
            if ([1, 3, 6, 8, 10].includes(pitchClass)) {
                const y = contentHeight - ((i + 1) * noteHeight);

                ctx.fillStyle = this.activeNotes.has(pitch) ? this.options.activeKeyColor : this.options.blackKeyColor;
                ctx.fillRect(0, y, this.keyboardWidth * 0.6, noteHeight);
            }
        }
    }

    private drawTimeline(ctx: CanvasRenderingContext2D): void {
        const timelineHeight = 20;

        ctx.fillStyle = '#333';
        ctx.fillRect(this.keyboardWidth, 0, this.canvas.width - this.keyboardWidth, timelineHeight);

        // Calculate time markers
        const pixelsPerBeat = 80;
        const beatsVisible = Math.ceil((this.canvas.width - this.keyboardWidth) / pixelsPerBeat);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        for (let i = 0; i <= beatsVisible; i++) {
            const x = this.keyboardWidth + (i * pixelsPerBeat);
            const beat = i + 1;
            const measure = Math.floor(i / this.options.beatsPerMeasure) + 1;
            const beatInMeasure = (i % this.options.beatsPerMeasure) + 1;

            // Draw measure:beat
            if (beatInMeasure === 1) {
                ctx.fillText(`${measure}:1`, x, 15);
            } else {
                ctx.fillText(`${beatInMeasure}`, x, 15);
            }
        }
    }

    private drawNotes(ctx: CanvasRenderingContext2D, contentWidth: number, contentHeight: number): void {
        const totalNotes = this.options.octavesVisible * 12;
        const noteHeight = contentHeight / totalNotes;
        const pixelsPerSecond = 100; // Arbitrary value, could be calculated based on tempo

        ctx.save();
        ctx.translate(this.keyboardWidth, 0);

        this.notes.forEach(note => {
            const pitchIndex = note.pitch - this.options.octaveStartNote;
            if (pitchIndex < 0 || pitchIndex >= totalNotes) return; // Skip notes outside visible range

            const y = contentHeight - ((pitchIndex + 1) * noteHeight);
            const x = note.startTime * pixelsPerSecond;
            const width = note.duration * pixelsPerSecond;

            // Draw note rectangle
            const isSelected = this.selectedNotes.includes(note);
            ctx.fillStyle = isSelected ? 'rgba(255, 165, 0, 0.8)' : 'rgba(97, 218, 251, 0.8)';

            // Use rounded rectangle if supported
            if (ctx.roundRect) {
                ctx.beginPath();
                (ctx as any).roundRect(x, y, width, noteHeight, this.options.noteBorderRadius);
                ctx.fill();
            } else {
                ctx.fillRect(x, y, width, noteHeight);
            }

            // Draw note border
            ctx.strokeStyle = isSelected ? '#ff8c00' : '#4fa3d1';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(x, y, width, noteHeight);

            // Draw note velocity indicator
            const velocityWidth = 3;
            ctx.fillStyle = `rgba(255, 255, 255, ${note.velocity})`;
            ctx.fillRect(x, y, velocityWidth, noteHeight);
        });

        ctx.restore();
    }

    private drawPlayhead(ctx: CanvasRenderingContext2D, contentHeight: number): void {
        if (!this.isPlaying) return;

        const pixelsPerSecond = 100;
        const x = this.keyboardWidth + (this.currentTime * pixelsPerSecond);

        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, contentHeight);
        ctx.stroke();
    }

    private handleMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.dragStartPos = { x, y };

        // Check if clicking on the keyboard
        if (this.options.keyboardVisible && x <= this.keyboardWidth) {
            const pitch = this.yToPitch(y);
            if (pitch !== null) {
                this.setActiveNote(pitch, true);
                // Trigger MIDI note on or other sound
            }
        } else {
            // Check if clicking on a note
            const clickedNote = this.getNoteAtPosition(x, y);

            if (clickedNote) {
                // Toggle selection if holding Ctrl/Cmd
                if (event.ctrlKey || event.metaKey) {
                    const index = this.selectedNotes.indexOf(clickedNote);
                    if (index !== -1) {
                        this.selectedNotes.splice(index, 1);
                    } else {
                        this.selectedNotes.push(clickedNote);
                    }
                } else {
                    // Select only this note
                    this.selectedNotes = [clickedNote];
                }
            } else {
                // If clicking on empty space, clear selection
                this.selectedNotes = [];

                // Start creating a new note
                const pitch = this.yToPitch(y);
                const time = this.xToTime(x);

                if (pitch !== null && time !== null) {
                    const newNote: Note = {
                        pitch,
                        startTime: time,
                        duration: 0,
                        velocity: 0.8
                    };

                    this.notes.push(newNote);
                    this.selectedNotes = [newNote];
                }
            }
        }

        this.render();
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.mouseDown || !this.dragStartPos) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // If dragging on the keyboard
        if (this.options.keyboardVisible && this.dragStartPos.x <= this.keyboardWidth) {
            const pitch = this.yToPitch(y);
            if (pitch !== null) {
                this.setActiveNote(pitch, true);
                // Trigger MIDI note on or other sound
            }
        } else if (this.selectedNotes.length > 0) {
            // If dragging selected notes
            const lastNote = this.selectedNotes[this.selectedNotes.length - 1];
            if (lastNote) {
                const pixelsPerSecond = 100;
                const duration = (x - this.keyboardWidth) / pixelsPerSecond - lastNote.startTime;

                // Update duration, but ensure it's at least a minimum value
                lastNote.duration = Math.max(0.1, duration);

                // If snap to grid is enabled, snap to nearest grid line
                if (this.options.snapToGrid) {
                    const gridTimeValue = this.options.gridResolution / 480; // Convert ticks to seconds at standard PPQ
                    lastNote.duration = Math.round(lastNote.duration / gridTimeValue) * gridTimeValue;
                }
            }
        }

        this.render();
    }

    private handleMouseUp(event: MouseEvent): void {
        this.mouseDown = false;

        // Stop active notes on the keyboard
        if (this.options.keyboardVisible && this.dragStartPos && this.dragStartPos.x <= this.keyboardWidth) {
            this.activeNotes.forEach(pitch => {
                this.setActiveNote(pitch, false);
                // Trigger MIDI note off or other sound stop
            });
        }

        this.dragStartPos = null;
        this.render();
    }

    private handleClick(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Handle clicks on the timeline
        const timelineHeight = 20;
        if (y <= timelineHeight && x >= this.keyboardWidth) {
            const time = this.xToTime(x);
            if (time !== null) {
                this.setCurrentTime(time);
            }
        }
    }

    private handleWheel(event: WheelEvent): void {
        event.preventDefault();

        // Zoom in/out of the timeline with Ctrl+Wheel
        if (event.ctrlKey || event.metaKey) {
            const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
            const pixelsPerSecond = 100; // Base value, would be modified by zoom

            // TODO: Implement zooming by adjusting pixelsPerSecond
        } else {
            // Scroll up/down or left/right depending on orientation
            const scrollAmount = event.deltaY;

            // TODO: Implement scrolling
        }

        this.render();
    }

    private handleKeyDown(event: KeyboardEvent): void {
        // Handle keyboard shortcuts
        if (event.key === 'Delete' || event.key === 'Backspace') {
            // Delete selected notes
            this.notes = this.notes.filter(note => !this.selectedNotes.includes(note));
            this.selectedNotes = [];
            this.render();
        } else if (event.key === ' ') {
            // Space toggles play/pause
            this.togglePlayback();
        } else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            // Ctrl+A selects all notes
            event.preventDefault();
            this.selectedNotes = [...this.notes];
            this.render();
        }
    }

    // Utility methods
    private yToPitch(y: number): number | null {
        if (!this.options.keyboardVisible) return null;

        const contentHeight = this.canvas.height - this.options.keyboardHeight;
        const totalNotes = this.options.octavesVisible * 12;
        const noteHeight = contentHeight / totalNotes;

        // Calculate pitch from y position
        const pitchIndex = Math.floor((contentHeight - y) / noteHeight);
        const pitch = this.options.octaveStartNote + pitchIndex;

        return (pitchIndex >= 0 && pitchIndex < totalNotes) ? pitch : null;
    }

    private xToTime(x: number): number | null {
        if (x < this.keyboardWidth) return null;

        const pixelsPerSecond = 100;
        const time = (x - this.keyboardWidth) / pixelsPerSecond;

        // If snap to grid is enabled, snap to nearest grid line
        if (this.options.snapToGrid) {
            const gridTimeValue = this.options.gridResolution / 480; // Convert ticks to seconds at standard PPQ
            return Math.round(time / gridTimeValue) * gridTimeValue;
        }

        return time;
    }

    private getNoteAtPosition(x: number, y: number): Note | null {
        if (x < this.keyboardWidth) return null;

        const contentHeight = this.canvas.height - (this.options.keyboardVisible ? this.options.keyboardHeight : 0);
        const totalNotes = this.options.octavesVisible * 12;
        const noteHeight = contentHeight / totalNotes;
        const pixelsPerSecond = 100;

        const time = this.xToTime(x);
        const pitchIndex = Math.floor((contentHeight - y) / noteHeight);
        const pitch = this.options.octaveStartNote + pitchIndex;

        if (time === null || pitchIndex < 0 || pitchIndex >= totalNotes) return null;

        // Find note at this position
        for (const note of this.notes) {
            if (note.pitch === pitch &&
                time >= note.startTime &&
                time <= note.startTime + note.duration) {
                return note;
            }
        }

        return null;
    }

    // Playback control methods
    public play(): void {
        this.isPlaying = true;
        this.playbackStartTime = null; // Will be set on next animation frame
    }

    public pause(): void {
        this.isPlaying = false;
    }

    public stop(): void {
        this.isPlaying = false;
        this.currentTime = 0;
        this.playbackStartTime = null;
        this.render();
    }

    public togglePlayback(): void {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    public setCurrentTime(time: number): void {
        this.currentTime = time;
        if (this.isPlaying) {
            this.playbackStartTime = performance.now() - (time * 1000 / this.options.playbackSpeed);
        }
        this.render();
    }

    // Import/export methods
    public importMIDI(midiData: ArrayBuffer): void {
        // This would parse a MIDI file and convert to piano roll notes
        console.log('Importing MIDI data...');
        // Implementation would depend on a MIDI parser
    }

    public exportMIDI(): ArrayBuffer {
        // This would convert piano roll notes to MIDI format
        console.log('Exporting to MIDI...');
        // Implementation would depend on a MIDI writer
        return new ArrayBuffer(0);
    }

    public toJSON(): object {
        return {
            notes: this.notes,
            options: this.options
        };
    }

    public fromJSON(data: { notes: Note[], options: Partial<PianoRollOptions> }): void {
        this.notes = data.notes;
        this.options = { ...this.options, ...data.options };
        this.render();
    }

    // Cleanup method
    public destroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }

        this.removeEventListeners();
        super.destroy();
    }
}