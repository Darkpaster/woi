import { settings } from "../core/config/settings.ts";
import { Actor } from "../core/logic/actors/actor.ts";
import {Player} from "../core/logic/actors/player.ts";
import {Mob} from "../core/logic/actors/mobs/mob.ts";

export function randomInt(min: number, max: number = 0): number {
    return max > 0 ? Math.round(Math.random() * (max - min)) + min :
    Math.round(Math.random() * min);
}

export function scaledTileSize(): number {
    return settings.tileSize * settings.defaultTileScale;
}

export function calcDistance(entity1: Player|Mob|Actor|null|{x: number, y: number}, entity2: Player|Mob|Actor|null|{x: number, y: number}): number {
    return Math.sqrt(Math.pow(entity2!.x - entity1!.x, 2) + Math.pow(entity2!.y - entity1!.y, 2));
}

export function calcDistanceX<T extends Actor>(entity1: T|{x: number}, entity2: T|{x: number}): number {
    return Math.abs(entity1.x - entity2.x);
}

export function calcDistanceY<T extends Actor>(entity1: T|{y: number}, entity2: T|{y: number}): number {
    return Math.abs(entity1.y - entity2.y);
}