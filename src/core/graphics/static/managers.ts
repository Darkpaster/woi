import { AnimatedImageManager } from "../image.ts";
import {
    getBoarAnimations, getKnightAnimations, getRabbitAnimations, getWerewolfAnimations, getWerewolfHumanAnimations,
} from "./animatedSprites.ts";


export function setMadBoarManager() {
    return new AnimatedImageManager(getBoarAnimations());
}

export function setRabbitManager() {
    return new AnimatedImageManager(getRabbitAnimations());
}

export function setKnightManager() {
 return new AnimatedImageManager(getKnightAnimations());
}
export function setWerewolfManager() {
    return new AnimatedImageManager(getWerewolfAnimations());
}

export function setWerewolfHumanManager() {
    return new AnimatedImageManager(getWerewolfHumanAnimations());
}


// export const loadingWofl = new AnimatedImageManager(lo);

