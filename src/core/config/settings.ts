const _fps: symbol = Symbol('fps');

export const settings: {
    fullScreen: boolean;
    language: string;
    difficulty: string;
    graphics: string;
    soundVolume: number;
    musicVolume: number;
    defaultTileScale: number;
    tileSize: number;
    [key: symbol]: any; // to allow dynamic properties
    fps: number;
    particles: boolean;
    delay(): number;
} = {
    fullScreen: false,
    language: "ru",
    difficulty: "normal",
    graphics: "high",
    soundVolume: 100,
    musicVolume: 100,
    defaultTileScale: 4,
    tileSize: 16,

    [_fps]: 30,
    
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

    // "state": "playing"
    //state: 'over'
    //state: 'ready'
    //state: 'pause'
    //state: 'win'
    //state: 'lose'
    //state: 'menu'
    //state: 'settings'
    //state: 'credits'
    //state: 'about'
    //state: 'help'
    //state: 'intro'
    //state: 'outro'
    //state: 'loading'
    //state: 'transition'
    //state: 'gameover'