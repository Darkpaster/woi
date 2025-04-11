import {update} from "./logic/update.js";
import Player from "./logic/actors/player.ts";
import {Camera} from "./logic/camera.ts";
import {MapManager} from "./logic/world/mapManager.ts";
import {Graphics} from "./graphics/graphics.ts";
import {logf, logOnce} from "../utils/general/debug.ts";
import {EntityManager} from "./logic/entitiesManager.ts";
import {GameRTC} from "../ui/service/gameRTC.ts";
import {settings} from "./config/settings.ts";
import Wanderer from "./logic/actors/characters/wanderer.ts";

export const once = logOnce();


export let player: Wanderer | Player | null = null,
    camera: Camera | null = null,
    graphics: Graphics,
    worldMap: MapManager,
    entityManager: EntityManager;

export let gameRTC: GameRTC;

export async function init(pl: Player|Wanderer) {
    return new Promise((resolve) => {
        player = pl;
        worldMap = new MapManager();
        worldMap.initWorld().then((result) => {
            graphics = new Graphics(document.getElementById("canvas") as HTMLCanvasElement);
            entityManager = new EntityManager();
            camera = new Camera({x: player.x, y: player.y});
        }).then(() => {
            resolve("result");
        });
    })
}

export function initWS() {
    gameRTC = new GameRTC();
    gameRTC.createRoom("public");
    gameRTC.joinRoom("public", (player as Player));
    gameRTC.initUsers((player as Player));
}

let mainLoop = false;

export function startLoop(): void {
    mainLoop = true;
    requestAnimationFrame(loop);
}

let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;
let lastUpdateTime = 0;
const fixedUpdateInterval = 25;
let accumulator = 0;

function loop(timestamp: number) {
    if (!mainLoop) {
        return;
    }

    // Расчет прошедшего времени с последнего кадра
    const deltaTime = timestamp - lastFrameTime;

    // Обновление логики игры с фиксированным шагом
    const elapsedSinceUpdate = timestamp - lastUpdateTime;
    accumulator += elapsedSinceUpdate;
    lastUpdateTime = timestamp;

    // Выполняем update с фиксированным шагом времени
    while (accumulator >= fixedUpdateInterval) {
        update();
        accumulator -= fixedUpdateInterval;
    }

    // Рендеринг с заданным FPS из настроек
    if (deltaTime >= settings.delay() * 0.9) {
        lastFrameTime = timestamp;

        frameCount++;
        if (frameCount >= settings.fps) {
            frameCount = 0;
            fps = Math.round(1000 / deltaTime);
        }

        graphics!.render();
        graphics.drawFPS(fps);
    }

    requestAnimationFrame(loop);
}

export function pauseLoop(): void {
    mainLoop = false;
}
