import {EntityUIInfo} from "../actors/actor.ts";
import {AnimatedImageManager} from "../../graphics/image.ts";

export class Item implements EntityUIInfo {
    get stackable(): boolean {
        return this._stackable;
    }

    set stackable(value: boolean) {
        this._stackable = value;
    }
    get actions(): any[] {
        return this._actions;
    }

    set actions(value: any[]) {
        this._actions = value;
    }
    get image(): AnimatedImageManager | null | undefined | string {
        return this._image;
    }

    set image(value: AnimatedImageManager | null | string) {
        this._image = value;
    }
    get note(): string | undefined {
        return this._note;
    }

    set note(value: string) {
        this._note = value;
    }
    get rarity(): "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" {
        return this._rarity;
    }

    set rarity(value: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike") {
        this._rarity = value;
    }
    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }
    private _stackable: boolean;
    private _actions: any[];

    private _name: string = "Item";
    private _image?: AnimatedImageManager | null | string;
    private _description: string = "No description";
    private _note?: string;
    private _rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" = "common";

    constructor() {
        this._stackable = false;
        this._actions = [];
        this._image = "";
    }

    public onUse(): void {
        console.log("Item used");
    }

}