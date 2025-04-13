import {DEFAULT_VISUALIZATION_OPTIONS, VisualizationOptions, Visualizer} from "./visualizer.ts";

export interface MetronomeOptions extends VisualizationOptions {
    tempo: number;
    timeSignature: { numerator: number; denominator: number };
    accentFirstBeat: boolean;
    pendulumLength: number;
    pendulumColor: string;
    tickColor: string;
    accentColor: string;
    textColor: string;
    visualMode: 'pendulum' | 'bar' | 'dot';
    tempoRange: { min: number; max: number };
    isPlaying: boolean;
    showTempo: boolean;
    showTimeSignature: boolean;
    tickSoundUrl: string;
    accentSoundUrl: string;
}

export const DEFAULT_METRONOME_OPTIONS: MetronomeOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    accentFirstBeat: true,
    pendulumLength: 150,
    pendulumColor: '#1E90FF',
    tickColor: '#333333',
    accentColor: '#FF4500',
    textColor: '#000000',
    visualMode: 'pendulum',
    tempoRange: { min: 30, max: 240 },
    isPlaying: false,
    showTempo: true,
    showTimeSignature: true,
    tickSoundUrl: '',
    accentSoundUrl: ''
};

export class Metronome extends Visualizer {
    private options: MetronomeOptions;
    private audioContext: AudioContext | null = null;
    private tickBuffer: AudioBuffer | null = null;
    private accentBuffer: AudioBuffer | null = null;
    private currentBeat: number = 0;
    private lastTickTime: number = 0;
    private animationFrameId: number | null = null;
    private pendulumAngle: number = 0;
    private pendulumDirection: number = 1;

    constructor(canvas: string, options: Partial<MetronomeOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_METRONOME_OPTIONS, ...options };

        this.initAudio();
        this.startAnimation();
    }

    private async initAudio(): Promise<void> {
        try {
            this.audioContext = new AudioContext();

            // Load tick sound
            if (this.options.tickSoundUrl) {
                this.tickBuffer = await this.loadSound(this.options.tickSoundUrl);
            } else {
                // Create default tick sound
                this.tickBuffer = this.createTickSound();
            }

            // Load accent sound
            if (this.options.accentSoundUrl) {
                this.accentBuffer = await this.loadSound(this.options.accentSoundUrl);
            } else {
                // Create default accent sound
                this.accentBuffer = this.createAccentSound();
            }
        } catch (error) {
            console.error('Error initializing metronome audio:', error);
        }
    }

    private async loadSound(url: string): Promise<AudioBuffer> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    private createTickSound(): AudioBuffer {
        // Create a simple tick sound (sine wave)
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * 0.1, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Sine wave with decay
            channelData[i] = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-10 * t);
        }

        return buffer;
    }

    private createAccentSound(): AudioBuffer {
        // Create a simple accent sound (sine wave with lower frequency)
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * 0.15, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Sine wave with decay (lower frequency for accent)
            channelData[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-8 * t);
        }

        return buffer;
    }

    private startAnimation(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const animate = (timestamp: number) => {
            // Update metronome state
            this.update(timestamp);

            // Render visualization
            this.render();

            // Schedule next frame
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    private update(timestamp: number): void {
        if (!this.options.isPlaying) {
            // When not playing, pendulum gradually returns to center
            this.pendulumAngle *= 0.95;
            return;
        }

        const { tempo } = this.options;
        const beatDuration = 60000 / tempo; // in milliseconds

        // Check if it's time for a tick
        if (timestamp - this.lastTickTime >= beatDuration) {
            this.lastTickTime = timestamp;

            // Play tick sound
            this.playTick();

            // Update current beat
            this.currentBeat = (this.currentBeat + 1) % this.options.timeSignature.numerator;

            // Reverse pendulum direction
            this.pendulumDirection *= -1;
        }

        // Calculate pendulum angle based on time since last tick
        const progress = (timestamp - this.lastTickTime) / beatDuration;
        const maxAngle = Math.PI / 6; // 30 degrees

        this.pendulumAngle = maxAngle * Math.sin(Math.PI * progress) * this.pendulumDirection;
    }

    private playTick(): void {
        if (!this.audioContext || (this.audioContext.state === 'suspended')) {
            this.audioContext?.resume();
            return;
        }

        // Choose buffer based on whether it's the first beat
        const isFirstBeat = this.currentBeat === 0;
        const buffer = isFirstBeat && this.options.accentFirstBeat ? this.accentBuffer : this.tickBuffer;

        if (!buffer) return;

        // Create source
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // Create gain node
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.0;

        // Connect
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Play
        source.start();
    }

    public override render(): void {
        if (!this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Apply background
        // this.applyBackground(ctx);

        // Draw metronome based on visual mode
        switch (this.options.visualMode) {
            case 'pendulum':
                this.drawPendulum(ctx);
                break;
            case 'bar':
                this.drawBar(ctx);
                break;
            case 'dot':
                this.drawDot(ctx);
                break;
        }

        // Draw tempo and time signature if enabled
        this.drawText(ctx);
    }

    private drawPendulum(ctx: CanvasRenderingContext2D): void {
        const { width, height, pendulumLength, pendulumColor, tickColor, accentColor } = this.options;

        // Calculate center position
        const centerX = width / 2;
        const bottomY = height * 0.8;

        // Draw base
        ctx.beginPath();
        ctx.moveTo(centerX - 50, bottomY);
        ctx.lineTo(centerX + 50, bottomY);
        ctx.lineTo(centerX + 40, bottomY + 20);
        ctx.lineTo(centerX - 40, bottomY + 20);
        ctx.closePath();
        ctx.fillStyle = tickColor;
        ctx.fill();

        // Draw pendulum rod
        ctx.save();
        ctx.translate(centerX, bottomY);
        ctx.rotate(this.pendulumAngle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -pendulumLength);
        ctx.strokeStyle = pendulumColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw pendulum weight
        ctx.beginPath();
        ctx.ellipse(0, -pendulumLength * 0.7, 15, 30, 0, 0, Math.PI * 2);
        ctx.fillStyle = pendulumColor;
        ctx.fill();

        ctx.restore();

        // Draw tick marks
        const tickCount = this.options.timeSignature.numerator;
        const tickWidth = width * 0.6;
        const tickSpacing = tickWidth / (tickCount - 1);
        const tickStartX = centerX - tickWidth / 2;
        const tickY = bottomY - pendulumLength * 0.9;

        for (let i = 0; i < tickCount; i++) {
            const isFirstBeat = i === 0;
            const tickHeight = isFirstBeat ? 15 : 10;
            const x = tickStartX + i * tickSpacing;

            ctx.beginPath();
            ctx.moveTo(x, tickY - tickHeight / 2);
            ctx.lineTo(x, tickY + tickHeight / 2);
            ctx.strokeStyle = isFirstBeat ? accentColor : tickColor;
            ctx.lineWidth = isFirstBeat ? 3 : 2;
            ctx.stroke();
        }
    }

    private drawBar(ctx: CanvasRenderingContext2D): void {
        const { width, height, tickColor, accentColor } = this.options;

        const barHeight = 40;
        const barY = height / 2 - barHeight / 2;
        const barPadding = width * 0.1;
        const barWidth = width - barPadding * 2;

        // Draw background bar
        ctx.fillStyle = '#EEEEEE';
        ctx.fillRect(barPadding, barY, barWidth, barHeight);

        // Draw beat markers
        const beatCount = this.options.timeSignature.numerator;
        const beatWidth = barWidth / beatCount;

        for (let i = 0; i < beatCount; i++) {
            const isFirstBeat = i === 0;
            const x = barPadding + i * beatWidth;

            // Draw beat separator
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(x, barY);
                ctx.lineTo(x, barY + barHeight);
                ctx.strokeStyle = '#DDDDDD';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw beat number
            ctx.fillStyle = isFirstBeat ? accentColor : tickColor;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((i + 1).toString(), x + beatWidth / 2, barY + barHeight / 2);
        }

        // Draw current beat indicator
        if (this.options.isPlaying) {
            const indicatorX = barPadding + this.currentBeat * beatWidth;
            ctx.fillStyle = 'rgba(30, 144, 255, 0.3)';
            ctx.fillRect(indicatorX, barY, beatWidth, barHeight);
        }
    }

    private drawDot(ctx: CanvasRenderingContext2D): void {
        const { width, height, tickColor, accentColor } = this.options;

        const centerY = height / 2;
        const dotRadius = 15;
        const dotSpacing = dotRadius * 3;
        const beatCount = this.options.timeSignature.numerator;

        // Calculate total width needed for dots
        const totalWidth = (beatCount - 1) * dotSpacing + dotRadius * 2;
        const startX = (width - totalWidth) / 2;

        // Draw dots
        for (let i = 0; i < beatCount; i++) {
            const isFirstBeat = i === 0;
            const isCurrentBeat = i === this.currentBeat && this.options.isPlaying;
            const x = startX + i * dotSpacing + dotRadius;

            ctx.beginPath();
            ctx.arc(x, centerY, dotRadius, 0, Math.PI * 2);

            if (isCurrentBeat) {
                // Current beat is filled
                ctx.fillStyle = isFirstBeat ? accentColor : tickColor;
                ctx.fill();
            } else {
                // Other beats are hollow
                ctx.strokeStyle = isFirstBeat ? accentColor : tickColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    private drawText(ctx: CanvasRenderingContext2D): void {
        const { width, height, textColor, tempo, timeSignature, showTempo, showTimeSignature } = this.options;

        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';

        // Draw tempo
        if (showTempo) {
            ctx.font = 'bold 24px Arial';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${tempo} BPM`, width / 2, height * 0.3);
        }

        // Draw time signature
        if (showTimeSignature) {
            ctx.font = 'bold 18px Arial';
            ctx.textBaseline = 'top';
            ctx.fillText(`${timeSignature.numerator}/${timeSignature.denominator}`, width / 2, height * 0.85);
        }
    }

    public start(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.options.isPlaying = true;
        this.lastTickTime = performance.now();
        this.currentBeat = this.options.timeSignature.numerator - 1; // Start just before first beat
    }

    public stop(): void {
        this.options.isPlaying = false;
    }

    public toggle(): void {
        if (this.options.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    public setTempo(tempo: number): void {
        const { min, max } = this.options.tempoRange;
        this.options.tempo = Math.max(min, Math.min(max, tempo));
    }

    public setTimeSignature(numerator: number, denominator: number): void {
        this.options.timeSignature = { numerator, denominator };
        this.currentBeat = this.currentBeat % numerator;
    }

    public override dispose(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        super.dispose();
    }
}