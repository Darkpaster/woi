import { greyPotion } from "../../../../graphics/static/paths.ts";
import { Item } from "../../item.ts";

export class Potion extends Item {
    cooldown: number;
    price: number;

    constructor() {
        super();
        this.sprite = greyPotion;
        this.name = "Unknown potion";
        this.description = "It has unknown effects.";
        this.cooldown = 0;
        this.price = 1;
        this.stackable = true;
    }

    onUse(): void {
        alert("default!");
    }
}