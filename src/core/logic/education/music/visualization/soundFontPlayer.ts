import {Note} from "./musicNotation.ts";

export interface SoundFontOptions {
    instrumentUrl: string;
    instrumentName: string;
    baseUrl: string;
    format: 'mp3' | 'ogg' | 'wav';
    volume: number;
    preload: boolean;
}

export const DEFAULT_SOUNDFONT_OPTIONS: SoundFontOptions = {
    instrumentUrl: '',
    instrumentName: 'acoustic_grand_piano',
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
    format: 'mp3',
    volume: 1.0,
    preload: true
};

export class SoundFontPlayer {
    private options: SoundFontOptions;
    private audioContext: AudioContext;
    private buffers: Map<string, AudioBuffer> = new Map();
    private gainNode: GainNode;
    private isLoaded: boolean = false;
    private loadPromise: Promise<void> | null = null;
    private activeAudioNodes: Map<string, AudioBufferSourceNode> = new Map();

    constructor(options: Partial<SoundFontOptions> = {}) {
        this.options = { ...DEFAULT_SOUNDFONT_OPTIONS, ...options };
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.options.volume;
        this.gainNode.connect(this.audioContext.destination);

        if (this.options.preload) {
            this.loadInstrument();
        }
    }

    public async loadInstrument(): Promise<void> {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = new Promise<void>(async (resolve, reject) => {
            try {
                let url = this.options.instrumentUrl;

                if (!url) {
                    url = `${this.options.baseUrl}${this.options.instrumentName}-${this.options.format}.js`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to load soundfont: ${response.statusText}`);
                }

                const data = await response.text();

                // Parse JSON from MIDI.js format
                const json = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));

                // Load each note
                const loadPromises = Object.entries(json).map(async ([key, value]) => {
                    const base64 = (value as string).split(',')[1];
                    const buffer = await this.decodeBase64AudioData(base64);
                    this.buffers.set(key, buffer);
                });

                await Promise.all(loadPromises);
                this.isLoaded = true;
                resolve();
            } catch (error) {
                reject(error);
            }
        });

        return this.loadPromise;
    }

    private async decodeBase64AudioData(base64: string): Promise<AudioBuffer> {
        const binaryString = atob(base64);
        const length = binaryString.length;
        const bytes = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return await this.audioContext.decodeAudioData(bytes.buffer);
    }

    public async playNote(note: Note): Promise<void> {
        if (!this.isLoaded) {
            await this.loadInstrument();
        }

        // Resume AudioContext if it's suspended
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const pitch = note.pitch;
        const velocity = note.velocity;
        const duration = note.duration;

        // Get MIDI number from pitch name
        const midiNumber = this.getMidiNumberFromPitch(pitch);
        const noteKey = `note-${midiNumber}`;

        // Get buffer for this note
        const buffer = this.buffers.get(noteKey);
        if (!buffer) {
            console.warn(`No buffer found for note: ${pitch} (MIDI: ${midiNumber})`);
            return;
        }

        // Create source node
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // Create gain node for velocity
        const noteGain = this.audioContext.createGain();
        noteGain.gain.value = velocity / 127;

        // Connect
        source.connect(noteGain);
        noteGain.connect(this.gainNode);

        // Store active node
        this.activeAudioNodes.set(noteKey, source);

        // Start playback
        source.start();

        // Schedule stop
        if (duration > 0) {
            const stopTime = this.audioContext.currentTime + (duration * 60 / 120); // assuming 120 BPM
            source.stop(stopTime);

            // Clean up after playback
            source.onended = () => {
                this.activeAudioNodes.delete(noteKey);
            };
        }
    }

    public stopNote(pitch: string): void {
        const midiNumber = this.getMidiNumberFromPitch(pitch);
        const noteKey = `note-${midiNumber}`;

        const source = this.activeAudioNodes.get(noteKey);
        if (source) {
            source.stop();
            this.activeAudioNodes.delete(noteKey);
        }
    }

    public stopAllNotes(): void {
        this.activeAudioNodes.forEach(source => {
            source.stop();
        });
        this.activeAudioNodes.clear();
    }

    private getMidiNumberFromPitch(pitch: string): number {
        const pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        let pitchClass = pitch.replace(/[0-9]/g, '');
        let octave = parseInt(pitch.match(/[0-9]+/)[0]);

        // Handle flat notation (convert to sharp)
        if (pitchClass.includes('b')) {
            const flatPitch = pitchClass.replace('b', '');
            const flatIndex = pitchClasses.indexOf(flatPitch);

            if (flatIndex === 0) {
                // C♭ is B of previous octave
                pitchClass = 'B';
                octave--;
            } else {
                pitchClass = pitchClasses[flatIndex - 1];
            }
        }

        const pitchIndex = pitchClasses.indexOf(pitchClass);

        // MIDI note number formula: (octave+1)*12 + pitchIndex
        return (octave + 1) * 12 + pitchIndex;
    }

    public setVolume(volume: number): void {
        this.options.volume = volume;
        this.gainNode.gain.value = volume;
    }

    public dispose(): void {
        this.stopAllNotes();
        this.gainNode.disconnect();
        this.audioContext.close();
        this.buffers.clear();
    }
}