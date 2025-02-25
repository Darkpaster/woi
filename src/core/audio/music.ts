const mainTheme: HTMLAudioElement = new Audio('./src/assets/sounds/music/RelaxingGreenNature.mp3');
const sacredGarden: HTMLAudioElement = new Audio('./src/assets/sounds/music/sacred-garden.mp3');

sacredGarden.volume = 0.5;

let currentMusic: HTMLAudioElement = mainTheme;

export function playMusic(title: string, stop: boolean = true): void {
    currentMusic.pause();
    if (stop) {
        currentMusic.currentTime = 0;
    }
    switch (title) {
        case 'main':
            currentMusic = mainTheme;
            break;
        case 'garden':
            currentMusic = sacredGarden;
            break;
        default:
            currentMusic = mainTheme;
            break;
    }
    if (!currentMusic.played || currentMusic.paused) {
        currentMusic.play();
        currentMusic.loop = true;
    }
}

export function pauseMusic(): void {
    currentMusic.pause();
}

export function resumeMusic(): void {
    if (!currentMusic.paused) return;
    currentMusic.play();
}

export function setVolume(volume: number): void {
    currentMusic.volume = volume;
}