import {DEFAULT_VISUALIZATION_OPTIONS, VisualizationOptions, Visualizer} from "./visualizer.ts";
import {Note} from "./musicNotation.ts";

export interface MIDINote extends Note {
    channel: number;
    isActive: boolean;
}

export interface MIDIVisualizerOptions extends VisualizationOptions {
    showControls: boolean;
    highlightColor: string;
    noteColors: Record<number, string>; // By channel
    noteHeight: number;
    scrollSpeed: number; // pixels per second
    timeWindow: number; // seconds to display
    autoScroll: boolean;
    currentTime: number; // seconds from start
    showTimeMarkers: boolean;
    showChannelLabels: boolean;
    horizontalMode: boolean; // false: scrolling down, true: scrolling right
}

export const DEFAULT_MIDI_VISUALIZER_OPTIONS: MIDIVisualizerOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    showControls: true,
    highlightColor: 'rgba(97, 218, 251, 0.3)',
    noteColors: {
        0: '#C62828', // Channel 1: Red
        1: '#AD1457', // Channel 2: Pink
        2: '#6A1B9A', // Channel 3: Purple
        3: '#4527A0', // Channel 4: Deep Purple
        4: '#283593', // Channel 5: Indigo
        5: '#1565C0', // Channel 6: Blue
        6: '#0277BD', // Channel 7: Light Blue
        7: '#00838F', // Channel 8: Cyan
        8: '#00695C', // Channel 9: Teal
        9: '#2E7D32', // Channel 10: Green
        10: '#558B2F', // Channel 11: Light Green
        11: '#9E9D24', // Channel 12: Lime
        12: '#F9A825', // Channel 13: Yellow
        13: '#FF8F00', // Channel 14: Amber
        14: '#EF6C00', // Channel 15: Orange
        15: '#D84315'  // Channel 16: Deep Orange
    },
    noteHeight: 20,
    scrollSpeed: 100,
    timeWindow: 10,
    autoScroll: true,
    currentTime: 0,
    showTimeMarkers: true,
    showChannelLabels: true,
    horizontalMode: false
};

export class MIDIVisualizer extends Visualizer {
    private options: MIDIVisualizerOptions;
    private notes: MIDINote[] = [];
    private midiAccess: WebMidi.MIDIAccess | null = null;
    private animationFrameId: number | null = null;
    private lastFrameTime: number = 0;
    private scrollPosition: number = 0;
    private isPlaying: boolean = false;
    private playbackStartTime: number | null = null;

    constructor(canvas: string, options: Partial<MIDIVisualizerOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_MIDI_VISUALIZER_OPTIONS, ...options };

        this.initMIDI();
        this.startAnimation();
    }

    private async initMIDI(): Promise<void> {
        try {
            if (navigator.requestMIDIAccess) {
                this.midiAccess = await navigator.requestMIDIAccess();

                // Setup MIDI input event handlers
                this.midiAccess.inputs.forEach(input => {
                    input.onmidimessage = this.handleMIDIMessage.bind(this);
                });
            } else {
                console.warn('WebMIDI is not supported in this browser.');
            }
        } catch (error) {
            console.error('Failed to access MIDI devices:', error);
        }
    }

    private handleMIDIMessage(event: WebMidi.MIDIMessageEvent): void {
        const [statusByte, dataByte1, dataByte2] = event.data;

        const command = statusByte >> 4;
        const channel = statusByte & 0xF;

        // Note On event (command 9)
        if (command === 9 && dataByte2 > 0) {
            const note: MIDINote = {
                pitch: dataByte1,
                velocity: dataByte2 / 127,
                startTime: this.options.currentTime,
                duration: 0, // Will be updated on Note Off
                channel: channel,
                isActive: true
            };

            this.notes.push(note);
        }
        // Note Off event (command 8 or Note On with velocity 0)
        else if ((command === 8 || (command === 9 && dataByte2 === 0))) {
            const noteIndex = this.notes.findIndex(
                n => n.pitch === dataByte1 && n.channel === channel && n.isActive
            );

            if (noteIndex !== -1) {
                this.notes[noteIndex].isActive = false;
                this.notes[noteIndex].duration = this.options.currentTime - this.notes[noteIndex].startTime;
            }
        }
    }

    public loadMIDIFile(midiData: ArrayBuffer): void {
        // This would parse the MIDI file and convert to our note format
        // In a real implementation, you would use a MIDI parser
        console.log('Loading MIDI file...');
        // Example placeholder for MIDI file parsing
        // this.notes = parseMIDIFile(midiData);
    }

    public startAnimation(): void {
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    public stopAnimation(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    private animate(timestamp: number): void {
        const deltaTime = (timestamp - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = timestamp;

        // Update current time if playing
        if (this.isPlaying) {
            if (this.playbackStartTime === null) {
                this.playbackStartTime = timestamp - (this.options.currentTime * 1000);
            }
            this.options.currentTime = (timestamp - this.playbackStartTime) / 1000;
        }

        // Update scroll position based on current time
        if (this.options.autoScroll) {
            if (this.options.horizontalMode) {
                this.scrollPosition = this.options.currentTime * this.options.scrollSpeed;
            } else {
                this.scrollPosition = this.options.currentTime * this.options.scrollSpeed;
            }
        }

        this.render();

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    public render(): void {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw time markers if enabled
        if (this.options.showTimeMarkers) {
            this.drawTimeMarkers(ctx);
        }

        // Draw channel labels if enabled
        if (this.options.showChannelLabels) {
            this.drawChannelLabels(ctx);
        }

        // Draw notes
        this.drawNotes(ctx);

        // Draw playhead
        this.drawPlayhead(ctx);

        // Draw controls if enabled
        if (this.options.showControls) {
            this.drawControls(ctx);
        }
    }

    private drawTimeMarkers(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#555';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.textAlign = 'left';
        ctx.font = '10px Arial';

        const secondsVisible = this.options.timeWindow;
        const startTime = this.options.currentTime - (this.options.horizontalMode ? 0 : secondsVisible);
        const endTime = startTime + secondsVisible;

        // Draw markers every second
        for (let t = Math.floor(startTime); t <= Math.ceil(endTime); t++) {
            let x = 0;
            let y = 0;

            if (this.options.horizontalMode) {
                x = this.timeToX(t);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.canvas.height);
                ctx.stroke();

                ctx.fillText(`${t}s`, x + 2, 12);
            } else {
                y = this.timeToY(t);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.canvas.width, y);
                ctx.stroke();

                ctx.fillText(`${t}s`, 2, y - 2);
            }
        }
    }

    private drawChannelLabels(ctx: CanvasRenderingContext2D): void {
        ctx.textAlign = 'left';
        ctx.font = '12px Arial';

        const usedChannels = new Set(this.notes.map(note => note.channel));

        Array.from(usedChannels).forEach((channel, index) => {
            const color = this.options.noteColors[channel] || '#ffffff';
            const labelY = 20 + (index * 20);

            ctx.fillStyle = color;
            ctx.fillRect(10, labelY - 10, 10, 10);

            ctx.fillStyle = '#fff';
            ctx.fillText(`Channel ${channel + 1}`, 25, labelY);
        });
    }

    private drawNotes(ctx: CanvasRenderingContext2D): void {
        this.notes.forEach(note => {
            const color = this.options.noteColors[note.channel] || '#ffffff';
            ctx.fillStyle = note.isActive ? this.options.highlightColor : color;

            const noteName = this.getPitchName(note.pitch);
            const octave = Math.floor(note.pitch / 12) - 1;

            if (this.options.horizontalMode) {
                const x = this.timeToX(note.startTime);
                const width = note.duration * this.options.scrollSpeed;
                const y = this.canvas.height - ((note.pitch - 21) * this.options.noteHeight) - this.options.noteHeight;

                ctx.fillRect(x, y, width || 10, this.options.noteHeight);

                // Draw note name if the note is wide enough
                if (width > 30) {
                    ctx.fillStyle = '#000';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(`${noteName}${octave}`, x + 2, y + this.options.noteHeight - 2);
                }
            } else {
                const y = this.timeToY(note.startTime);
                const height = note.duration * this.options.scrollSpeed;
                const x = (note.pitch - 21) * this.options.noteHeight;

                ctx.fillRect(x, y, this.options.noteHeight, height || 10);

                // Draw note name if the note is tall enough
                if (height > 30) {
                    ctx.save();
                    ctx.fillStyle = '#000';
                    ctx.font = '10px Arial';
                    ctx.translate(x + 2, y + height - 2);
                    ctx.rotate(-Math.PI / 2);
                    ctx.textAlign = 'right';
                    ctx.fillText(`${noteName}${octave}`, 0, 0);
                    ctx.restore();
                }
            }
        });
    }

    private drawPlayhead(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = 2;

        if (this.options.horizontalMode) {
            const x = this.timeToX(this.options.currentTime);

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        } else {
            const y = this.timeToY(this.options.currentTime);

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    private drawControls(ctx: CanvasRenderingContext2D): void {
        // Draw simple play/pause button
        const buttonRadius = 15;
        const buttonX = this.canvas.width - 30;
        const buttonY = this.canvas.height - 30;

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(buttonX, buttonY, buttonRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        if (this.isPlaying) {
            // Pause icon
            ctx.fillRect(buttonX - 5, buttonY - 7, 3, 14);
            ctx.fillRect(buttonX + 2, buttonY - 7, 3, 14);
        } else {
            // Play icon
            ctx.beginPath();
            ctx.moveTo(buttonX - 4, buttonY - 7);
            ctx.lineTo(buttonX - 4, buttonY + 7);
            ctx.lineTo(buttonX + 7, buttonY);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Utility functions
    private timeToX(time: number): number {
        return time * this.options.scrollSpeed - this.scrollPosition;
    }

    private timeToY(time: number): number {
        return this.canvas.height - (time * this.options.scrollSpeed - this.scrollPosition);
    }

    private getPitchName(pitch: number): string {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteNames[pitch % 12];
    }

    // Interaction methods
    public play(): void {
        this.isPlaying = true;
        this.playbackStartTime = performance.now() - (this.options.currentTime * 1000);
    }

    public pause(): void {
        this.isPlaying = false;
    }

    public stop(): void {
        this.isPlaying = false;
        this.options.currentTime = 0;
        this.playbackStartTime = null;
    }

    public setCurrentTime(time: number): void {
        this.options.currentTime = time;
        if (this.isPlaying) {
            this.playbackStartTime = performance.now() - (time * 1000);
        }
    }

    public setAutoScroll(autoScroll: boolean): void {
        this.options.autoScroll = autoScroll;
    }

    public setHorizontalMode(horizontal: boolean): void {
        this.options.horizontalMode = horizontal;
    }

    public toggleOrientation(): void {
        this.options.horizontalMode = !this.options.horizontalMode;
    }

    // Override the parent class's destroy method to clean up resources
    public destroy(): void {
        this.stopAnimation();

        // Remove MIDI event listeners if they exist
        if (this.midiAccess) {
            this.midiAccess.inputs.forEach(input => {
                input.onmidimessage = null;
            });
        }

        super.destroy();
    }
}