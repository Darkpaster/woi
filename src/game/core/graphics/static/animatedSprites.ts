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
    rabbitRunSheet, redPlantIdleSheet, redPlantWalkSheet,
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
    RUN_PLUS_ATTACK: "runPlusAttack"
}

export function getBlueSlimeAnimations(): AnimationList {
    return {
        idle: new AnimatedImage({name: animationTypes.IDLE, src: blueSlimeIdleSheet, framesNumber: 8, framesRate: 1, imageSize: 64}),
        walk: new AnimatedImage({name: animationTypes.WALK, src: blueSlimeWalkSheet, framesNumber: 8, framesRate: 1, imageSize: 64}),
        run: new AnimatedImage({name: animationTypes.RUN, src: blueSlimeRunSheet, framesNumber: 7, framesRate: 1, imageSize: 64}),
        jump: new AnimatedImage({name: animationTypes.JUMP, src: blueSlimeJumpSheet, framesNumber: 13, framesRate: 1, imageSize: 64}),
        hurt: new AnimatedImage({name: animationTypes.HURT, src: blueSlimeHurtSheet, framesNumber: 6, framesRate: 1, imageSize: 64}),
        death: new AnimatedImage({name: animationTypes.DEATH, src: blueSlimeDeathSheet, framesNumber: 3, framesRate: 1, imageSize: 64}),
        attack1: new AnimatedImage({name: animationTypes.ATTACK1, src: blueSlimeAttack1Sheet, framesNumber: 4, framesRate: 1, imageSize: 64}),
        attack2: new AnimatedImage({name: animationTypes.ATTACK2, src: blueSlimeAttack2Sheet, framesNumber: 4, framesRate: 1, imageSize: 64}),
        attack3: new AnimatedImage({name: animationTypes.ATTACK3, src: blueSlimeAttack3Sheet, framesNumber: 4, framesRate: 1, imageSize: 64}),
        runPlusAttack: new AnimatedImage({name: animationTypes.RUN_PLUS_ATTACK, src: blueSlimeRunPlusAttackSheet, framesNumber: 8, framesRate: 1, imageSize: 64}),
    }
}

export function getRedPlantAnimations(): AnimationList {
    return {
        idle: new AnimatedImage({name: animationTypes.IDLE, src: redPlantIdleSheet, framesNumber: 8}),
        walk: new AnimatedImage({name: animationTypes.WALK, src: redPlantWalkSheet, framesNumber: 8}),
    }
}

export function getBoarAnimations(): AnimationList {
    return {
        idle: new AnimatedImage({name: animationTypes.IDLE, src: madBoarIdleSheet, framesNumber: 8}),
        walk: new AnimatedImage({name: animationTypes.WALK, src: madBoarWalkSheet, framesNumber: 8}),
    }
}

export function getRabbitAnimations(): AnimationList {
    return {
        idle: new AnimatedImage({name: animationTypes.IDLE, src: rabbitIdleSheet, framesNumber: 10, framesRate: 3, imageSize: 10}),
        walk: new AnimatedImage({name: animationTypes.WALK, src: rabbitRunSheet, framesNumber: 6, framesRate: 1, imageSize: 10}),
    }
}

export function getKnightAnimations(): AnimationList {
    return {
        idle: new AnimatedImage({name: animationTypes.IDLE, src: knightIdleSheet, framesNumber: 5, framesRate: 3}),
        walk: new AnimatedImage({name: animationTypes.WALK, src: knightRunSheet, framesNumber: 5, framesRate: 1}),
    }
}

export function getWerewolfAnimations(): AnimationList {
    return {
        idle: new AnimatedImage({name: animationTypes.IDLE, src: werewolfIdleSheet, framesNumber: 8, framesRate: 3, imageSize: 48}),
        walk: new AnimatedImage({name: animationTypes.WALK, src: werewolfRunSheet, framesNumber: 9, framesRate: 0.5, imageSize: 48}),
    }
}

export function getWerewolfHumanAnimations(): AnimationList {
    return {
        idle: new AnimatedImage({name: animationTypes.IDLE, src: human_form_idle, framesNumber: 13, framesRate: 3, imageSize: 32}),
        walk: new AnimatedImage({name: animationTypes.IDLE, src: human_form_idle, framesNumber: 13, framesRate: 3, imageSize: 32}),
    }
}



export function getSlashEffect(): AnimatedEffect {
    return new AnimatedEffect(attackEffect, 8, 100);
}