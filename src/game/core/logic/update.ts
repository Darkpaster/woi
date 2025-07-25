import { settings } from "../config/settings.ts";
import { camera, entityManager, graphics, player } from "../main.ts";
import { scaledTileSize } from "../../../utils/math/general.ts";

export function update(): void {
    if (!player || !camera || !graphics) {
        console.warn("Core game objects not initialized");
        return;
    }

    updatePlayer();
    updateMobs();
    updateGraphicsContext();
}

export function updateZoom(zoomIn: boolean): void {
    if (!player || !camera) {
        console.warn("Player or camera not initialized for zoom update");
        return;
    }

    const previousPosition = {
        x: player.posX,
        y: player.posY
    };

    settings.defaultTileScale += zoomIn ? 1 : -1;

    const newX = previousPosition.x * scaledTileSize();
    const newY = previousPosition.y * scaledTileSize();

    camera.update(player.setCoordinates(newX, newY), player.x, player.y);
}

function updatePlayer(): void {
    const playerMovement = player!.updatePlayer();
    camera!.update(playerMovement, player!.x, player!.y);
}

function updateMobs(): void {
    const nearbyMobs = entityManager.findMobsAt(player!.x, player!.y);

    for (const mob of nearbyMobs) {
        entityManager.updateMob({
            actorId: mob.id,
            name: mob.name,
            x: mob.x / settings.defaultTileScale,
            y: mob.y / settings.defaultTileScale,
            renderState: mob.renderState,
            health: mob.HP
        });
    }
}

function updateGraphicsContext(): void {
    const context = graphics!.ctx;
    if (!context) return;

    const fontSize = graphics!.debugMode
        ? "11px PixelFont"
        : `${7 * settings.defaultTileScale}px PixelFont`;

    context.font = fontSize;
}