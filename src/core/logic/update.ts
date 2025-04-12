import {settings} from "../config/settings.ts";
import {camera, entityManager, graphics, player} from "../main.ts";
import {scaledTileSize} from "../../utils/math/general.ts";

export function update(): void {
    camera!.update(player!.updatePlayer(), player!.x, player!.y);
    entityManager.findMobsAt(player.x, player.y).forEach((mob, index) => {
        mob.update();
        entityManager.updateMob(mob);
    })
    if (graphics.debugMode) {
        graphics.ctx!.font = "11px PixelFont";
    } else {
        graphics.ctx!.font = 7 * settings.defaultTileScale + "px PixelFont";
    }
    // updateInGameUI();
    // for (const mob of Mob.mobList) {
    //     mob.update();
    // }
    // Actor.actorList = Actor.actorList.filter((actor) => actor.isAlive());
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