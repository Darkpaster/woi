import { update } from "./logic/update.ts";
import Player from "./logic/actors/player.ts";
import { Camera } from "./logic/camera.ts";
import { MapManager } from "./logic/world/mapManager.ts";
import { Graphics } from "./graphics/graphics.ts";
import { logOnce } from "../../utils/general/debug.ts";
import { EntityManager } from "./logic/entitiesManager.ts";
import { GameRTC } from "../ui/shared/api/gameRTC.ts";
import { settings } from "./config/settings.ts";
import Wanderer from "./logic/actors/characters/wanderer.ts";

export const once = logOnce();

export let player: Wanderer | Player | null = null;
export let camera: Camera | null = null;
export let graphics: Graphics;
export let worldMap: MapManager;
export let entityManager: EntityManager;
export let gameRTC: GameRTC;

let mainLoop = false;
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;
let lastUpdateTime = 0;
let accumulator = 0;

const FIXED_UPDATE_INTERVAL = 25;

export async function init(player: Player | Wanderer): Promise<string> {
    return new Promise(async (resolve) => {
        setPlayer(player);
        worldMap = new MapManager();

        await worldMap.initWorld()

        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        graphics = new Graphics(canvas);
        entityManager = new EntityManager();
        resolve("initialized");
    });
}

export function initWebSocket(): void {
    gameRTC = new GameRTC();
    gameRTC.createRoom("global");
    gameRTC.joinRoom("global", player as Player);
    gameRTC.initUsers(player as Player);
}

export function initCamera(): void {
    if (!player) {
        throw new Error("Player must be initialized before camera");
    }
    camera = new Camera({ x: player.x, y: player.y });
}

export function startLoop(): void {
    if (mainLoop) return;

    mainLoop = true;
    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

export function pauseLoop(): void {
    mainLoop = false;
}

function setPlayer(newPlayer: Player | Wanderer): void {
    player = newPlayer;
}

function gameLoop(timestamp: number): void {
    if (!mainLoop) return;

    updateGameLogic(timestamp);
    renderFrame(timestamp);

    requestAnimationFrame(gameLoop);
}

function updateGameLogic(timestamp: number): void {
    const elapsedSinceUpdate = timestamp - lastUpdateTime;
    accumulator += elapsedSinceUpdate;
    lastUpdateTime = timestamp;

    while (accumulator >= FIXED_UPDATE_INTERVAL) {
        update();
        accumulator -= FIXED_UPDATE_INTERVAL;
    }
}

function renderFrame(timestamp: number): void {
    const deltaTime = timestamp - lastFrameTime;
    const targetFrameTime = settings.delay() * 0.9;

    if (deltaTime >= targetFrameTime) {
        lastFrameTime = timestamp;
        frameCount++;

        if (frameCount >= settings.fps) {
            frameCount = 0;
            fps = Math.round(1000 / deltaTime);
        }

        graphics.render();
        graphics.drawFPS(fps);
    }
}