import { redPotion } from "../../../../graphics/static/paths.ts";
import { randomInt } from "../../../../../utils/math.ts";
import { player } from "../../../../main.ts";
import { Potion } from "./potion.ts";
import {lang, txtList} from "../../../../config/lang.ts";
import {settings} from "../../../../config/settings.ts";

export class smallPotionOfHealing extends Potion {

    constructor() {
        super();
        this.sprite = redPotion;
        this.name = txtList().unknownPotion;
        this.minPower = 10;
        this.maxPower = 15;
        this.description = txtList().unknownPotionDescription
            .replace('{minPower}', this.minPower.toString())
            .replace('{maxPower}', this.maxPower.toString());
        this.note = '\"Made by some amateur alchemist.\"';
    }

    onUse(): void {
        player!.heal(randomInt(this.minPower, this.maxPower));
    }
}