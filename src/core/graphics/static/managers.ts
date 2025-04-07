import { AnimatedImageManager } from "../image.ts";
import {
    getBlueSlimeAnimations,
    getBoarAnimations,
    getKnightAnimations,
    getRabbitAnimations,
    getRedPlantAnimations,
    getWerewolfAnimations,
    getWerewolfHumanAnimations,
} from "./animatedSprites.ts";


export function setMadBoarManager() {
    return new AnimatedImageManager(getBoarAnimations());
}

export function setBlueSlimeManager() {
    return new AnimatedImageManager(getBlueSlimeAnimations());
}

export function setRedPlantManager() {
    return new AnimatedImageManager(getRedPlantAnimations());
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

