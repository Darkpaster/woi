import {settings} from "./config/settings.js";
import {update} from "./logic/update.js";
import {Player} from "./logic/actors/player.ts";
import {Camera} from "./logic/camera.ts";
import {MapManager} from "./logic/world/mapManager.ts";
import {Slash} from "./logic/skills/slash.ts";
import {Graphics} from "./graphics/graphics.ts";
import {Rabbit} from "./logic/actors/mobs/neutral/rabbit.ts";
import {logf} from "../utils/debug.ts";
import {Mob} from "./logic/actors/mobs/mob.ts";
import {EntityManager} from "./logic/entitiesManager.ts";
import {generateTiles} from "./graphics/tilesGenerator.ts";

export let player: Player | null = null,
    camera: Camera | null = null,
    graphics: Graphics,
    worldMap: MapManager,
    entityManager: EntityManager;

player = new Player();

export function init(): void {
    // worldMap = new MapManager();
    // worldMap.initWorld();
    generateTiles();
    // entityManager = new EntityManager();
    // graphics = new Graphics(document.getElementById("canvas") as HTMLCanvasElement);
    // camera = new Camera({x: player.x, y: player.y});
    // player.learn(new Slash(player));

    // for (let index: number = 0; index < 60; index++) {
    //     new Rabbit();
    // }

    // logf(Mob.mobList.length)
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