import {DEFAULT_VISUALIZATION_OPTIONS, VisualizationOptions, Visualizer} from "./visualizer.ts";

export interface TunerOptions extends VisualizationOptions {
    showFrequency: boolean;
    showNote: boolean;
    showCents: boolean;
    referencePitch: number; // A4 in Hz
    autoDetect: boolean;
    minFrequency: number;
    maxFrequency: number;
    noteColor: string;
    tuningColor: string;
    detunedColor: string;
    textColor: string;
    dialSize: number;
    detectionThreshold: number;
}

export const DEFAULT_TUNER_OPTIONS: TunerOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    showFrequency: true,
    showNote: true,
    showCents: true,
    referencePitch: 440,
    autoDetect: true,
    minFrequency: 50,
    maxFrequency: 2000,
    noteColor: '#1E90FF',
    tuningColor: '#32CD32',
    detunedColor: '#FF6347',
    textColor: '#000000',
    dialSize: 150,
    detectionThreshold: 0.9
};

export class Tuner extends Visualizer {
    private options: TunerOptions;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private mediaStream: MediaStream | null = null;
    private currentFrequency: number = 0;
    private currentNote: string = '';
    private currentCents: number = 0;
    private isListening: boolean = false;
    private animationFrameId: number | null = null;

    constructor(canvas: HTMLCanvasElement, options: Partial<TunerOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_TUNER_OPTIONS, ...options };

        if (this.options.autoDetect) {
            this.startListening();
        }
    }

    public async startListening(): Promise<void> {
        if (this.isListening) return;

        try {
            // Create audio context if needed
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }

            // Resume if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Get microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false
                }
            });

            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            // Connect microphone to analyser
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);

            // Start analysis loop
            this.isListening = true;
            this.startAnalysis();
        } catch (error) {
            console.error('Error starting microphone:', error);
        }
    }

    public stopListening(): void {
        if (!this.isListening) return;
// Stop animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Stop and disconnect media stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        this.isListening = false;
    }

    private startAnalysis(): void {
        if (!this.isListening || !this.analyser) return;

        const analyze = () => {
            // Detect pitch
            this.detectPitch();

            // Render visualization
            this.render();

            // Schedule next frame
            this.animationFrameId = requestAnimationFrame(analyze);
        };

        this.animationFrameId = requestAnimationFrame(analyze);
    }

    private detectPitch(): void {
        if (!this.analyser) return;

        const bufferLength = this.analyser.fftSize;
        const timeData = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(timeData);

        // Use autocorrelation to find the fundamental frequency
        const frequency = this.autoCorrelate(timeData, this.audioContext.sampleRate);

        if (frequency > 0) {
            this.currentFrequency = frequency;

            // Convert frequency to musical note
            const noteData = this.frequencyToNote(frequency);
            this.currentNote = noteData.note;
            this.currentCents = noteData.cents;
        }
    }

    private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
        // Implementation of autocorrelation for pitch detection
        const { minFrequency, maxFrequency, detectionThreshold } = this.options;

        // Find the root mean square of the signal
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);

        // Return -1 if below threshold (silence)
        if (rms < 0.01) return -1;

        let correlations = new Array(buffer.length).fill(0);
        let r1 = 0, r2 = 0;

        // Calculate autocorrelation for different lag values
        for (let i = 0; i < buffer.length; i++) {
            correlations[i] = 0;

            // Calculate correlation for this lag
            for (let j = 0; j < buffer.length - i; j++) {
                correlations[i] += buffer[j] * buffer[j + i];
            }

            // Store first correlation value
            if (i === 0) {
                r1 = correlations[i];
            } else if (i === 1) {
                r2 = correlations[i];
            }

            // Normalize
            correlations[i] = correlations[i] / (buffer.length - i);
        }

        // Find the first peak in correlation
        let threshold = detectionThreshold;
        let maxCorrelation = -1;
        let maxIndex = -1;

        // Minimum period for highest frequency
        const minPeriod = sampleRate / maxFrequency;

        // Maximum period for lowest frequency
        const maxPeriod = sampleRate / minFrequency;

        // Find highest correlation peak
        for (let i = Math.floor(minPeriod); i < Math.ceil(maxPeriod); i++) {
            if (correlations[i] > threshold && correlations[i] > correlations[i-1] && correlations[i] > correlations[i+1]) {
                if (correlations[i] > maxCorrelation) {
                    maxCorrelation = correlations[i];
                    maxIndex = i;
                }
            }
        }

        if (maxIndex !== -1) {
            // Refine peak with interpolation
            const y1 = correlations[maxIndex - 1];
            const y2 = correlations[maxIndex];
            const y3 = correlations[maxIndex + 1];

            const a = (y1 + y3 - 2 * y2) / 2;
            const b = (y3 - y1) / 2;

            const refinedPeak = maxIndex;
            if (a !== 0) {
                const peakOffset = -b / (2 * a);
                refinedPeak = maxIndex + peakOffset;
            }

            return sampleRate / refinedPeak;
        }

        return -1;
    }

    private frequencyToNote(frequency: number): { note: string, cents: number } {
        const { referencePitch } = this.options;

        // A4 is 440Hz (default, but can be changed by referencePitch)
        const A4 = referencePitch;

        // Calculate semitones from A4
        const semitones = 12 * Math.log2(frequency / A4);

        // Note names
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // Calculate nearest note
        const roundedSemitones = Math.round(semitones);

        // Calculate cents deviation
        const cents = Math.round((semitones - roundedSemitones) * 100);

        // Calculate note index relative to C0
        const noteIndex = (roundedSemitones + 9) % 12; // A is 9 semitones above C

        // Calculate octave
        const octave = Math.floor((roundedSemitones + 9) / 12) + 4; // A4 is 9 semitones above C4

        // Get note name
        const noteName = noteNames[noteIndex];

        return {
            note: `${noteName}${octave}`,
            cents: cents
        };
    }

    public override render(): void {
        if (!this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Apply background
        this.applyBackground(ctx);

        // Draw tuning meter
        this.drawTuner(ctx);
    }

    private drawTuner(ctx: CanvasRenderingContext2D): void {
        const { width, height, dialSize, showFrequency, showNote, showCents, noteColor, tuningColor, detunedColor, textColor } = this.options;

        // Calculate center position
        const centerX = width / 2;
        const centerY = height / 2;

        // Draw tuning dial
        this.drawTuningDial(ctx, centerX, centerY, dialSize, this.currentCents);

        // Draw text information
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;

        if (showNote && this.currentNote) {
            ctx.font = 'bold 32px Arial';
            ctx.fillText(this.currentNote, centerX, centerY - dialSize / 2 - 40);
        }

        if (showFrequency && this.currentFrequency > 0) {
            ctx.font = '18px Arial';
            ctx.fillText(`${this.currentFrequency.toFixed(1)} Hz`, centerX, centerY + dialSize / 2 + 30);
        }

        if (showCents && this.currentNote) {
            ctx.font = '16px Arial';
            ctx.fillStyle = Math.abs(this.currentCents) < 5 ? tuningColor : detunedColor;
            ctx.fillText(`${this.currentCents > 0 ? '+' : ''}${this.currentCents} cents`, centerX, centerY + dialSize / 2 + 60);
        }
    }

    private drawTuningDial(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, dialSize: number, cents: number): void {
        const { tuningColor, detunedColor, noteColor } = this.options;

        // Draw outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, dialSize, 0, Math.PI * 2);
        ctx.strokeStyle = noteColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw center line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - dialSize / 2);
        ctx.lineTo(centerX, centerY + dialSize / 2);
        ctx.strokeStyle = tuningColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw tuning markers
        for (let i = -50; i <= 50; i += 10) {
            const angle = (i / 50) * Math.PI / 2;
            const length = i % 20 === 0 ? 15 : 10;

            const startX = centerX + dialSize * 0.8 * Math.sin(angle);
            const startY = centerY - dialSize * 0.8 * Math.cos(angle);

            const endX = centerX + (dialSize * 0.8 - length) * Math.sin(angle);
            const endY = centerY - (dialSize * 0.8 - length) * Math.cos(angle);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = i === 0 ? tuningColor : noteColor;
            ctx.lineWidth = i % 20 === 0 ? 2 : 1;
            ctx.stroke();

            // Draw text for major markers
            if (i % 20 === 0 && i !== 0) {
                const textX = centerX + dialSize * 0.9 * Math.sin(angle);
                const textY = centerY - dialSize * 0.9 * Math.cos(angle);

                ctx.fillStyle = noteColor;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(i.toString(), textX, textY);
            }
        }

        // Draw needle
        const needleAngle = (cents / 50) * Math.PI / 2;
        const needleLength = dialSize * 0.75;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + needleLength * Math.sin(needleAngle),
            centerY - needleLength * Math.cos(needleAngle)
        );
        ctx.strokeStyle = Math.abs(cents) < 5 ? tuningColor : detunedColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw needle pivot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = Math.abs(cents) < 5 ? tuningColor : detunedColor;
        ctx.fill();
    }

    public setFrequency(frequency: number): void {
        this.currentFrequency = frequency;
        const noteData = this.frequencyToNote(frequency);
        this.currentNote = noteData.note;
        this.currentCents = noteData.cents;
        this.render();
    }

    public override dispose(): void {
        this.stopListening();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        super.dispose();
    }
}
