const _fps: symbol = Symbol('fps');

export const settings: {
    fullScreen: boolean;
    language: string;
    soundVolume: number;
    musicVolume: number;
    defaultTileScale: number;
    readonly tileSize: number;
    [key: symbol]: any; // to allow dynamic properties
    fps: number;
    showFPS: boolean;
    particles: boolean;
    delay(): number;
} = {
    fullScreen: false,
    language: "ru",
    soundVolume: 100,
    musicVolume: 100,
    defaultTileScale: 4,
    tileSize: 16,
    showFPS: false,

    [_fps]: 60,
    
    particles: true,

    get fps(): number {
        return this[_fps];
    },
    
    delay(): number {
        return 1000 / this[_fps];
    },

    set fps(fps: number) {
        this[_fps] = fps;
        if (this[_fps] < 1) {
            this[_fps] = 1;
        }
        if (this[_fps] > 60) {
            this[_fps] = 60;
        }
    }
}