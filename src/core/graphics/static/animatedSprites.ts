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

export interface AnimationList {
    idle: AnimatedImage;
    walk: AnimatedImage;
}

// export const zombieAnimations: AnimationList = {
//     idle: new AnimatedImage("idle", "src/assets/character/basic asset pack/Basic Undead Animations/Mutilated Stumbler/MutilatedStumbler.png", 4),
//     walk: new AnimatedImage("walk", "src/assets/character/basic asset pack/Basic Undead Animations/Mutilated Stumbler/MutilatedStumbler.png", 4),
// };
//
// export const skeletonAnimations: AnimationList = {
//     idle: new AnimatedImage("idle", "src/assets/character/basic asset pack/Basic Undead Animations/Decrepit Bones/DecrepitBones.png", 4),
//     walk: new AnimatedImage("walk", "src/assets/character/basic asset pack/Basic Undead Animations/Decrepit Bones/DecrepitBones.png", 4),
// };

export const boarAnimations: AnimationList = {
    idle: new AnimatedImage("idle", madBoarIdleSheet, 8),
    walk: new AnimatedImage("walk", madBoarWalkSheet, 8),
};

export const rabbitAnimations: AnimationList = {
    idle: new AnimatedImage("idle", rabbitIdleSheet, 10),
    walk: new AnimatedImage("walk", rabbitRunSheet, 6),
};

export const knightAnimations: AnimationList = {
    idle: new AnimatedImage("idle", knightIdleSheet, 4),
    walk: new AnimatedImage("walk", knightRunSheet, 4),
};

export const werewolfAnimations: AnimationList = {
    idle: new AnimatedImage("idle", werewolfIdleSheet, 8, 3, 64),
    walk: new AnimatedImage("walk", werewolfRunSheet, 9, 0.5, 64),
};

// export const loadingAnimations: AnimationList = {
//     idle: new AnimatedImage("idle", runningWolf, 4),
//     walk: new AnimatedImage("walk", runningWolf, 4),
// };

export const slashEffect: AnimatedEffect = new AnimatedEffect(attackEffect, 8, 100);