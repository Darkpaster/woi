import { AnimatedEffect } from "../../graphics/image.ts";
import { slash } from "../../graphics/paths.ts";
import { slashEffect } from "../../graphics/sprites.ts";
import { Player } from "../actors/player.ts";
import { Skill } from "./skill.ts";

export class Slash extends Skill {
    icon: string;
    animation: AnimatedEffect;
    minDamage: number;
    maxDamage: number;

    constructor(owner: Player) {
        super(owner);
        this.icon = slash;
        this.animation = slashEffect;
        this.name = "Slash";
        this.minDamage = 60;
        this.maxDamage = 85;
        this.description = `Hits enemy for ${this.minDamage} - ${this.maxDamage} damage.<br><br>Cooldown: ${this.cooldown / 1000}`;
    }
}