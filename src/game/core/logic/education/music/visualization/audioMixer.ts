// visualization/audioMixer.ts
import {Visualizer, VisualizationOptions, DEFAULT_VISUALIZATION_OPTIONS} from './visualizer.ts';

export interface AudioTrack {
    id: string;
    name: string;
    color: string;
    volume: number;
    pan: number;
    muted: boolean;
    soloed: boolean;
    effects: AudioEffect[];
}

export interface AudioEffect {
    id: string;
    name: string;
    enabled: boolean;
    parameters: AudioEffectParameter[];
}

export interface AudioEffectParameter {
    id: string;
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
}

export interface AudioMixerOptions extends VisualizationOptions {
    tracks: AudioTrack[];
    faderHeight: number;
    faderWidth: number;
    trackSpacing: number;
    trackNameColor: string;
    trackNameFont: string;
    faderBackgroundColor: string;
    faderColor: string;
    faderKnobColor: string;
    meterGreenLevel: number;
    meterYellowLevel: number;
    meterRedLevel: number;
    meterSegments: number;
    meterSpacing: number;
    showPanControls: boolean;
    showMuteButtons: boolean;
    showSoloButtons: boolean;
    buttonRadius: number;
    activeButtonColor: string;
    inactiveButtonColor: string;
}

export const DEFAULT_AUDIO_MIXER_OPTIONS: AudioMixerOptions = {
    ...DEFAULT_VISUALIZATION_OPTIONS,
    tracks: [
        {
            id: 'track1',
            name: 'Drums',
            color: '#61dafb',
            volume: 0.8,
            pan: 0,
            muted: false,
            soloed: false,
            effects: []
        },
        {
            id: 'track2',
            name: 'Bass',
            color: '#6a79f7',
            volume: 0.7,
            pan: -0.3,
            muted: false,
            soloed: false,
            effects: []
        },
        {
            id: 'track3',
            name: 'Guitar',
            color: '#f76a6a',
            volume: 0.6,
            pan: 0.3,
            muted: false,
            soloed: false,
            effects: []
        },
        {
            id: 'track4',
            name: 'Vocals',
            color: '#f7da6a',
            volume: 0.9,
            pan: 0,
            muted: false,
            soloed: false,
            effects: []
        }
    ],
    faderHeight: 200,
    faderWidth: 30,
    trackSpacing: 50,
    trackNameColor: '#ffffff',
    trackNameFont: '14px Arial',
    faderBackgroundColor: '#444444',
    faderColor: '#cccccc',
    faderKnobColor: '#ffffff',
    meterGreenLevel: 0.7,
    meterYellowLevel: 0.85,
    meterRedLevel: 0.95,
    meterSegments: 20,
    meterSpacing: 2,
    showPanControls: true,
    showMuteButtons: true,
    showSoloButtons: true,
    buttonRadius: 15,
    activeButtonColor: '#f76a6a',
    inactiveButtonColor: '#666666'
};

export class AudioMixer extends Visualizer {
    private options: AudioMixerOptions;
    private audioContext: AudioContext | null = null;
    private audioNodes: Map<string, AudioMixerNodes> = new Map();
    private meterLevels: Map<string, number> = new Map();
    private animationFrameId: number | null = null;
    private isDragging: boolean = false;
    private dragTarget: { trackId: string, type: 'volume' | 'pan' } | null = null;
    private mousePosition: { x: number, y: number } = { x: 0, y: 0 };

    constructor(canvas: HTMLCanvasElement, options: Partial<AudioMixerOptions> = {}) {
        super(canvas, options);
        this.options = { ...DEFAULT_AUDIO_MIXER_OPTIONS, ...options };
        this.initAudioContext();
        this.setupEventListeners();
        this.startAnimation();
    }

    private initAudioContext(): void {
        this.audioContext = new AudioContext();
        this.setupAudioNodes();
    }

    private setupAudioNodes(): void {
        if (!this.audioContext) return;

        this.options.tracks.forEach(track => {
            // Create gain node for volume control
            const gainNode = this.audioContext!.createGain();
            gainNode.gain.value = track.volume;

            // Create stereo panner for pan control
            const pannerNode = this.audioContext!.createStereoPanner();
            pannerNode.pan.value = track.pan;

            // Create analyzer for level metering
            const analyzerNode = this.audioContext!.createAnalyser();
            analyzerNode.fftSize = 256;

            // Connect nodes: input → gain → panner → analyzer → output
            // (actual connections will be made when audio source is added)
            gainNode.connect(pannerNode);
            pannerNode.connect(analyzerNode);
            // We'll connect analyzer to destination when track is active

            // Store nodes
            this.audioNodes.set(track.id, {
                gain: gainNode,
                panner: pannerNode,
                analyzer: analyzerNode,
                connected: false
            });

            // Initialize meter level
            this.meterLevels.set(track.id, 0);
        });
    }

    private setupEventListeners(): void {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    private startAnimation(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const animate = () => {
            this.updateMeterLevels();
            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    private updateMeterLevels(): void {
        this.options.tracks.forEach(track => {
            const nodes = this.audioNodes.get(track.id);
            if (!nodes || !nodes.analyzer) return;

            const dataArray = new Uint8Array(nodes.analyzer.frequencyBinCount);
            nodes.analyzer.getByteFrequencyData(dataArray);

            // Calculate RMS of frequency data
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += (dataArray[i] / 255) ** 2;
            }
            const rms = Math.sqrt(sum / dataArray.length);

            // Apply smoothing
            const currentLevel = this.meterLevels.get(track.id) || 0;
            const smoothingFactor = 0.3;
            const newLevel = currentLevel * (1 - smoothingFactor) + rms * smoothingFactor;

            this.meterLevels.set(track.id, newLevel);
        });
    }

    public render(): void {
        if (!this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Apply background
        this.applyBackground(ctx);

        // Draw mixer controls
        this.drawMixerTracks(ctx);
    }

    private drawMixerTracks(ctx: CanvasRenderingContext2D): void {
        const {
            width,
            height,
            tracks,
            faderHeight,
            faderWidth,
            trackSpacing,
            trackNameColor,
            trackNameFont,
            faderBackgroundColor,
            faderColor,
            faderKnobColor,
            meterGreenLevel,
            meterYellowLevel,
            meterRedLevel,
            meterSegments,
            meterSpacing,
            showPanControls,
            showMuteButtons,
            showSoloButtons,
            buttonRadius,
            activeButtonColor,
            inactiveButtonColor
        } = this.options;

        // Calculate available width per track
        const trackWidth = Math.min(100, (width - 40) / tracks.length);

        // Draw each track
        tracks.forEach((track, index) => {
            const x = 20 + index * (trackWidth + trackSpacing);
            const centerX = x + trackWidth / 2;

            // Draw track name
            ctx.fillStyle = trackNameColor;
            ctx.font = trackNameFont;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(track.name, centerX, 20);

            // Draw level meter
            const meterWidth = 15;
            const meterHeight = faderHeight;
            const meterX = x;
            const meterY = 50;

            this.drawLevelMeter(ctx, track, meterX, meterY, meterWidth, meterHeight, meterSegments, meterSpacing, meterGreenLevel, meterYellowLevel, meterRedLevel);

            // Draw volume fader
            const faderX = meterX + meterWidth + 10;
            const faderY = meterY;

            this.drawFader(ctx, track, faderX, faderY, faderWidth, faderHeight, faderBackgroundColor, faderColor, faderKnobColor);

            // Draw pan control if enabled
            if (showPanControls) {
                const panControlY = faderY + faderHeight + 20;
                this.drawPanControl(ctx, track, centerX, panControlY, 40, 20);
            }

            // Draw mute button if enabled
            if (showMuteButtons) {
                const muteY = height - 60;
                this.drawButton(ctx, 'M', track.muted, centerX - 20, muteY, buttonRadius, activeButtonColor, inactiveButtonColor);
            }

            // Draw solo button if enabled
            if (showSoloButtons) {
                const soloY = height - 60;
                this.drawButton(ctx, 'S', track.soloed, centerX + 20, soloY, buttonRadius, activeButtonColor, inactiveButtonColor);
            }
        });
    }

    private drawLevelMeter(
        ctx: CanvasRenderingContext2D,
        track: AudioTrack,
        x: number,
        y: number,
        width: number,
        height: number,
        segments: number,
        spacing: number,
        greenLevel: number,
        yellowLevel: number,
        redLevel: number
    ): void {
        const segmentHeight = (height - (segments - 1) * spacing) / segments;
        const level = this.meterLevels.get(track.id) || 0;
        const activeSegments = Math.ceil(level * segments);

        for (let i = 0; i < segments; i++) {
            const segmentY = y + height - (i + 1) * segmentHeight - i * spacing;
            const segmentLevel = (i + 1) / segments;

            // Determine segment color based on level
            let color = '#4caf50'; // Green
            if (segmentLevel > yellowLevel) color = '#ff9800'; // Yellow
            if (segmentLevel > redLevel) color = '#f44336'; // Red

            // Draw segment
            ctx.fillStyle = i < activeSegments ? color : '#333333';
            ctx.fillRect(x, segmentY, width, segmentHeight);
        }
    }

    private drawFader(
        ctx: CanvasRenderingContext2D,
        track: AudioTrack,
        x: number,
        y: number,
        width: number,
        height: number,
        backgroundColor: string,
        faderColor: string,
        knobColor: string
    ): void {
        // Draw fader background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x, y, width, height);

        // Draw fader position
        const knobY = y + height - (track.volume * height);
        const knobHeight = 10;
        const knobWidth = width + 10;

        ctx.fillStyle = faderColor;
        ctx.fillRect(x, knobY, width, height - (knobY - y));

        // Draw fader knob
        ctx.fillStyle = knobColor;
        ctx.beginPath();
        ctx.roundRect(x - 5, knobY - knobHeight / 2, knobWidth, knobHeight, 4);
        ctx.fill();
    }

    private drawPanControl(
        ctx: CanvasRenderingContext2D,
        track: AudioTrack,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        // Draw pan slider background
        ctx.fillStyle = '#444444';
        ctx.beginPath();
        ctx.roundRect(x - width / 2, y, width, height, height / 2);
        ctx.fill();

        // Draw pan label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Pan', x, y - 2);

        // Draw pan position
        const knobX = x + (track.pan * width / 2);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(knobX, y + height / 2, height / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawButton(
        ctx: CanvasRenderingContext2D,
        label: string,
        active: boolean,
        x: number,
        y: number,
        radius: number,
        activeColor: string,
        inactiveColor: string
    ): void {
        // Draw button background
        ctx.fillStyle = active ? activeColor : inactiveColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw button label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
    }

    private handleMouseDown = (event: MouseEvent): void => {
        this.isDragging = true;
        this.updateMousePosition(event);
        this.dragTarget = this.getControlAtPosition(this.mousePosition.x, this.mousePosition.y);
    };

    private handleMouseMove = (event: MouseEvent): void => {
        this.updateMousePosition(event);

        if (this.isDragging && this.dragTarget) {
            this.updateControl(this.dragTarget.trackId, this.dragTarget.type, this.mousePosition);
        }
    };

    private handleMouseUp = (): void => {
        this.isDragging = false;
        this.dragTarget = null;
    };

    private updateMousePosition(event: MouseEvent): void {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private getControlAtPosition(x: number, y: number): { trackId: string, type: 'volume' | 'pan' } | null {
        const {
            tracks,
            faderHeight,
            faderWidth,
            trackSpacing
        } = this.options;

        // Calculate available width per track
        const trackWidth = Math.min(100, (this.canvas.width - 40) / tracks.length);

        for (let i = 0; i < tracks.length; i++) {
            const trackX = 20 + i * (trackWidth + trackSpacing);
            const faderX = trackX + 15 + 10;
            const faderY = 50;

            // Check if clicking on volume fader
            if (
                x >= faderX - 5 &&
                x <= faderX + faderWidth + 5 &&
                y >= faderY - 5 &&
                y <= faderY + faderHeight + 5
            ) {
                return { trackId: tracks[i].id, type: 'volume' };
            }

            // Check if clicking on pan control
            const centerX = trackX + trackWidth / 2;
            const panY = faderY + faderHeight + 20;

            if (
                x >= centerX - 20 &&
                x <= centerX + 20 &&
                y >= panY &&
                y <= panY + 20
            ) {
                return { trackId: tracks[i].id, type: 'pan' };
            }
        }

        return null;
    }

    private updateControl(trackId: string, type: 'volume' | 'pan', position: { x: number, y: number }): void {
        const trackIndex = this.options.tracks.findIndex(t => t.id === trackId);
        if (trackIndex === -1) return;

        const track = { ...this.options.tracks[trackIndex] };
        const nodes = this.audioNodes.get(trackId);
        if (!nodes) return;

        const {
            faderHeight,
            trackSpacing
        } = this.options;

        // Calculate available width per track
        const trackWidth = Math.min(100, (this.canvas.width - 40) / this.options.tracks.length);
        const trackX = 20 + trackIndex * (trackWidth + trackSpacing);

        if (type === 'volume') {
            const faderY = 50;

            // Calculate volume from Y position (inverted)
            let volume = 1 - Math.max(0, Math.min(1, (position.y - faderY) / faderHeight));
            volume = Math.round(volume * 100) / 100; // Round to 2 decimal places

            // Update track and node
            track.volume = volume;
            nodes.gain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
        } else if (type === 'pan') {
            const centerX = trackX + trackWidth / 2;

            // Calculate pan from X position
            let pan = Math.max(-1, Math.min(1, (position.x - centerX) / 20));
            pan = Math.round(pan * 10) / 10; // Round to 1 decimal place

            // Update track and node
            track.pan = pan;
            nodes.panner.pan.setValueAtTime(pan, this.audioContext!.currentTime);
        }

        // Update track in options
        this.options.tracks[trackIndex] = track;
    }

    public connectTrackSource(trackId: string, source: AudioNode): void {
        if (!this.audioContext) return;

        const nodes = this.audioNodes.get(trackId);
        if (!nodes) return;

        // Connect source to track's gain node
        source.connect(nodes.gain);

        // Connect analyzer to destination if not already connected
        if (!nodes.connected) {
            nodes.analyzer.connect(this.audioContext.destination);
            nodes.connected = true;
        }
    }

    public disconnectTrackSource(trackId: string, source: AudioNode): void {
        const nodes = this.audioNodes.get(trackId);
        if (!nodes) return;

        // Disconnect source from track's gain node
        source.disconnect(nodes.gain);
    }

    public setTrackVolume(trackId: string, volume: number): void {
        const trackIndex = this.options.tracks.findIndex(t => t.id === trackId);
        if (trackIndex === -1) return;

        // Clamp volume between 0 and 1
        volume = Math.max(0, Math.min(1, volume));

        // Update track in options
        const track = { ...this.options.tracks[trackIndex], volume };
        this.options.tracks[trackIndex] = track;

        // Update gain node
        const nodes = this.audioNodes.get(trackId);
        if (nodes && this.audioContext) {
            nodes.gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    public setTrackPan(trackId: string, pan: number): void {
        const trackIndex = this.options.tracks.findIndex(t => t.id === trackId);
        if (trackIndex === -1) return;

        // Clamp pan between -1 and 1
        pan = Math.max(-1, Math.min(1, pan));

        // Update track in options
        const track = { ...this.options.tracks[trackIndex], pan };
        this.options.tracks[trackIndex] = track;

        // Update panner node
        const nodes = this.audioNodes.get(trackId);
        if (nodes && this.audioContext) {
            nodes.panner.pan.setValueAtTime(pan, this.audioContext.currentTime);
        }
    }

    public toggleTrackMute(trackId: string): void {
        const trackIndex = this.options.tracks.findIndex(t => t.id === trackId);
        if (trackIndex === -1) return;

        // Toggle mute state
        const muted = !this.options.tracks[trackIndex].muted;

        // Update track in options
        const track = { ...this.options.tracks[trackIndex], muted };
        this.options.tracks[trackIndex] = track;

        // Update gain node
        const nodes = this.audioNodes.get(trackId);
        if (nodes && this.audioContext) {
            nodes.gain.gain.setValueAtTime(muted ? 0 : track.volume, this.audioContext.currentTime);
        }
    }

    public toggleTrackSolo(trackId: string): void {
        const trackIndex = this.options.tracks.findIndex(t => t.id === trackId);
        if (trackIndex === -1) return;

        // Toggle solo state
        const soloed = !this.options.tracks[trackIndex].soloed;

        // Update track in options
        const tracks = [...this.options.tracks];
        tracks[trackIndex] = { ...tracks[trackIndex], soloed };

        // Check if any track is soloed
        const anySoloed = tracks.some(t => t.soloed);

        // Update all gain nodes
        if (this.audioContext) {
            tracks.forEach(track => {
                const nodes = this.audioNodes.get(track.id);
                if (!nodes) return;

                const shouldPlay = !anySoloed || track.soloed;
                const volume = (shouldPlay && !track.muted) ? track.volume : 0;

                nodes.gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
            });
        }

        // Update all tracks in options
        this.options.tracks = tracks;
    }

    public updateOptions(options: Partial<AudioMixerOptions>): void {
        this.options = { ...this.options, ...options };
    }

    public disconnect(): void {
        // Stop animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Remove event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseup', this.handleMouseUp);
        }

        // Disconnect audio nodes
        this.audioNodes.forEach(nodes => {
            if (nodes.gain) nodes.gain.disconnect();
            if (nodes.panner) nodes.panner.disconnect();
            if (nodes.analyzer) nodes.analyzer.disconnect();
        });

        // Clear audio nodes
        this.audioNodes.clear();

        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    public destroy(): void {
        this.disconnect();
        super.destroy();
    }
}

export interface AudioMixerNodes {
    gain: GainNode;
    panner: StereoPannerNode;
    analyzer: AnalyserNode;
    connected: boolean;
}