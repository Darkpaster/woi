import {setKnightManager, setWerewolfHumanManager, setWerewolfManager} from "../../graphics/static/managers.ts";
import {calcDistance, scaledTileSize} from "../../../utils/math.ts";
import {smallPotionOfHealing} from "../items/consumable/potions/smallPotionOfHealing.ts";
import {Slash} from "../skills/slash.ts";
import {Actor} from "./actor.ts";
import {Item} from "../items/item.ts";

interface Equipment {
    head: any;
    body: any;
    legs: any;
    boots: any;
    arms: any;
    weapon: any;
    shield: any;
    accessory: any;
    ring1: any;
    ring2: any;
}

export class Player extends Actor {
    get AA(): boolean {
        return this._AA;
    }

    set AA(value: boolean) {
        this._AA = value;
    }
    get inventory(): Array<Item> {
        return this._inventory;
    }

    set inventory(value: Array<Item>) {
        this._inventory = value;
    }
    get inventorySize(): number {
        return this._inventorySize;
    }

    set inventorySize(value: number) {
        this._inventorySize = value;
    }
    get skillPoints(): number {
        return this._skillPoints;
    }

    set skillPoints(value: number) {
        this._skillPoints = value;
    }
    get gold(): number {
        return this._gold;
    }

    set gold(value: number) {
        this._gold = value;
    }
    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this._level = value;
    }
    get experience(): number {
        return this._experience;
    }

    set experience(value: number) {
        this._experience = value;
    }
    get luck(): number {
        return this._luck;
    }

    set luck(value: number) {
        this._luck = value;
    }
    get charisma(): number {
        return this._charisma;
    }

    set charisma(value: number) {
        this._charisma = value;
    }
    get constitution(): number {
        return this._constitution;
    }

    set constitution(value: number) {
        this._constitution = value;
    }
    get wisdom(): number {
        return this._wisdom;
    }

    set wisdom(value: number) {
        this._wisdom = value;
    }
    get intelligence(): number {
        return this._intelligence;
    }

    set intelligence(value: number) {
        this._intelligence = value;
    }
    get dexterity(): number {
        return this._dexterity;
    }

    set dexterity(value: number) {
        this._dexterity = value;
    }
    get strength(): number {
        return this._strength;
    }

    set strength(value: number) {
        this._strength = value;
    }

    private _AA: boolean;
    private _inventory: Array<Item>;
    readonly equipment: Equipment;
    private _strength: number;
    private _dexterity: number;
    private _intelligence: number;
    private _wisdom: number;
    private _constitution: number;
    private _charisma: number;
    private _luck: number;
    private _experience: number;
    private _level: number;
    private _gold: number;
    private _inventorySize: number;
    private _skillPoints: number;

    public pressDown: boolean = false;
    public pressUp: boolean = false;
    public pressLeft: boolean = false;
    public pressRight: boolean = false;

    constructor() {
        super();
        this.x = scaledTileSize() * -2;
        this.y = scaledTileSize() * -6;
        this.HP = 100;
        this.HT = 100;
        this.minDamage = 15;
        this.maxDamage = 35;
        this.criticalChance = 0.3;
        this.moveSpeed = 10;
        this._AA = true;
        this.image = setWerewolfHumanManager();
        this.name = "Георгий";
        this._inventorySize = 20
        this._inventory = new Array(this._inventorySize);
        this.spellBook = [new Slash(this), null, null, null, null, null, null, null, null, null];

        this.fearFactor = 10;

        for (let i = 0; i < this._inventory.length / 10; i++) {
            this._inventory[i] = new smallPotionOfHealing();
        }

        this.equipment = {
            head: null,
            body: null,
            legs: null,
            boots: null,
            arms: null,
            weapon: null,
            shield: null,
            accessory: null,
            ring1: null,
            ring2: null
        };

        this._strength = 10
        this._dexterity = 10
        this._intelligence = 10
        this._wisdom = 10
        this._constitution = 10
        this._charisma = 10
        this._luck = 10
        this._experience = 0
        this._level = 1
        this._gold = 0
        this._skillPoints = 0

    }

    pickUp(item: any): void {
        this._inventory.push(item);
    }

    drop(item: any): void {
        const index = this._inventory.indexOf(item);
        if (index > -1) {
            this._inventory.splice(index, 1);
        }
    }

    equip(item: any): void {
        this.equipmentSlot(item);
        this.drop(item);
    }

    unEquip(item: any): void {
        this.pickUp(item);
        this.equipmentSlot(null);
    }


    equipmentSlot(item?: any): void {
        if (item && item.type === "head") {
            this.equipment.head = item;
        }
        if (item && item.type === "body") {
            this.equipment.body = item;
        }
        if (item && item.type === "legs") {
            this.equipment.legs = item;
        }
        if (item && item.type === "boots") {
            this.equipment.boots = item;
        }
        if (item && item.type === "arms") {
            this.equipment.arms = item;
        }
        if (item && item.type === "weapon") {
            this.equipment.weapon = item;
        }
        if (item && item.type === "shield") {
            this.equipment.shield = item;
        }
        if (item && item.type === "accessory") {
            this.equipment.accessory = item;
        }
        if (item && item.type === "ring") {
            if (!this.equipment.ring1) {
                this.equipment.ring1 = item;
            } else if (!this.equipment.ring2) {
                this.equipment.ring2 = item;
            } else {
                // Replace the first ring with the new one
                this.equipment.ring1 = item;
            }
        }
    }

    updatePlayer(): { x: number, y: number } {
        if (this._AA) {
            this.attackEvents();
        }

        const cameraDiff = {x: this.x, y: this.y};

        if (this.pressUp) {
            this.y -= this.moveSpeed;
        } else if (this.pressDown) {
            this.y += this.moveSpeed;
        }
        if (this.pressLeft) {
            this.direction = "left";
            this.x -= this.moveSpeed;
        } else if (this.pressRight) {
            this.direction = "right";
            this.x += this.moveSpeed;
        }

        const collision = this.collision();

        if (collision.x) {
            this.x = cameraDiff.x;
        }
        if (collision.y) {
            this.y = cameraDiff.y;
        }

        this.offsetX = cameraDiff.x = cameraDiff.x - this.x;
        this.offsetY = cameraDiff.y = cameraDiff.y - this.y;

        if (this.offsetX === 0 && this.offsetY === 0) {
            this.renderState = "idle";
        } else {
            this.renderState = "walk";
        }


        return cameraDiff;
    }

    selectNearestTarget(): void {
        // let nearest: Mob | Player = this.target || Mob.mobList[0];
        // const prevTarget: Mob | Player = nearest;
        // for (const mob of Mob.mobList) {
        //     const dist: number = calcDistance(mob, this);
        //     if (dist < 430) {
        //         if (dist < calcDistance(nearest, this)) {
        //             nearest = mob;
        //         }
        //     }
        // }
        // if (prevTarget === nearest) {
        //     return;
        // }
        // this.target = nearest;
    }
}