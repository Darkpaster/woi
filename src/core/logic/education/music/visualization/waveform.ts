import { Visualizer, VisualizationOptions, DEFAULT_VISUALIZATION_OPTIONS } from './visualizer';

export interface WaveformOptions extends VisualizationOptions {
    waveColor: string;
    progressColor: string;
    cursorColor: string;
    barWidth: number;
    barGap: number;
    normalize: boolean;
    showAxis: boolean;
    showTimeLabels: boolean;
    showPlayhead: boolean;
    timeLabelInterval: number; // seconds
    barRadius: number;
    interactive: boolean;
}

export const DEFAULT_WAVEFORM_OPTIONS: WaveformOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    waveColor: '#4FA3D1',
    progressColor: '#61DAFB',
    cursorColor: '#FF0000',
    barWidth: 2,
    barGap: 1,
    normalize: true,
    showAxis: true,
    showTimeLabels: true,
    showPlayhead: true,
    timeLabelInterval: 1,
    barRadius: 1,
    interactive: true
};

export class Waveform extends Visualizer {
    private options: WaveformOptions;
    private audioBuffer: AudioBuffer | null = null;
    private peaks: Float32Array | null = null;
    private isPlaying: boolean = false;
    private playbackStartTime: number | null = null;
    private currentTime: number = 0;
    private duration: number = 0;
    private audioContext: AudioContext | null = null;
    private audioSource: AudioBufferSourceNode | null = null;
    private animationFrameId: number | null = null;

    constructor(canvasId: string, options: Partial<WaveformOptions> = {}) {
        super(canvasId, options);
        this.options = { ...DEFAULT_WAVEFORM_OPTIONS, ...options };

        this.setupEventListeners();
        this.startAnimation();
    }

    private setupEventListeners(): void {
        if (this.options.interactive) {
            this.canvas.addEventListener('click', this.handleClick.bind(this));
            this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        }
    }

    private removeEventListeners(): void {
        if (this.options.interactive) {
            this.canvas.removeEventListener('click', this.handleClick.bind(this));
            this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        }
    }

    public async loadAudioFile(file: File | Blob | string): Promise<void> {
        try {
            let arrayBuffer: ArrayBuffer;

            if (typeof file === 'string') {
                // Load from URL
                const response = await fetch(file);
                arrayBuffer = await response.arrayBuffer();
            } else {
                // Load from File or Blob
                arrayBuffer = await file.arrayBuffer();
            }

            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }

            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.duration = this.audioBuffer.duration;

            this.computePeaks();
            this.render();
        } catch (error) {
            console.error('Error loading audio file:', error);
        }
    }

    private computePeaks(): void {
        if (!this.audioBuffer) return;

        const numberOfChannels = this.audioBuffer.numberOfChannels;
        const length = this.audioBuffer.length;
        const sampleRate = this.audioBuffer.sampleRate;

        // Calculate how many samples to include in each bar
        const barCount = Math.floor(this.canvas.width / (this.options.barWidth + this.options.barGap));
        const samplesPerBar = Math.floor(length / barCount);

        // Create an array to hold the peak values
        const peaks = new Float32Array(barCount);

        // Process each channel and take the maximum value
        for (let c = 0; c < numberOfChannels; c++) {
            const channelData = this.audioBuffer.getChannelData(c);

            for (let b = 0; b < barCount; b++) {
                const start = b * samplesPerBar;
                const end = start + samplesPerBar;
                let max = 0;

                for (let i = start; i < end; i++) {
                    const value = Math.abs(channelData[i]);
                    if (value > max) {
                        max = value;
                    }
                }

                // Take the maximum of all channels
                if (max > peaks[b] || c === 0) {
                    peaks[b] = max;
                }
            }
        }

        // Normalize if required
        if (this.options.normalize) {
            let maxPeak = 0;
            for (let i = 0; i < peaks.length; i++) {
                if (peaks[i] > maxPeak) {
                    maxPeak = peaks[i];
                }
            }

            if (maxPeak > 0) {
                for (let i = 0; i < peaks.length; i++) {
                    peaks[i] /= maxPeak;
                }
            }
        }

        this.peaks = peaks;
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

                this.currentTime = (timestamp - this.playbackStartTime) / 1000;

                // Check if playback has reached the end
                if (this.currentTime >= this.duration) {
                    this.stop();
                }
            }

            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    public render(): void {
        const ctx = this.canvas.getContext('2d');
        if (!ctx || !this.peaks) return;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw axis if enabled
        if (this.options.showAxis) {
            this.drawAxis(ctx);
        }

        // Draw time labels if enabled
        if (this.options.showTimeLabels) {
            this.drawTimeLabels(ctx);
        }

        // Draw waveform
        this.drawWaveform(ctx);

        // Draw playhead if enabled
        if (this.options.showPlayhead && this.isPlaying) {
            this.drawPlayhead(ctx);
        }
    }

    private drawAxis(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;

        // Draw center line
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height / 2);
        ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        ctx.stroke();
    }

    private drawTimeLabels(ctx: CanvasRenderingContext2D): void {
        if (!this.audioBuffer) return;

        ctx.fillStyle = '#888';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        const duration = this.audioBuffer.duration;
        const interval = this.options.timeLabelInterval;
        const labels = Math.floor(duration / interval);

        for (let i = 0; i <= labels; i++) {
            const time = i * interval;
            const x = (time / duration) * this.canvas.width;

            // Draw time marker
            ctx.fillText(this.formatTime(time), x, this.canvas.height - 5);

            // Draw vertical line
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height - 15);
            ctx.stroke();
        }
    }

    private drawWaveform(ctx: CanvasRenderingContext2D): void {
        if (!this.peaks || !this.audioBuffer) return;

        const height = this.canvas.height;
        const centerY = height / 2;
        const barCount = this.peaks.length;

        // Calculate playback progress ratio
        const progressRatio = this.currentTime / this.audioBuffer.duration;
        const progressX = progressRatio * this.canvas.width;

        for (let i = 0; i < barCount; i++) {
            const x = i * (this.options.barWidth + this.options.barGap);
            const amplitude = this.peaks[i];
            const barHeight = amplitude * (height - 20); // Leave room for labels

            // Determine if the bar is before or after the playhead
            const isBeforePlayhead = x < progressX;
            ctx.fillStyle = isBeforePlayhead ? this.options.progressColor : this.options.waveColor;

            // Draw bar from center
            const barTop = centerY - (barHeight / 2);

            if (this.options.barRadius > 0) {
                this.roundedRect(
                    ctx,
                    x,
                    barTop,
                    this.options.barWidth,
                    barHeight,
                    this.options.barRadius
                );
            } else {
                ctx.fillRect(x, barTop, this.options.barWidth, barHeight);
            }
        }
    }

    private drawPlayhead(ctx: CanvasRenderingContext2D): void {
        if (!this.audioBuffer) return;

        const x = (this.currentTime / this.audioBuffer.duration) * this.canvas.width;

        ctx.strokeStyle = this.options.cursorColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvas.height);
        ctx.stroke();
    }

    // Utility methods
    private roundedRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
    }

    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    private handleClick(event: MouseEvent): void {
        if (!this.audioBuffer) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const clickRatio = x / this.canvas.width;

        const newTime = clickRatio * this.audioBuffer.duration;
        this.seekTo(newTime);
    }

    private handleMouseMove(event: MouseEvent): void {
        // Could be used to show time tooltip on hover
    }

    // Playback control methods
    public play(): void {
        if (!this.audioBuffer || !this.audioContext) return;

        // Stop any existing playback
        this.stop();

        // Create a new source
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;
        this.audioSource.connect(this.audioContext.destination);

        // Start playback from current time
        this.audioSource.start(0, this.currentTime);
        this.playbackStartTime = performance.now() - (this.currentTime * 1000);
        this.isPlaying = true;
    }

    public pause(): void {
        if (!this.audioSource) return;

        this.audioSource.stop();
        this.audioSource = null;
        this.isPlaying = false;
    }

    public stop(): void {
        this.pause();
        this.currentTime = 0;
        this.playbackStartTime = null;
    }

    public togglePlayback(): void {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    public seekTo(time: number): void {
        this.currentTime = Math.max(0, Math.min(time, this.duration));

        if (this.isPlaying) {
            this.pause();
            this.play();
        }

        this.render();
    }

    // Cleanup method
    public destroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }

        if (this.audioSource) {
            this.audioSource.stop();
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.removeEventListeners();
        super.destroy();
    }
}