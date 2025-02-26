import { settings } from "../config/settings.ts";
import { canvas } from "../graphics/graphics.ts";
import { Camera } from "./camera.ts";
// import { updateInGameUI } from "../../ui/components/components.ts";
import { randomInt, scaledTileSize } from "../../utils/math.ts";
import { Delay } from "../../utils/time.ts";
import { Player } from "./actors/player.ts";
import { madBoar } from "./actors/mobs/enemies/madBoar.ts";
import { Mob } from "./actors/mobs/mob.ts";
import { Slash } from "./skills/slash.ts";
import { setCurrentLocation } from "./world/locationList.ts";

const updateRate: Delay = new Delay(Math.round(100 / settings.delay()));

export let player: Player | null = null,
    camera: Camera | null = null;

export function init(): void {
    setCurrentLocation("spawn");
    player = new Player();
    camera = new Camera({x: player.x, y: player.y});
    player.learn(new Slash(player));
    for (let index: number = 0; index < 50; index++) {
        new madBoar();
    }
}

export function update(): void {
    if (updateRate.timeIsUp()) {
        camera!.update(player!.updatePlayer(), player!.getX(), player!.getY());
        // updateInGameUI();
        for (const mob of Mob.mobList) {
            mob.update();
        }
        // Actor.actorList = Actor.actorList.filter((actor) => actor.isAlive());
    }
    if (canvas!.id !== document.activeElement!.id) {
        canvas!.focus();
    }
}

export function updateZoom(zoomIn: boolean): void {
    const prevPosX: number = player!.getPosX();
    const prevPosY: number = player!.getPosY();
    const prevPos: Array<{ x: number; y: number }> = [];

    for (const mob of Mob.mobList) {
        prevPos.push({ x: mob.getPosX(), y: mob.getPosY() });
    }

    settings.defaultTileScale += zoomIn ? 1 : -1;

    const offsetX: number = prevPosX * scaledTileSize();
    const offsetY: number = prevPosY * scaledTileSize();

    camera!.update(player!.setCoordinates(offsetX, offsetY), player!.getX(), player!.getY());

    // player.image.update(zoomIn ? 1 : -1);

    for (let i: number = 0; i < Mob.mobList.length; i++) {
        const mob: Mob = Mob.mobList[i];
        const offsetX: number = prevPos[i].x * scaledTileSize();
        const offsetY: number = prevPos[i].y * scaledTileSize();

        // mob.image.update(zoomIn ? 1 : -1);
        mob.setCoordinates(offsetX, offsetY);
    }
}