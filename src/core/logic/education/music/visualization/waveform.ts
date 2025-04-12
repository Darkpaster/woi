import {Visualizer, VisualizationOptions, DEFAULT_VISUALIZATION_OPTIONS} from './visualizer';
import { Melody } from '../composition/melodyGenerator';

export interface WaveformOptions extends VisualizationOptions {
    waveColor: string;
    gridColor: string;
    markerColor: string;
    showGrid: boolean;
    timeWindow: number; // in seconds
    amplitudeScale: number; // scale factor for the amplitude
}

export const DEFAULT_WAVEFORM_OPTIONS: WaveformOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    waveColor: '#61dafb',
    gridColor: '#555555',
    markerColor: '#ff6b6b',
    showGrid: true,
    timeWindow: 5, // 5 seconds of audio
    amplitudeScale: 1.0
};

export interface WaveformData {
    samples: number[];      // Audio samples (normalized to -1 to 1)
    sampleRate: number;     // Samples per second
    markers?: number[];     // Optional time markers in seconds
    labels?: string[];      // Optional labels for markers
}

export class Waveform extends Visualizer {
    private options: WaveformOptions;
    private data: WaveformData | null = null;

    constructor(canvas: HTMLCanvasElement, options: Partial<WaveformOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_WAVEFORM_OPTIONS, ...options };
    }

    public update(data: WaveformData): void {
        this.data = data;
        this.render();
    }

    private sampleToY(sample: number): number {
        const { height, amplitudeScale } = this.options;

        // Scale the amplitude
        sample *= amplitudeScale;

        // Clamp to -1 to 1
        sample = Math.max(-1, Math.min(1, sample));

        // Map -1 to 1 to canvas height (center line at height/2)
        return (height / 2) * (1 - sample);
    }

    private timeToX(time: number): number {
        const { width, timeWindow } = this.options;

        // Normalize to 0-1 range
        const normalizedTime = time / timeWindow;

        // Map to canvas width
        return normalizedTime * width;
    }

    public render(): void {
        const { width, height, showGrid, gridColor, waveColor, markerColor } = this.options;

        this.clearCanvas();

        // Draw center line and grid
        if (showGrid) {
            this.drawGrid();
        }

        // Draw center line
        this.drawLine(0, height / 2, width, height / 2, gridColor, 1);

        // Return early if no data
        if (!this.data) {
            this.drawText("No waveform data available", width / 2 - 100, height / 2 - 20);
            return;
        }

        const { samples, sampleRate, markers, labels } = this.data;

        // Calculate samples per pixel
        const timeWindow = this.options.timeWindow;
        const totalSamples = Math.min(samples.length, timeWindow * sampleRate);
        const samplesPerPixel = totalSamples / width;

        // Draw waveform
        this.ctx.beginPath();
        this.ctx.strokeStyle = waveColor;
        this.ctx.lineWidth = 1;

        let lastX = 0;
        let lastY = this.sampleToY(samples[0] || 0);

        this.ctx.moveTo(lastX, lastY);

        // Draw optimized waveform by averaging samples
        for (let i = 1; i < width; i++) {
            const startSample = Math.floor(i * samplesPerPixel);
            const endSample = Math.floor((i + 1) * samplesPerPixel);

            let minSample = 1;
            let maxSample = -1;

            // Find min and max in this pixel range
            for (let j = startSample; j < endSample && j < samples.length; j++) {
                minSample = Math.min(minSample, samples[j]);
                maxSample = Math.max(maxSample, samples[j]);
            }

            // Draw vertical line from min to max
            const minY = this.sampleToY(minSample);
            const maxY = this.sampleToY(maxSample);

            this.ctx.moveTo(i, minY);
            this.ctx.lineTo(i, maxY);
        }

        this.ctx.stroke();

        // Draw markers
        if (markers && markers.length > 0) {
            this.drawMarkers(markers, labels);
        }
    }

    private drawGrid(): void {
        const { width, height, gridColor, timeWindow } = this.options;

        // Draw horizontal grid lines
        const horizontalLines = 4; // Number of divisions above and below center
        for (let i = 1; i <= horizontalLines; i++) {
            const y = (height / 2) * (1 - i / horizontalLines);
            this.drawLine(0, y, width, y, gridColor, 0.5);

            const yBelow = (height / 2) * (1 + i / horizontalLines);
            this.drawLine(0, yBelow, width, yBelow, gridColor, 0.5);
        }

        // Draw vertical grid lines (time divisions)
        const timeStep = timeWindow / 10;
        for (let t = 0; t <= timeWindow; t += timeStep) {
            const x = this.timeToX(t);
            this.drawLine(x, 0, x, height, gridColor, 0.5);

            // Draw time label
            if (t > 0) { // Skip 0 to avoid clutter with y-axis
                this.drawText(`${t.toFixed(1)}s`, x - 15, height - 10, gridColor);
            }
        }

        // Draw amplitude labels
        for (let i = 1; i <= horizontalLines; i++) {
            const amplitude = i / horizontalLines;
            const y = (height / 2) * (1 - i / horizontalLines);
            this.drawText(`${amplitude.toFixed(1)}`, 5, y - 5, gridColor);

            const yBelow = (height / 2) * (1 + i / horizontalLines);
            this.drawText(`-${amplitude.toFixed(1)}`, 5, yBelow - 5, gridColor);
        }

        // Draw title
        this.drawText("Waveform", width / 2 - 30, 20);
    }

    private drawMarkers(markers: number[], labels?: string[]): void {
        const { height, markerColor } = this.options;

        for (let i = 0; i < markers.length; i++) {
            const time = markers[i];
            const x = this.timeToX(time);

            // Draw vertical line for marker
            this.drawLine(x, 0, x, height, markerColor, 1);

            // Draw label if available
            if (labels && labels[i]) {
                this.drawText(labels[i], x + 5, 20, markerColor);
            } else {
                this.drawText(`${time.toFixed(2)}s`, x + 5, 20, markerColor);
            }
        }
    }

    // Create waveform from audio buffer
    public static fromAudioBuffer(
        canvas: HTMLCanvasElement,
        audioBuffer: AudioBuffer,
        options: Partial<WaveformOptions> = {}
    ): Waveform {
        const waveform = new Waveform(canvas, options);

        // Get audio data
        const channel = audioBuffer.getChannelData(0); // Use first channel
        const sampleRate = audioBuffer.sampleRate;

        // Create data object
        const data: WaveformData = {
            samples: Array.from(channel),
            sampleRate: sampleRate
        };

        waveform.update(data);
        return waveform;
    }

    // Create waveform from melody
    public static fromMelody(
        canvas: HTMLCanvasElement,
        melody: Melody,
        options: Partial<WaveformOptions> = {}
    ): Waveform {
        const waveform = new Waveform(canvas, options);

        // Synthesize audio from melody
        const sampleRate = 44100;
        const duration = melody.getDurationInSeconds();
        const numSamples = Math.ceil(duration * sampleRate);

        // Create empty samples array
        const samples = new Array(numSamples).fill(0);

        // Create markers for note onsets
        const markers: number[] = [];
        const labels: string[] = [];

        let currentTime = 0;

        // Generate waveform for each note
        for (const note of melody.notes) {
            if (!note.isRest) {
                // Add marker for note onset
                markers.push(currentTime);
                labels.push(note.note.name);

                // Generate simple sine wave for this note
                const frequency = note.note.getFrequency();
                const noteDuration = note.rhythmicValue.getDurationInQuarterNotes() * 60 / melody.rhythm.tempo;
                const amplitude = note.velocity / 127; // Normalize velocity to 0-1

                const startSample = Math.floor(currentTime * sampleRate);
                const endSample = Math.floor((currentTime + noteDuration) * sampleRate);

                // Simple attack/decay envelope
                const attackTime = 0.01; // 10ms attack
                const decayTime = 0.1;   // 100ms decay
                const attackSamples = Math.floor(attackTime * sampleRate);
                const decaySamples = Math.floor(decayTime * sampleRate);

                for (let i = startSample; i < endSample && i < samples.length; i++) {
                    const t = (i - startSample) / sampleRate;

                    // Apply envelope
                    let env = 1.0;
                    if (i - startSample < attackSamples) {
                        env = (i - startSample) / attackSamples; // Linear attack
                    } else if (endSample - i < decaySamples) {
                        env = (endSample - i) / decaySamples; // Linear decay
                    }

                    // Generate sine wave
                    const value = amplitude * env * Math.sin(2 * Math.PI * frequency * t);

                    // Mix with existing samples
                    samples[i] += value;
                }
            }

            // Update current time
            currentTime += note.rhythmicValue.getDurationInQuarterNotes() * 60 / melody.rhythm.tempo;
        }

        // Normalize samples to -1 to 1 range
        const maxAmplitude = Math.max(...samples.map(s => Math.abs(s)));
        const normalizedSamples = samples.map(s => s / (maxAmplitude || 1));

        // Create data object
        const data: WaveformData = {
            samples: normalizedSamples,
            sampleRate: sampleRate,
            markers: markers,
            labels: labels
        };

        waveform.update(data);
        return waveform;
    }
}