import { redPotion } from "../../../../graphics/paths.ts";
import { randomInt } from "../../../../../utils/math.ts";
import { player } from "../../../update.ts";
import { Potion } from "./potion.ts";

export class smallPotionOfHealing extends Potion {

    constructor() {
        super();
        this.image = redPotion;
        this.name = "Potion of healing";
        this.description = "On use it heals for 10 - 15 points.";
        this.note = '\"Made by some amateur alchemist.\"';
    }

    onUse(): void {
        player!.heal(randomInt(10, 15));
    }
}