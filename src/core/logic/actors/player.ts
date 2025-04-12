import {setKnightManager, setWerewolfHumanManager, setWerewolfManager} from "../../graphics/static/managers.ts";
import {SmallPotionOfHealing} from "../items/consumable/potions/smallPotionOfHealing.ts";
import {Slash} from "../skills/slash.ts";
import {Actor} from "./actor.ts";
import Item from "../items/item.ts";
import {player} from "../../main.ts";
import {calcDistance} from "../../../utils/math/2d.ts";
import {scaledTileSize} from "../../../utils/math/general.ts";

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

interface Stats {
    strength: number;
    dexterity: number;
    intelligence: number;
    wisdom: number;
    constitution: number;
    charisma: number;
    luck: number;
}

export default class Player extends Actor {
    get stats(): Stats {
        return this._stats;
    }

    set stats(value: Stats) {
        this._stats = value;
    }
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

    static characterType: { [key: string]: string } = {
        WANDERER: "wanderer"
    }

    // static getCharacterByType(type: string) {
    //     switch (type) {
    //         case this.characterType.WANDERER:
    //             return new Wanderer();
    //     }
    // }

    private _AA: boolean;
    private _inventory: Array<Item>;
    readonly equipment: Equipment;
    private _experience: number;
    private _level: number;
    private _gold: number;
    private _inventorySize: number;
    private _skillPoints: number;

    private _stats: Stats;

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
        this.moveSpeed = 1;
        this._AA = true;
        this.image = setWerewolfHumanManager();
        this.name = "Георгий";
        this._inventorySize = 20
        this._inventory = new Array(this._inventorySize);
        this.spellBook = [new Slash(this), null, null, null, null, null, null, null, null, null];

        this._stats = {
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            wisdom: 10,
            constitution: 10,
            charisma: 10,
            luck: 10,
        }

        this.fearFactor = 10;

        for (let i = 0; i < this._inventory.length / 10; i++) {
            this._inventory[i] = new SmallPotionOfHealing();
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


    // Также исправим updatePlayer для более надежной работы в отрицательных координатах
    updatePlayer(): { x: number, y: number } {
        if (this._AA) {
            this.attackEvents();
        }

        // Сохраняем предыдущие координаты
        const previousX = this.x;
        const previousY = this.y;
        const cameraDiff = {x: this.x, y: this.y};

        // Применяем движение по обеим осям сразу
        let newX = this.x;
        let newY = this.y;

        if (this.pressUp) {
            newY -= this.moveSpeed;
        } else if (this.pressDown) {
            newY += this.moveSpeed;
        }

        if (this.pressLeft) {
            this.direction = "left";
            newX -= this.moveSpeed;
        } else if (this.pressRight) {
            this.direction = "right";
            newX += this.moveSpeed;
        }

        // Обновляем положение и проверяем коллизию
        this.x = newX;
        this.y = newY;

        const collision = this.collision();

        // Откатываем координаты при коллизии
        if (collision.x) {
            this.x = previousX;
        }

        if (collision.y) {
            this.y = previousY;
        }

        // Рассчитываем смещение камеры
        this.offsetX = cameraDiff.x - this.x;
        this.offsetY = cameraDiff.y - this.y;

        // Обновляем состояние анимации
        if (this.offsetX === 0 && this.offsetY === 0) {
            this.renderState = "idle";
        } else {
            this.renderState = "walk";
        }

        return {
            x: this.offsetX,
            y: this.offsetY
        };
    }

    selectNearestTarget<T extends {x: number, y: number}, U extends {x: number, y: number}>(players: T[], mobs: U[]): void {
        let nearest: T|U = this.target || mobs[0] || players[0];
        const prevTarget: T|U = nearest;
        for (const mob of mobs) {
            const dist: number = calcDistance(mob, {x: player.x, y: player.y});
            if (dist < 430) {
                if (dist < calcDistance(nearest, {x: player.x, y: player.y})) {
                    nearest = mob;
                }
            }
        }
        for (const char of players) {
            const dist: number = calcDistance(char, {x: player.x, y: player.y});
            if (dist < 430) {
                if (dist < calcDistance(nearest, {x: player.x, y: player.y})) {
                    nearest = char;
                }
            }
        }
        if (prevTarget === nearest) {
            return;
        }
        this.target = nearest;
    }
}