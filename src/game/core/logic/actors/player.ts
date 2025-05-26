import {setKnightManager, setWerewolfHumanManager, setWerewolfManager} from "../../graphics/static/managers.ts";
import {SmallPotionOfHealing} from "../items/consumable/potions/smallPotionOfHealing.ts";
import {Slash} from "../skills/slash.ts";
import {Actor} from "./actor.ts";
import Item from "../items/item.ts";
import {entityManager, gameRTC, graphics, player, worldMap} from "../../main.ts";
import {calcDistance} from "../../../../utils/math/2d.ts";
import {scaledTileSize} from "../../../../utils/math/general.ts";
import {randomInt} from "../../../../utils/math/random.ts";
import {FloatText} from "../../graphics/floatText.ts";
import {Skill} from "../skills/skill.ts";
import {tileList} from "../../graphics/tilesGenerator.ts";

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
    public experience: number;
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
        this._inventorySize = 30
        this._inventory = new Array(this._inventorySize);
        this.spellBook = [new Slash(this), null, null, null, null, null, null, null, null, null];

        this.pickUp(new SmallPotionOfHealing([1, 2, 3, 4, 5, 6, 7]));
        this.pickUp(new SmallPotionOfHealing([8, 9, 10]));

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


        this.experience = 0
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

    public getInventoryItems(): Item[] {
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

    public pickUp(item: Item): void {
        console.log('Trying to pick up:', item.name, 'Stackable:', item.stackable);

        if (item.stackable) {
            const slot = this.findStackableSlot(item.name);
            console.log('Stackable slot found:', slot);
            if (slot !== -1) {
                const existingItem = this.inventory[slot];
                if (existingItem && existingItem.amount + item.amount <= existingItem.maxStackSize) {
                    const combinedIds = [...existingItem.ids, ...item.ids];
                    existingItem.amount = combinedIds;
                    console.log('Item stacked successfully');
                    return;
                }
            }

            const freeSlot = this.findFreeSlot();
            console.log('Free slot for stackable item:', freeSlot);
            if (freeSlot === -1) {
                console.log('No free space in inventory');
                return;
            }
            this.inventory[freeSlot] = item;
            console.log('Stackable item placed in slot:', freeSlot);
        } else {
            const slot = this.findFreeSlot();
            console.log('Free slot for non-stackable item:', slot);
            if (slot === -1) {
                console.log('No free space in inventory');
                return;
            }
            this.inventory[slot] = item;
            console.log('Non-stackable item placed in slot:', slot);
        }
    }

    private findFreeSlot() {
        for (let i = 0; i < this.inventorySize; i++) {
            const item = this.inventory[i];
            if (!item) {
                return i;
            }
        }
        return -1;
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

    collision(): { x: boolean, y: boolean, slide?: { x: number, y: number } } {
        // Результат коллизии по осям X и Y
        const result: { x: boolean, y: boolean, slide?: { x: number, y: number } } = { x: false, y: false };

        // Текущие координаты игрока
        const playerPosX = this.posX;
        const playerPosY = this.posY;

        // Предыдущие координаты игрока (для определения направления движения)
        const lastPosX = this.lastPosX || playerPosX;
        const lastPosY = this.lastPosY || playerPosY;

        // Направление движения
        const moveX = playerPosX - lastPosX;
        const moveY = playerPosY - lastPosY;

        // Радиус коллизии персонажа
        const playerRadius = 0.7;
        // Радиус проверки тайлов вокруг игрока
        const checkRadius = 1;

        // Получаем матрицу тайлов слоя переднего плана вокруг игрока
        const screenTiles = worldMap.getScreenTileMatrix("foreground");
        if (!screenTiles || !screenTiles.matrix.length) {
            return result; // Если матрицы нет, коллизии нет
        }

        // Определяем область проверки в пределах матрицы тайлов
        const startTileX = Math.max(Math.floor(playerPosX - checkRadius) - screenTiles.startX, 0);
        const startTileY = Math.max(Math.floor(playerPosY - checkRadius) - screenTiles.startY, 0);
        const endTileX = Math.min(Math.ceil(playerPosX + checkRadius) - screenTiles.startX, screenTiles.width - 1);
        const endTileY = Math.min(Math.ceil(playerPosY + checkRadius) - screenTiles.startY, screenTiles.height - 1);

        // Информация о ближайшей коллизии
        let nearestCollision = {
            distance: Number.MAX_VALUE,
            dx: 0,
            dy: 0,
            tile: null as any
        };

        // Проверяем тайлы в области вокруг игрока
        for (let localY = startTileY; localY <= endTileY; localY++) {
            for (let localX = startTileX; localX <= endTileX; localX++) {
                // Пропускаем, если выходим за границы матрицы
                if (localY < 0 || localY >= screenTiles.matrix.length ||
                    localX < 0 || localX >= screenTiles.matrix[localY].length) {
                    continue;
                }

                // Получаем ID тайла
                const tileId = screenTiles.matrix[localY][localX];
                const tile = tileList[tileId];

                // Если тайл существует и по нему нельзя ходить
                if (tile && !tile.props.isWalkable) {
                    // Вычисляем глобальные координаты тайла
                    const tileGlobalX = screenTiles.startX + localX;
                    const tileGlobalY = screenTiles.startY + localY;

                    // Расстояние между игроком и центром тайла
                    const dx = playerPosX - (tileGlobalX + 0.5);
                    const dy = playerPosY - (tileGlobalY + 0.5);
                    const distanceSquared = dx * dx + dy * dy;

                    // Квадрат порога коллизии (сумма радиуса игрока и половины тайла)
                    const thresholdSquared = (playerRadius + 0.5) * (playerRadius + 0.5);

                    // Если расстояние меньше порога, значит есть коллизия
                    if (distanceSquared < thresholdSquared) {
                        // Запоминаем информацию о ближайшей коллизии
                        if (distanceSquared < nearestCollision.distance) {
                            nearestCollision = {
                                distance: distanceSquared,
                                dx,
                                dy,
                                tile
                            };
                        }
                    }
                }
            }
        }

        // Если коллизия обнаружена
        if (nearestCollision.tile) {
            const { dx, dy } = nearestCollision;

            // Определяем преобладающую ось коллизии
            const isHorizontalCollision = Math.abs(dx) > Math.abs(dy);

            // Настраиваем флаги блокировки движения
            if (isHorizontalCollision) {
                result.x = true;
            } else {
                result.y = true;
            }

            // Реализация скольжения вдоль стены при диагональном движении
            if (Math.abs(moveX) > 0.01 && Math.abs(moveY) > 0.01) {
                // Если движение диагональное и есть коллизия
                result.slide = { x: 0, y: 0 };

                if (isHorizontalCollision) {
                    // Если коллизия по горизонтали, разрешаем движение по вертикали
                    result.slide.y = moveY;
                } else {
                    // Если коллизия по вертикали, разрешаем движение по горизонтали
                    result.slide.x = moveX;
                }
            }
        }

        // Сохраняем текущую позицию как предыдущую для следующего кадра
        this.lastPosX = playerPosX;
        this.lastPosY = playerPosY;

        return result;
    }
}