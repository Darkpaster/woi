import { settings } from "../core/config/settings.ts";
import { Actor } from "../core/logic/actors/actor.ts";

export function randomString(...strings: string[]): string {
    return strings[Math.floor(Math.random() * strings.length)];
}

export function randomInt(min: number, max: number = 0): number {
    return max > 0 ? Math.round(Math.random() * (max - min)) + min :
    Math.round(Math.random() * min);
}

export function scaledTileSize(): number {
    return settings.tileSize * settings.defaultTileScale;
}

interface Entity {
    x: number;
    y: number;
}

export function calcDistance(entity1: Actor, entity2: Actor): number {
    return Math.sqrt(Math.pow(entity2.getX() - entity1.getX(), 2) + Math.pow(entity2.getY() - entity1.getY(), 2));
}

export function calcDistanceX(entity1: Entity, entity2: Entity): number {
    return Math.abs(entity1.x - entity2.x);
}

export function calcDistanceY(entity1: Entity, entity2: Entity): number {
    return Math.abs(entity1.y - entity2.y);
}