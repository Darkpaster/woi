import { slash } from "../../graphics/static/paths.ts";
import Player from "../actors/player.ts";
import { Skill } from "./skill.ts";
import {txtList} from "../../config/lang.ts";
import {getSlashEffect} from "../../graphics/static/animatedSprites.ts";
import {formatString} from "../../../../utils/general/string.ts";

export class Slash extends Skill {

    constructor(owner: Player) {
        super(owner);
        this.icon = slash;
        this.animation = getSlashEffect();
        this.name = txtList().slash;
        this.minDamage = 60;
        this.maxDamage = 85;
        this.description = formatString(txtList().slashDescription, this.minDamage, this.maxDamage);
    }
}