import {setKnightManager, setWerewolfHumanManager, setWerewolfManager} from "../../graphics/static/managers.ts";
import {SmallPotionOfHealing} from "../items/consumable/potions/smallPotionOfHealing.ts";
import {Slash} from "../skills/slash.ts";
import {Actor} from "./actor.ts";
import Item from "../items/item.ts";
import {entityManager, gameRTC, graphics, player} from "../../main.ts";
import {calcDistance} from "../../../utils/math/2d.ts";
import {scaledTileSize} from "../../../utils/math/general.ts";
import {randomInt} from "../../../utils/math/random.ts";
import {FloatText} from "../../graphics/floatText.ts";
import {Skill} from "../skills/skill.ts";

export interface Equipment {
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

export interface Stats {
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

    get inventory(): Array<Item | undefined> {
        return this._inventory;
    }

    set inventory(value: Array<Item>) {
        this._inventory = value;
    }

    get inventorySize(): number {
        return this._inventorySize;
    }

    set inventorySize(value: number) {
        let diff = value - this.inventorySize;
        if (diff > 0) {
            while (diff--) {
                this.inventory.push(undefined);
            }
        } else if (diff < 0) {
            while (diff < 0) {
                const last = this.inventory[this.inventorySize - 1];
                if (last) {

                }
                diff--;
            }
        }
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
        this.moveSpeed = 3;
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

    public getInventoryFreeSlotsNumber() {
        let counter = 0;
        for (const item of this.inventory) {
            if (!item) {
                counter++;
            }
        }
        return counter;
    }

    public getInventoryFreeSlots(): number[] {
        const free: number[] = [];
        for (let i = 0; i < this.inventorySize; i++) {
            if (!this.inventory[i]) {
                free.push(i);
            }
        }
        return free;
    }

    public getInventoryFilledSlots(): number[] {
        const free: number[] = [];
        for (let i = 0; i < this.inventorySize; i++) {
            if (this.inventory[i]) {
                free.push(i);
            }
        }
        return free;
    }

    public getInventoryFilledSlotsNumber() {
        let counter = 0;
        for (const item of this.inventory) {
            if (item) {
                counter++;
            }
        }
        return counter;
    }

    public getInventoryItems() {
        const free: Item[] = [];
        for (let i = 0; i < this.inventorySize; i++) {
            const item = this.inventory[i];
            if (item) {
                free.push(item);
            }
        }
        return free;
    }

    private findStackableSlot(itemName: string) {
        for (let i = 0; i < this.inventorySize; i++) {
            const item = this.inventory[i];
            if (!item) {
                continue
            }
            if (item.name === itemName && item.stackable && item.amount < item.maxStackSize) {
                return i;
            }
        }
        return -1;
    }

    private findFreeSlot() {
        for (let i = 0; i < this.inventorySize; i++) {
            const item = this.inventory[i];
            if (!item) {
                continue
            }
            return i;
        }
        return -1;
    }

    public pickUp(item: Item): void {
        if (item.stackable) {
            const slot = this.findStackableSlot(item.name);
            if (slot === -1) {
                return //нет места
            }
            this.inventory[slot] = item;
        } else {
            const slot = this.findFreeSlot();
            if (slot === -1) {
                return; //нет места
            }
            this.inventory[slot] = item;
        }
    }

    public drop(item: Item): void {
        const index = this._inventory.indexOf(item);
        if (index > -1) {
            this.inventory[index] = undefined;
        }
    }

    public equip(item: Item): void {
        this.equipment[item.equipmentType] = item;
        this.drop(item);
    }

    public unEquip(item: Item): void {
        this.pickUp(item);
        this.equipment[item.equipmentType] = null;
    }


    // public equipmentSlot(item: Item|null): void {
    //     if (item && item.type === "head") {
    //         this.equipment.head = item;
    //     }
    //     if (item && item.type === "body") {
    //         this.equipment.body = item;
    //     }
    //     if (item && item.type === "legs") {
    //         this.equipment.legs = item;
    //     }
    //     if (item && item.type === "boots") {
    //         this.equipment.boots = item;
    //     }
    //     if (item && item.type === "arms") {
    //         this.equipment.arms = item;
    //     }
    //     if (item && item.type === "weapon") {
    //         this.equipment.weapon = item;
    //     }
    //     if (item && item.type === "shield") {
    //         this.equipment.shield = item;
    //     }
    //     if (item && item.type === "accessory") {
    //         this.equipment.accessory = item;
    //     }
    //     if (item && item.type === "ring") {
    //         if (!this.equipment.ring1) {
    //             this.equipment.ring1 = item;
    //         } else if (!this.equipment.ring2) {
    //             this.equipment.ring2 = item;
    //         } else {
    //             // Replace the first ring with the new one
    //             this.equipment.ring1 = item;
    //         }
    //     }
    // }


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

        if (collision.slide) {
            // Если скольжение по X разрешено
            if (collision.slide.x !== 0) {
                this.x += collision.slide.x * this.moveSpeed;
            }
            // Если скольжение по Y разрешено
            if (collision.slide.y !== 0) {
                this.y += collision.slide.y * this.moveSpeed;
            }
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


    learn<T extends Skill>(spell: T): void {
        this.spellBook.push(spell);
    }

    inRangeOfAttack(): boolean {
        return calcDistance(this.target!, this) < scaledTileSize() * this.attackRange * 1.5;
    }

    attackEvents(): boolean {
        if (this.target == null) {
            return false
        }

        if (this.inRangeOfAttack()) {
            this.autoAttack();
            return true
        }

        return false
    }

    autoAttack(): void {
        if (this.attackDelay.timeIsUp()) {
            this.target!.takeDamage(randomInt(this.minDamage, this.maxDamage), this);
        }
    }

    selectNearestTarget<T extends { x: number, y: number }, U extends {
        x: number,
        y: number
    }>(players: T[], mobs: U[]): void {
        let nearest: T | U = this.target || mobs[0] || players[0];
        const prevTarget: T | U = nearest;
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