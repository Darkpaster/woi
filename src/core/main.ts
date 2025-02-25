import { settings } from "./config/settings.js";
import { render } from "./graphics/graphics.js";
import { init, update } from "./logic/update.js";
import { initComponents } from "./ui/components.js";

let gameState: string = "menu";

alert("work!");

console.log(123);

export function getState(): string {
    return gameState;
}

export function setState(state: string): void {
    gameState = state;
}

init();

initComponents();


let mainLoop: NodeJS.Timeout | null = null;

export function game(): void {
    gameState = "playing";
    mainLoop = setInterval(() => {
        update();
        render();
    }, settings.delay());
}

export function pauseLoop(): void {
    gameState = "paused";
    if (mainLoop) {
        clearInterval(mainLoop);
    }
}