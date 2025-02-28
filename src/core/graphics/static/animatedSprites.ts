import { AnimatedEffect, AnimatedImage } from "../image.ts";
import { attackEffect, madBoar, runningWolf, villagerDrunk } from "./paths.ts";

export interface AnimationList {
    idle: AnimatedImage;
    walk: AnimatedImage;
}

export const zombie: AnimationList = {
    idle: new AnimatedImage("idle", "src/assets/character/basic asset pack/Basic Undead Animations/Mutilated Stumbler/MutilatedStumbler.png", 4),
    walk: new AnimatedImage("walk", "src/assets/character/basic asset pack/Basic Undead Animations/Mutilated Stumbler/MutilatedStumbler.png", 4),
};

export const skeleton: AnimationList = {
    idle: new AnimatedImage("idle", "src/assets/character/basic asset pack/Basic Undead Animations/Decrepit Bones/DecrepitBones.png", 4),
    walk: new AnimatedImage("walk", "src/assets/character/basic asset pack/Basic Undead Animations/Decrepit Bones/DecrepitBones.png", 4),
};

export const boar: AnimationList = {
    idle: new AnimatedImage("idle", madBoar, 4),
    walk: new AnimatedImage("walk", madBoar, 4),
};

export const villager: AnimationList = {
    idle: new AnimatedImage("idle", villagerDrunk, 4),
    walk: new AnimatedImage("walk", villagerDrunk, 4),
};

export const loading: AnimationList = {
    idle: new AnimatedImage("idle", runningWolf, 4),
    walk: new AnimatedImage("walk", runningWolf, 4),
};

export const slashEffect: AnimatedEffect = new AnimatedEffect(attackEffect, 8, 100);