import { greyPotion } from "../../../../graphics/static/paths.ts";
import { Item } from "../../item.ts";

export class Potion extends Item {
    get minPower(): number {
        return this._minPower;
    }

    set minPower(value: number) {
        this._minPower = value;
    }
    get maxPower(): number {
        return this._maxPower;
    }

    set maxPower(value: number) {
        this._maxPower = value;
    }
    cooldown: number;
    price: number;
    private _minPower: number = 1;
    private _maxPower: number = 1;

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