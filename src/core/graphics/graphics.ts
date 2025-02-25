import { scaledTileSize } from "../../utils/math.ts";
import { tiles } from "./tileSprites.ts";
import { getCurrentLocation } from "../logic/world/locationList.ts";
import { player } from "../logic/update.ts";
import { Mob } from "../logic/actors/mobs/mob.ts";
import { initKeyboard } from "../../ui/input/input.ts";
import { selector1 } from "./staticSprites.ts";
import { settings } from "../config/settings.ts";
import { playMusic } from "../audio/music.ts";

export const canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement;
initKeyboard();
export const floatTextList: Array<any> = [];
export const effectList: Array<any> = [];
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
export const graphics: CanvasRenderingContext2D | null = canvas.getContext("2d");

const f: FontFace = new FontFace("pixel", "url(src/assets/fonts/Planes_ValMore.ttf)");
f.load().then(() => {
    document.fonts.add(f);
    if (graphics) {
        graphics.font = "20px pixel";
    }
});

document.getElementById("init")!.onclick = (event: MouseEvent) => {
    (event.target as HTMLElement).remove();
    document.getElementById("root")!.style.display = "flex";
    canvas.style.display = "block";
    playMusic("main");
};

export function render(): void {
    if (graphics) {
        graphics.font = 7 * settings.defaultTileScale + "px pixel";
        renderTilemap();
        renderActors();
        renderEffects();
        renderText();
    }
}

export function setBlur(set: boolean): void {
    canvas.style.filter = set ? "blur(5px)" : "none";
}

export function hideCanvas(): void {
    canvas.style.display = "none";
}

export function showCanvas(): void {
    canvas.style.display = "block";
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
}

function renderActors(): void {
    if (graphics) {
        graphics.fillStyle = "blue";
        player.image.render(player.renderState, graphics, player?.getX(), player?.getY(), player.direction);
        for (const mob of Mob.mobList) {
            mob.image.render(mob.renderState, graphics, mob.x, mob.y, mob.direction);
            graphics.fillText(mob.getName(), mob.x, mob.y);
        }
        graphics.drawImage(selector1.tile, player.target?.getX() || 0, player.target?.getY() || 0, scaledTileSize(), scaledTileSize());
        graphics.fillText(player?.getName(), player?.getX(), player?.getY());
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
    
    const beforeY: number = player.getPosY() - tilesY + 2;
    const afterY: number = player.getPosY() + tilesY;
    
    const beforeX: number = player.getPosX() - tilesX + 2;
    const afterX: number = player.getPosX() + tilesX;

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