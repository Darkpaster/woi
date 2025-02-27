import { slash } from "../../graphics/static/paths.ts";
import { slashEffect } from "../../graphics/static/animatedSprites.ts";
import { Player } from "../actors/player.ts";
import { Skill } from "./skill.ts";

export class Slash extends Skill {

    constructor(owner: Player) {
        super(owner);
        this.sprite = slash;
        this.animation = slashEffect;
        this.name = "Slash";
        this.minDamage = 60;
        this.maxDamage = 85;
        this.description = `Hits enemy for ${this.minDamage} - ${this.maxDamage} damage.<br><br>Cooldown: ${this.cooldown / 1000}`;
    }
}