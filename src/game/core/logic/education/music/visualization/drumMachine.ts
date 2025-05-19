// visualization/drumMachine.ts
import {Visualizer, VisualizationOptions, DEFAULT_VISUALIZATION_OPTIONS} from './visualizer.ts';

export interface DrumPad {
    id: string;
    name: string;
    color: string;
    sound: string;
    key?: string;
}

export interface DrumMachineOptions extends VisualizationOptions {
    pads: DrumPad[];
    rows: number;
    columns: number;
    padSpacing: number;
    padRadius: number;
    padActiveColor: string;
    padActiveDuration: number;
    showLabels: boolean;
    labelColor: string;
    labelFont: string;
    showKeyBindings: boolean;
}

export const DEFAULT_DRUM_MACHINE_OPTIONS: DrumMachineOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    pads: [
        { id: 'kick', name: 'Kick', color: '#4a4a4a', sound: 'kick.wav', key: 'q' },
        { id: 'snare', name: 'Snare', color: '#6a6a6a', sound: 'snare.wav', key: 'w' },
        { id: 'hihat', name: 'Hi-Hat', color: '#8a8a8a', sound: 'hihat.wav', key: 'e' },
        { id: 'clap', name: 'Clap', color: '#aaaaaa', sound: 'clap.wav', key: 'r' },
        { id: 'tom1', name: 'Tom 1', color: '#5a5a5a', sound: 'tom1.wav', key: 'a' },
        { id: 'tom2', name: 'Tom 2', color: '#7a7a7a', sound: 'tom2.wav', key: 's' },
        { id: 'crash', name: 'Crash', color: '#9a9a9a', sound: 'crash.wav', key: 'd' },
        { id: 'ride', name: 'Ride', color: '#bababa', sound: 'ride.wav', key: 'f' },
    ],
    rows: 2,
    columns: 4,
    padSpacing: 20,
    padRadius: 8,
    padActiveColor: '#61dafb',
    padActiveDuration: 300,
    showLabels: true,
    labelColor: '#ffffff',
    labelFont: '14px Arial',
    showKeyBindings: true,
};

export class DrumMachine extends Visualizer {
    private options: DrumMachineOptions;
    private audioContext: AudioContext | null = null;
    private audioBuffers: Map<string, AudioBuffer> = new Map();
    private activePads: Map<string, number> = new Map();
    private animationFrameId: number | null = null;
    private keyboardEventsBound: boolean = false;

    constructor(canvas: HTMLCanvasElement, options: Partial<DrumMachineOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_DRUM_MACHINE_OPTIONS, ...options };
        this.initAudioContext();
        this.startAnimation();
    }

    private initAudioContext(): void {
        this.audioContext = new AudioContext();
        this.loadSounds();
    }

    private async loadSounds(): Promise<void> {
        if (!this.audioContext) return;

        const loadSound = async (pad: DrumPad) => {
            try {
                const response = await fetch(pad.sound);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
                this.audioBuffers.set(pad.id, audioBuffer);
            } catch (error) {
                console.error(`Failed to load sound: ${pad.sound}`, error);
            }
        };

        // Load all sounds in parallel
        await Promise.all(this.options.pads.map(loadSound));
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

        // Draw drum pads
        this.drawPads(ctx);
    }

    private drawPads(ctx: CanvasRenderingContext2D): void {
        const {
            width,
            height,
            pads,
            rows,
            columns,
            padSpacing,
            padRadius,
            padActiveColor,
            showLabels,
            labelColor,
            labelFont,
            showKeyBindings
        } = this.options;

        // Calculate pad dimensions
        const padWidth = (width - (padSpacing * (columns + 1))) / columns;
        const padHeight = (height - (padSpacing * (rows + 1))) / rows;

        // Draw each pad
        pads.forEach((pad, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;

            const x = padSpacing + col * (padWidth + padSpacing);
            const y = padSpacing + row * (padHeight + padSpacing);

            // Determine if pad is active
            const isActive = this.activePads.has(pad.id);

            // Draw pad background
            ctx.fillStyle = isActive ? padActiveColor : pad.color;
            ctx.beginPath();
            ctx.roundRect(x, y, padWidth, padHeight, padRadius);
            ctx.fill();

            // Draw pad label if enabled
            if (showLabels) {
                ctx.fillStyle = labelColor;
                ctx.font = labelFont;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pad.name, x + padWidth / 2, y + padHeight / 2);

                // Draw key binding if enabled and defined
                if (showKeyBindings && pad.key) {
                    ctx.font = '12px Arial';
                    ctx.fillText(`[${pad.key.toUpperCase()}]`, x + padWidth / 2, y + padHeight - 15);
                }
            }
        });
    }

    public triggerPad(padId: string): void {
        if (!this.audioContext) return;

        const pad = this.options.pads.find(p => p.id === padId);
        if (!pad) return;

        // Mark pad as active
        this.activePads.set(padId, Date.now());

        // Play sound
        const buffer = this.audioBuffers.get(padId);
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
        }

        // Set timeout to deactivate pad
        setTimeout(() => {
            this.activePads.delete(padId);
        }, this.options.padActiveDuration);
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        if (event.repeat) return;

        const pad = this.options.pads.find(p => p.key === event.key.toLowerCase());
        if (pad) {
            this.triggerPad(pad.id);
        }
    };

    public enableKeyboardControls(): void {
        if (!this.keyboardEventsBound) {
            window.addEventListener('keydown', this.handleKeyDown);
            this.keyboardEventsBound = true;
        }
    }

    public disableKeyboardControls(): void {
        if (this.keyboardEventsBound) {
            window.removeEventListener('keydown', this.handleKeyDown);
            this.keyboardEventsBound = false;
        }
    }

    public updateOptions(options: Partial<DrumMachineOptions>): void {
        this.options = { ...this.options, ...options };
    }

    public disconnect(): void {
        // Stop animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Disable keyboard controls
        this.disableKeyboardControls();

        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }

        // Clear buffers and active pads
        this.audioBuffers.clear();
        this.activePads.clear();
    }

    public destroy(): void {
        this.disconnect();
        super.destroy();
    }
}