// visualization/audioSpectrum.ts
import {Visualizer, VisualizationOptions, DEFAULT_VISUALIZATION_OPTIONS} from './visualizer';

export interface AudioSpectrumOptions extends VisualizationOptions {
    barCount: number;
    barSpacing: number;
    barColor: string;
    peakColor: string;
    minFrequency: number;
    maxFrequency: number;
    minDecibels: number;
    maxDecibels: number;
    smoothingTimeConstant: number;
    showPeaks: boolean;
    peakFalloffSpeed: number;
}

export const DEFAULT_AUDIO_SPECTRUM_OPTIONS: AudioSpectrumOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    barCount: 128,
    barSpacing: 2,
    barColor: '#61dafb',
    peakColor: '#ff6b6b',
    minFrequency: 20,    // 20Hz
    maxFrequency: 20000, // 20kHz
    minDecibels: -100,
    maxDecibels: -30,
    smoothingTimeConstant: 0.85,
    showPeaks: true,
    peakFalloffSpeed: 1.0
};

export class AudioSpectrum extends Visualizer {
    private options: AudioSpectrumOptions;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private source: MediaElementAudioSourceNode | AudioBufferSourceNode | null = null;
    private dataArray: Uint8Array | null = null;
    private peaks: number[] = [];
    private animationFrameId: number | null = null;

    constructor(canvas: string, options: Partial<AudioSpectrumOptions> = {}) {
        super(canvas, options);
        this.options = {...DEFAULT_AUDIO_SPECTRUM_OPTIONS, ...options};
        this.peaks = new Array(this.options.barCount).fill(0);
    }

    // Connect to audio element (e.g., <audio> or <video>)
    public connectToAudioElement(audioElement: HTMLMediaElement): void {
        // Disconnect any existing sources
        this.disconnect();

        // Create audio context
        this.audioContext = new AudioContext();

        // Create analyzer
        this.analyser = this.audioContext.createAnalyser();
        this.configureAnalyser();

        // Create source from audio element
        this.source = this.audioContext.createMediaElementSource(audioElement);
        this.source.connect(this.analyser);

        // Connect to destination (speakers)
        this.analyser.connect(this.audioContext.destination);

        // Create data array for frequency data
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        // Start animation
        this.startAnimation();
    }

    // Connect to audio buffer
    public connectToAudioBuffer(buffer: AudioBuffer): void {
        // Disconnect any existing sources
        this.disconnect();

        // Create audio context
        this.audioContext = new AudioContext();

        // Create analyzer
        this.analyser = this.audioContext.createAnalyser();
        this.configureAnalyser();

        // Create source from buffer
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = buffer;
        this.source.connect(this.analyser);

        // Connect to destination (speakers)
        this.analyser.connect(this.audioContext.destination);

        // Create data array for frequency data
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        // Start audio
        this.source.start(0);

        // Start animation
        this.startAnimation();
    }

    // Connect to microphone input
    public async connectToMicrophone(): Promise<void> {
        // Disconnect any existing sources
        this.disconnect();

        try {
            // Get microphone stream
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});

            // Create audio context
            this.audioContext = new AudioContext();

            // Create analyzer
            this.analyser = this.audioContext.createAnalyser();
            this.configureAnalyser();

            // Create source from microphone stream
            this.source = this.audioContext.createMediaStreamSource(stream);
            this.source.connect(this.analyser);

            // Note: We don't connect to destination for microphone input to avoid feedback

            // Create data array for frequency data
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Start animation
            this.startAnimation();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw error;
        }
    }

    private configureAnalyser(): void {
        if (!this.analyser) return;

        const {
            barCount,
            minDecibels,
            maxDecibels,
            smoothingTimeConstant
        } = this.options;

        this.analyser.fftSize = barCount * 2;
        this.analyser.minDecibels = minDecibels;
        this.analyser.maxDecibels = maxDecibels;
        this.analyser.smoothingTimeConstant = smoothingTimeConstant;
    }

    private startAnimation(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const animate = () => {
            this.updateData();
            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    private updateData(): void {
        if (!this.analyser || !this.dataArray) return;

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);

        // Update peaks
        const {peakFalloffSpeed, showPeaks} = this.options;

        if (showPeaks) {
            for (let i = 0; i < this.dataArray.length; i++) {
                if (this.dataArray[i] > this.peaks[i]) {
                    this.peaks[i] = this.dataArray[i];
                } else {
                    this.peaks[i] = Math.max(0, this.peaks[i] - peakFalloffSpeed);
                }
            }
        }
    }

    private getFrequencyAtIndex(index: number): number {
        if (!this.audioContext) return 0;

        const {barCount, minFrequency, maxFrequency} = this.options;

        // Use logarithmic scale for frequency mapping
        const minLog = Math.log(minFrequency);
        const maxLog = Math.log(maxFrequency);
        const scale = (maxLog - minLog) / barCount;

        return Math.exp(minLog + scale * index);
    }

    private drawBars(): void {
        if (!this.dataArray) return;

        const {
            width,
            height,
            barCount,
            barSpacing,
            barColor,
            peakColor,
            showPeaks
        } = this.options;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Calculate bar width
        const barWidth = (width / barCount) - barSpacing;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw each bar
        for (let i = 0; i < barCount; i++) {
            const value = this.dataArray[i] || 0;
            const percent = value / 255;
            const barHeight = percent * height;
            const x = i * (barWidth + barSpacing);
            const y = height - barHeight;

            // Draw bar
            ctx.fillStyle = barColor;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw peak if enabled
            if (showPeaks && this.peaks[i]) {
                const peakPercent = this.peaks[i] / 255;
                const peakY = height - (peakPercent * height);

                ctx.fillStyle = peakColor;
                ctx.fillRect(x, peakY, barWidth, 2);
            }
        }
    }

    public render(): void {
        if (!this.canvas || !this.dataArray) return;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Apply background
        this.applyBackground(ctx);

        // Draw frequency bars
        this.drawBars();
    }

    public disconnect(): void {
        // Stop animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Disconnect and close audio context
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }

        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }

        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.dataArray = null;
    }

    public updateOptions(options: Partial<AudioSpectrumOptions>): void {
        this.options = {...this.options, ...options};

        // Update analyser configuration if it exists
        if (this.analyser) {
            this.configureAnalyser();
        }

        // Resize peaks array if bar count changed
        if (options.barCount && options.barCount !== this.peaks.length) {
            this.peaks = new Array(options.barCount).fill(0);
        }
    }

    public destroy(): void {
        this.disconnect();
        super.destroy();
    }
}