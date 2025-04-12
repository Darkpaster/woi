// visualization/spectrogram.ts
import {Visualizer, VisualizationOptions, DEFAULT_VISUALIZATION_OPTIONS} from './visualizer';

export interface SpectrogramOptions extends VisualizationOptions {
    minFrequency: number;
    maxFrequency: number;
    dbRange: number;
    colorMap: string[];
    timeWindow: number; // in seconds
}

export const DEFAULT_SPECTROGRAM_OPTIONS: SpectrogramOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    minFrequency: 20,    // 20Hz
    maxFrequency: 20000, // 20kHz
    dbRange: 96,         // -96dB to 0dB
    colorMap: [
        '#000000', // -96dB (silence)
        '#0000FF', // low intensity
        '#00FFFF',
        '#00FF00',
        '#FFFF00',
        '#FF0000'  // 0dB (maximum intensity)
    ],
    timeWindow: 5        // 5 seconds of audio
};

export interface SpectrogramData {
    frequencies: number[];
    times: number[];
    magnitudes: number[][]; // 2D array: magnitudes[timeIndex][frequencyIndex]
}

export class Spectrogram extends Visualizer {
    private options: SpectrogramOptions;
    private data: SpectrogramData | null = null;

    constructor(canvas: HTMLCanvasElement, options: Partial<SpectrogramOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_SPECTROGRAM_OPTIONS, ...options };
    }

    public update(data: SpectrogramData): void {
        this.data = data;
        this.render();
    }

    private getColorForMagnitude(magnitude: number): string {
        const { dbRange, colorMap } = this.options;

        // Normalize magnitude to 0-1 range
        // Magnitude is expected to be in dB, ranging from -dbRange to 0
        const normalizedMagnitude = (magnitude + dbRange) / dbRange;

        // Clamp to 0-1 range
        const clampedMagnitude = Math.max(0, Math.min(1, normalizedMagnitude));

        // Map to color
        const colorIndex = clampedMagnitude * (colorMap.length - 1);
        const lowerIndex = Math.floor(colorIndex);
        const upperIndex = Math.ceil(colorIndex);

        if (lowerIndex === upperIndex) {
            return colorMap[lowerIndex];
        }

        // Interpolate between colors
        const t = colorIndex - lowerIndex;
        return this.interpolateColor(colorMap[lowerIndex], colorMap[upperIndex], t);
    }

    private interpolateColor(color1: string, color2: string, t: number): string {
        // Parse colors
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);

        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);

        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    private frequencyToY(frequency: number): number {
        const { height, minFrequency, maxFrequency } = this.options;

        // Use logarithmic scale for frequencies
        const logMin = Math.log(minFrequency);
        const logMax = Math.log(maxFrequency);
        const logFreq = Math.log(frequency);

        // Normalize to 0-1 range (inverted, as y increases downward)
        const normalizedFreq = 1 - (logFreq - logMin) / (logMax - logMin);

        // Map to canvas height
        return normalizedFreq * height;
    }

    private timeToX(time: number): number {
        const { width, timeWindow } = this.options;

        // Normalize to 0-1 range
        const normalizedTime = time / timeWindow;

        // Map to canvas width
        return normalizedTime * width;
    }

    public render(): void {
        const { width, height, minFrequency, maxFrequency } = this.options;

        this.clearCanvas();

        // Draw axes and labels
        this.drawAxes();

        // Return early if no data
        if (!this.data) {
            this.drawText("No spectrogram data available", width/2 - 100, height/2);
            return;
        }

        const { frequencies, times, magnitudes } = this.data;

        // Calculate pixel width for each time bin
        const timeStep = width / times.length;

        // Draw spectrogram
        for (let t = 0; t < times.length; t++) {
            const x = this.timeToX(times[t]);

            for (let f = 0; f < frequencies.length; f++) {
                const y = this.frequencyToY(frequencies[f]);
                const magnitude = magnitudes[t][f];
                const color = this.getColorForMagnitude(magnitude);

                // Draw a small rectangle for this time-frequency bin
                const nextY = f < frequencies.length - 1 ?
                    this.frequencyToY(frequencies[f + 1]) :
                    this.frequencyToY(frequencies[f] * 1.1); // Estimate for the last bin

                const height = Math.abs(nextY - y);
                this.drawRectangle(x, y, timeStep, height, color);
            }
        }
    }

    private drawAxes(): void {
        const { width, height, minFrequency, maxFrequency, timeWindow } = this.options;

        // Draw time axis (x-axis)
        this.drawLine(0, height - 1, width, height - 1);
        for (let t = 0; t <= timeWindow; t += timeWindow / 5) {
            const x = this.timeToX(t);
            this.drawLine(x, height - 5, x, height);
            this.drawText(`${t.toFixed(1)}s`, x - 15, height - 10);
        }

        // Draw frequency axis (y-axis)
        this.drawLine(0, 0, 0, height);

        // Draw frequency labels at logarithmic intervals
        const freqLabels = [100, 500, 1000, 5000, 10000];
        for (const freq of freqLabels) {
            if (freq >= minFrequency && freq <= maxFrequency) {
                const y = this.frequencyToY(freq);
                this.drawLine(0, y, 5, y);
                const freqText = freq >= 1000 ? `${(freq/1000).toFixed(0)}kHz` : `${freq}Hz`;
                this.drawText(freqText, 8, y + 4);
            }
        }

        // Draw title
        this.drawText("Spectrogram", width / 2 - 40, 20);
    }

    // Process audio data to generate spectrogram
    public static async fromAudioBuffer(
        canvas: HTMLCanvasElement,
        audioBuffer: AudioBuffer,
        options: Partial<SpectrogramOptions> = {}
    ): Promise<Spectrogram> {
        const spectrogram = new Spectrogram(canvas, options);

        // Process audio data
        const fftSize = 2048;
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);

        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;

        // Calculate time and frequency steps
        const timeStep = 0.05; // 50ms per time bin
        const numTimeSteps = Math.ceil(duration / timeStep);

        // Prepare data structures
        const frequencies: number[] = [];
        const times: number[] = [];
        const magnitudes: number[][] = [];

        // Calculate frequency bins
        const frequencyBinCount = analyser.frequencyBinCount;
        const nyquist = sampleRate / 2;

        for (let i = 0; i < frequencyBinCount; i++) {
            const frequency = i * nyquist / frequencyBinCount;
            frequencies.push(frequency);
        }

        // Offline processing - simulate playing the audio
        const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            sampleRate
        );

        const offlineSource = offlineContext.createBufferSource();
        offlineSource.buffer = audioBuffer;

        const offlineAnalyser = offlineContext.createAnalyser();
        offlineAnalyser.fftSize = fftSize;
        offlineSource.connect(offlineAnalyser);
        offlineAnalyser.connect(offlineContext.destination);

        offlineSource.start(0);

        // Process in chunks
        for (let t = 0; t < numTimeSteps; t++) {
            const currentTime = t * timeStep;
            times.push(currentTime);

            const dataArray = new Uint8Array(offlineAnalyser.frequencyBinCount);

            // Schedule the analysis
            offlineContext.suspend(currentTime).then(() => {
                offlineAnalyser.getByteFrequencyData(dataArray);
                offlineContext.resume();
            });

            // Convert to dB
            const magnitudesAtTime = Array.from(dataArray).map(value => {
                // Convert from 0-255 to -options.dbRange to 0 dB
                return (value / 255 * options.dbRange) - options.dbRange;
            });

            magnitudes.push(magnitudesAtTime);
        }

        // Start rendering
        await offlineContext.startRendering();

        // Update the spectrogram with the data
        spectrogram.update({ frequencies, times, magnitudes });

        return spectrogram;
    }
}