import {settings} from "../../core/config/settings.ts";

export function scaledTileSize(): number {
    return settings.tileSize * settings.defaultTileScale;
}