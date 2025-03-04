import {EntityUIInfo} from "../actors/actor.ts";
import {AnimatedImageManager} from "../../graphics/image.ts";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import {v4 as uuidv4} from "uuid";
import * as console from "node:console";

export class Item implements EntityUIInfo {
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }
    get icon(): string | null | undefined {
        return this._sprite;
    }

    set icon(value: string | null) {
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
    private _id: string = uuidv4();
    private _image?: null | AnimatedImageManager;
    private _sprite?: null | string;
    private _description: string = "No description";
    private _note?: string;
    private _rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" = "common";

    private _x: number = 0;
    private _y: number = 0;

    constructor() {
        this._stackable = false;
        this._actions = [];
    }

    public onUse(): void {
        console.log("Item used");
    }

}