import { AnimatedImageManager } from "../image.ts";
import {boarAnimations, knightAnimations, rabbitAnimations, werewolfAnimations} from "./animatedSprites.ts";


export const madBoarManager = new AnimatedImageManager(boarAnimations);
// export const villagerManager = new AnimatedImageManager(vill);

export const rabbitManager = new AnimatedImageManager(rabbitAnimations);

export const knightManager = new AnimatedImageManager(knightAnimations);
export const werewolfManager = new AnimatedImageManager(werewolfAnimations);


// export const loadingWofl = new AnimatedImageManager(lo);

//hero.render(sheet, ctx, player.x, player.y);
