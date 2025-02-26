import { scaledTileSize } from "../../utils/math.ts";
import { tiles } from "./tileSprites.ts";
import { getCurrentLocation } from "../logic/world/locationList.ts";
import { player } from "../logic/update.ts";
import { Mob } from "../logic/actors/mobs/mob.ts";
import { selector1 } from "./staticSprites.ts";
import { settings } from "../config/settings.ts";
import { playMusic } from "../audio/music.ts";

export const floatTextList: Array<any> = [];
export const effectList: Array<any> = [];

export let canvas: HTMLCanvasElement | null = null;
export let graphics: CanvasRenderingContext2D | null = null;

    export function initGraphics(): void {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    graphics = canvas.getContext("2d");
}

// const f: FontFace = new FontFace("pixel", "url(src/assets/fonts/Planes_ValMore.ttf)");
// f.load().then(() => {
//     document.fonts.add(f);
//     if (graphics) {
//         graphics.font = "20px pixel";
//     }
// });

export function render(): void {
    if (graphics) {
        graphics.font = 7 * settings.defaultTileScale + "px pixel";
        renderTilemap();
        renderActors();
        renderEffects();
        renderText();
    }
}r

export function setBlur(set: boolean): void {
    canvas!.style.filter = set ? "blur(5px)" : "none";
}

export function hideCanvas(): void {
    canvas!.style.display = "none";
}

export function showCanvas(): void {
    canvas!.style.display = "block";
    canvas!.setAttribute('tabindex', '0');
    canvas!.focus();
}

function renderActors(): void {
    if (graphics) {
        graphics.fillStyle = "blue";
        // @ts-ignore
        player.image.render(player.renderState, graphics, player?.x, player?.y, player.direction);
        for (const mob of Mob.mobList) {
            // @ts-ignore
            mob.image.render(mob.renderState, graphics, mob.x, mob.y, mob.direction);
            graphics.fillText(mob.name, mob.x, mob.y);
        }
        graphics.drawImage(selector1.tile, player!.target!.x || 0, player!.target?.y || 0, scaledTileSize(), scaledTileSize());
        graphics.fillText(player!.name, player!.x, player!.y);
    }
}

function renderEffects(): void {
    for (const effect of effectList) {
        if (effect.animate(graphics)) {
            effectList.splice(effectList.indexOf(effect), 1);
        }
    }
}

function renderText(): void {
    let length: number = floatTextList.length;
    if (!length) return;

    while (length--) {
        const text: any = floatTextList[length];
        text.render(graphics);
        if (text.update()) {
            floatTextList.splice(floatTextList.indexOf(text), 1);
        }
    }
}

function renderTilemap(): void {
    const tilesY: number = Math.round(window.innerHeight / scaledTileSize() / 2) + 2;
    const tilesX: number = Math.round(window.innerWidth / scaledTileSize() / 2) + 2;
    
    const beforeY: number = player!.posY - tilesY + 2;
    const afterY: number = player!.posY + tilesY;
    
    const beforeX: number = player!.posX - tilesX + 2;
    const afterX: number = player!.posX + tilesX;

    if (graphics) {
        graphics.fillStyle = "black";

        for (let i: number = beforeY; i < afterY; i++) {
            for (let j: number = beforeX; j < afterX; j++) {
                const tile: any = getCurrentLocation().floor[i][j];
                const wall: any= getCurrentLocation().objects[i][j];

                if (!tiles[tile]) {
                    graphics.fillRect(j * scaledTileSize(), i * scaledTileSize(),
                        scaledTileSize(), scaledTileSize());
                    continue;
                }

                graphics.drawImage(tiles[tile].image.tile, j * scaledTileSize(), i * scaledTileSize(),
                    scaledTileSize(), scaledTileSize());

                if (tiles[wall]) {
                    graphics.drawImage(tiles[wall].image.tile, j * scaledTileSize(), i * scaledTileSize(),
                        scaledTileSize(), scaledTileSize());
                }
            }
        }
   }
}