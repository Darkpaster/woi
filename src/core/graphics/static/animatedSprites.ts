import { AnimatedEffect, AnimatedImage } from "../image.ts";
import {
    attackEffect,
    knightIdleSheet,
    knightRunSheet, madBoarIdleSheet,
    madBoarWalkSheet,
    rabbitIdleSheet,
    rabbitRunSheet,
    werewolfIdleSheet, werewolfRunSheet
} from "./paths.ts";

export interface AnimationList { //кадры, скорость, размер
    idle: AnimatedImage;
    walk: AnimatedImage;
}

export function getBoarAnimations(): AnimationList {
    return {
        idle: new AnimatedImage("idle", madBoarIdleSheet, 8),
        walk: new AnimatedImage("walk", madBoarWalkSheet, 8),
    }
}

export function getRabbitAnimations(): AnimationList {
    return {
        idle: new AnimatedImage("idle", rabbitIdleSheet, 10, 3, 10),
        walk: new AnimatedImage("walk", rabbitRunSheet, 6, 1, 10),
    }
}

export function getKnightAnimations(): AnimationList {
    return {
        idle: new AnimatedImage("idle", knightIdleSheet, 5, 3),
        walk: new AnimatedImage("walk", knightRunSheet, 5, 1),
    }
}

export function getWerewolfAnimations(): AnimationList {
    return {
        idle: new AnimatedImage("idle", werewolfIdleSheet, 8, 3, 32),
        walk: new AnimatedImage("walk", werewolfRunSheet, 9, 0.5, 32),
    }
}



export function getSlashEffect(): AnimatedEffect {
    return new AnimatedEffect(attackEffect, 8, 100);
}