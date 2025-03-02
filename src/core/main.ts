import {settings} from "./config/settings.js";
import {update} from "./logic/update.js";
import {Player} from "./logic/actors/player.ts";
import {Camera} from "./logic/camera.ts";
import {setCurrentLocation} from "./logic/world/locationList.ts";
import {Slash} from "./logic/skills/slash.ts";
import {Graphics} from "./graphics/graphics.ts";
import {Rabbit} from "./logic/actors/mobs/neutral/rabbit.ts";

export let player: Player | null = null,
    camera: Camera | null = null,
    graphics: Graphics;

player = new Player();

export function init(): void {
    setCurrentLocation("spawn");
    graphics = new Graphics(document.getElementById("canvas") as HTMLCanvasElement);
    camera = new Camera({x: player.x, y: player.y});
    player.learn(new Slash(player));
    for (let index: number = 0; index < 50; index++) {
        new Rabbit();
    }
}

let mainLoop: NodeJS.Timeout | null = null;

export function startLoop(): void {
    mainLoop = setInterval(() => {
        update();
        graphics!.render();
    }, settings.delay());
}

export function pauseLoop(): void {
    if (mainLoop) {
        clearInterval(mainLoop);
    }
}