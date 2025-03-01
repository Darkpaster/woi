import { slash } from "../../graphics/static/paths.ts";
import { slashEffect } from "../../graphics/static/animatedSprites.ts";
import { Player } from "../actors/player.ts";
import { Skill } from "./skill.ts";
import {txtList} from "../../config/lang.ts";

export class Slash extends Skill {

    constructor(owner: Player) {
        super(owner);
        this.sprite = slash;
        this.animation = slashEffect;
        this.name = txtList().slash;
        this.minDamage = 60;
        this.maxDamage = 85;
        this.description = txtList().slashDescription
            .replace('{minDamage}', this.minDamage.toString())
            .replace('{maxDamage}', this.maxDamage.toString());
    }
}