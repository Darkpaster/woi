import { redPotion } from "../../../../graphics/static/paths.ts";
import { player } from "../../../../main.ts";
import { Potion } from "./potion.ts";
import {txtList} from "../../../../config/lang.ts";
import {formatString} from "../../../../../utils/general/string.ts";
import {randomInt} from "../../../../../utils/math/random.ts";

export class SmallPotionOfHealing extends Potion {

    constructor(ids: number[]) {
        super(ids);
        this.icon = redPotion;
        this.name = txtList().unknownPotion;
        this.minPower = 10;
        this.maxPower = 15;
        this.description = formatString(txtList().unknownPotionDescription, this.minPower, this.maxPower);
        this.note = '\"Made by some amateur alchemist.\"';
    }

    onUse(): void {
        player!.heal(randomInt(this.minPower, this.maxPower));
    }
}