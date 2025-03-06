import { settings } from "../config/settings.ts";
import { randomInt, scaledTileSize } from "../../utils/math.ts";
import { TimeDelay } from "../../utils/time.ts";
import {camera, graphics, player} from "../main.ts";

const updateRate: TimeDelay = new TimeDelay(25);

export function update(): void {
    if (updateRate.timeIsUp()) {
        camera!.update(player!.updatePlayer(), player!.x, player!.y);
        graphics.ctx!.font = 7 * settings.defaultTileScale + "px PixelFont";
        // updateInGameUI();
        // for (const mob of Mob.mobList) {
        //     mob.update();
        // }
        // Actor.actorList = Actor.actorList.filter((actor) => actor.isAlive());
    }
    // if (canvas!.id !== document.activeElement!.id) {
    //     canvas!.focus();
    // }
}

export function updateZoom(zoomIn: boolean): void {
    const prevPosX: number = player!.posX;
    const prevPosY: number = player!.posY;
    const prevPos: Array<{ x: number; y: number }> = [];

    // for (const mob of Mob.mobList) {
    //     prevPos.push({ x: mob.posX, y: mob.posY });
    // }

    settings.defaultTileScale += zoomIn ? 1 : -1;

    const offsetX: number = prevPosX * scaledTileSize();
    const offsetY: number = prevPosY * scaledTileSize();

    camera!.update(player!.setCoordinates(offsetX, offsetY), player!.x, player!.y);

    // player.image.update(zoomIn ? 1 : -1);

    // for (let i: number = 0; i < Mob.mobList.length; i++) {
    //     const mob: Mob = Mob.mobList[i];
    //     const offsetX: number = prevPos[i].x * scaledTileSize();
    //     const offsetY: number = prevPos[i].y * scaledTileSize();
    //
    //     // mob.image.update(zoomIn ? 1 : -1);
    //     mob.setCoordinates(offsetX, offsetY);
    // }
}