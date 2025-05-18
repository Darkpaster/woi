import {AnimatedImageManager} from "../../graphics/image.ts";
import {EquipmentType, RarityTypes} from "../../types.ts";

export default class Item {
    get maxStackSize(): number {
        return this._maxStackSize;
    }
    get amount(): number {
        return this._amount;
    }

    set amount(ids: number[]) {
        if (!this.stackable || ids.length > this._maxStackSize || ids.length < 1) {
            return
        }

        this.ids = [...ids];
        this._amount = ids.length;
    }
    get ids(): number[] {
        return this._ids;
    }

    set ids(value: number[]) {
        this._ids = [...value];
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
    get rarity(): RarityTypes {
        return this._rarity;
    }

    set rarity(value: RarityTypes) {
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
    private _amount: number;
    private _maxStackSize: number;
    private equipmentType: EquipmentType;

    private _name: string = "Item";
    private _ids: number[] = [];
    private _image?: null | AnimatedImageManager;
    private _sprite?: null | string;
    private _description: string = "No description";
    private _note?: string;
    private _rarity: RarityTypes = "common";

    private _x: number = 0;
    private _y: number = 0;

    constructor(ids: number[]) {
        this._maxStackSize = 64;
        this._amount = 1;
        this._stackable = ids.length > 1;
        this.amount = ids; //вся херня в геттере
        this.equipmentType = "none";
    }

    public onUse(): void {
        console.log("Item used");
    }

}