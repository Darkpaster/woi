import { AnimatedEffect, AnimatedImage } from "../image.ts";
import {
    attackEffect,
    blueSlimeAttack1Sheet,
    blueSlimeAttack2Sheet,
    blueSlimeAttack3Sheet, blueSlimeDeathSheet, blueSlimeHurtSheet,
    blueSlimeIdleSheet, blueSlimeJumpSheet, blueSlimeRunPlusAttackSheet, blueSlimeRunSheet, blueSlimeWalkSheet,
    human_form_idle,
    knightIdleSheet,
    knightRunSheet,
    madBoarIdleSheet,
    madBoarWalkSheet,
    rabbitIdleSheet,
    rabbitRunSheet,
    werewolfIdleSheet,
    werewolfRunSheet
} from "./paths.ts";

export interface AnimationList { //кадры, скорость, размер
    [key: string]: AnimatedImage;
}

export const animationTypes = {
    IDLE: "idle",
    WALK: "walk",
    RUN: "run",
    JUMP: "jump",
    HURT: "hurt",
    DEATH: "death",
    ATTACK1: "attack1",
    ATTACK2: "attack2",
    ATTACK3: "attack3",
}

export function getBlueSlimeAnimations(): AnimationList {
    return {
        idle: new AnimatedImage("idle", blueSlimeIdleSheet, 8, 1, 64),
        walk: new AnimatedImage("walk", blueSlimeWalkSheet, 8, 1, 64),
        run: new AnimatedImage("run", blueSlimeRunSheet, 7, 1, 64),
        jump: new AnimatedImage("jump", blueSlimeJumpSheet, 13, 1, 64),
        hurt: new AnimatedImage("hurt", blueSlimeHurtSheet, 6, 1, 64),
        death: new AnimatedImage("death", blueSlimeDeathSheet, 3, 1, 64),
        attack1: new AnimatedImage("attack1", blueSlimeAttack1Sheet, 4, 1, 64),
        attack2: new AnimatedImage("attack2", blueSlimeAttack2Sheet, 4, 1, 64),
        attack3: new AnimatedImage("attack3", blueSlimeAttack3Sheet, 4, 1, 64),
        runPlusAttack: new AnimatedImage("runPlusAttack", blueSlimeRunPlusAttackSheet, 10, 1, 64),
    }
}

export function getRedPlantAnimations(): AnimationList {
    return {
        idle: new AnimatedImage("idle", madBoarIdleSheet, 8),
        walk: new AnimatedImage("walk", madBoarWalkSheet, 8),
    }
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
        idle: new AnimatedImage("idle", werewolfIdleSheet, 8, 3, 48),
        walk: new AnimatedImage("walk", werewolfRunSheet, 9, 0.5, 48),
    }
}

export function getWerewolfHumanAnimations(): AnimationList {
    return {
        idle: new AnimatedImage("idle", human_form_idle, 13, 3, 32),
        walk: new AnimatedImage("walk", human_form_idle, 13, 3, 32),
    }
}



export function getSlashEffect(): AnimatedEffect {
    return new AnimatedEffect(attackEffect, 8, 100);
}