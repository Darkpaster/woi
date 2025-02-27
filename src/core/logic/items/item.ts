import {EntityUIInfo} from "../actors/actor.ts";
import {AnimatedImageManager} from "../../graphics/image.ts";
import * as console from "node:console";

export class Item implements EntityUIInfo {
    get sprite(): string | null | undefined {
        return this._sprite;
    }

    set sprite(value: string | null) {
        this._sprite = value;
    }
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
    get image(): AnimatedImageManager | null | undefined {
        return this._image;
    }

    set image(value: AnimatedImageManager | null) {
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
    private _image?: null | AnimatedImageManager;
    private _sprite?: null | string;
    private _description: string = "No description";
    private _note?: string;
    private _rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" = "common";

    constructor() {
        this._stackable = false;
        this._actions = [];
    }

    public onUse(): void {
        console.log("Item used");
    }

}