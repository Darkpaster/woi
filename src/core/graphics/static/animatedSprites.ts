import { AnimatedEffect, AnimatedImage } from "../image.ts";
import { attackEffect, madBoar, runningWolf, villagerDrunk } from "./paths.ts";

interface CharacterAnimations {
    idle: AnimatedImage;
    walk: AnimatedImage;
}

export const zombie: CharacterAnimations = {
    idle: new AnimatedImage("idle", "src/assets/character/basic asset pack/Basic Undead Animations/Mutilated Stumbler/MutilatedStumbler.png", 4),
    walk: new AnimatedImage("walk", "src/assets/character/basic asset pack/Basic Undead Animations/Mutilated Stumbler/MutilatedStumbler.png", 4),
};

export const skeleton: CharacterAnimations = {
    idle: new AnimatedImage("idle", "src/assets/character/basic asset pack/Basic Undead Animations/Decrepit Bones/DecrepitBones.png", 4),
    walk: new AnimatedImage("walk", "src/assets/character/basic asset pack/Basic Undead Animations/Decrepit Bones/DecrepitBones.png", 4),
};

export const boar: CharacterAnimations = {
    idle: new AnimatedImage("idle", madBoar, 4),
    walk: new AnimatedImage("walk", madBoar, 4),
};

export const villager: CharacterAnimations = {
    idle: new AnimatedImage("idle", villagerDrunk, 4),
    walk: new AnimatedImage("walk", villagerDrunk, 4),
};

export const loading: CharacterAnimations = {
    idle: new AnimatedImage("idle", runningWolf, 4),
    walk: new AnimatedImage("walk", runningWolf, 4),
};

export const slashEffect: AnimatedEffect = new AnimatedEffect(attackEffect, 8, 100);