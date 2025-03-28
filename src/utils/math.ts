import { settings } from "../core/config/settings.ts";

export function randomInt(min: number, max: number = 0): number {
    return max > 0 ? Math.round(Math.random() * (max - min)) + min :
    Math.round(Math.random() * min);
}

export function scaledTileSize(): number {
    return settings.tileSize * settings.defaultTileScale;
}

export function calcDistance<T extends { x: number, y: number }>(entity1: T, entity2: T): number {
    return Math.sqrt(Math.pow(entity2!.x - entity1!.x, 2) + Math.pow(entity2!.y - entity1!.y, 2));
}

export function calcDistanceX<T extends { x: number, y: number }>(entity1: T, entity2: T): number {
    return Math.abs(entity1.x - entity2.x);
}

export function calcDistanceY<T extends { x: number, y: number }>(entity1: T, entity2: T): number {
    return Math.abs(entity1.y - entity2.y);
}