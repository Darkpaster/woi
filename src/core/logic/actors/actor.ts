import {FloatText} from "../../graphics/floatText.ts";
import {AnimatedImageManager} from "../../graphics/image.ts";
import {calcDistance, calcDistanceX, calcDistanceY, randomInt, scaledTileSize} from "../../../utils/general/math.ts";
import {TimeDelay} from "../../../utils/general/time.ts";
import {Skill} from "../skills/skill.ts";
import {entityManager, gameRTC, graphics, once, player, worldMap} from "../../main.ts";
import {settings} from "../../config/settings.ts";

import {tileList} from "../../graphics/tilesGenerator.ts";
import Player from "./player.ts";
import {MapManager} from "../world/mapManager.ts";

export interface EntityUIInfo {
    // id: string;
    name: string;
    image?: AnimatedImageManager | null;
    icon?: string | null;
    description: string;
    note?: string;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike";
}

export abstract class Actor implements EntityUIInfo {
    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get fearFactor(): number {
        return this._fearFactor;
    }

    set fearFactor(value: number) {
        this._fearFactor = value;
    }

    // get id(): string {
    // 	return this._id;
    // }
    //
    // set id(value: string) {
    // 	this._id = value;
    // }
    get icon(): string | null | undefined {
        return this._sprite;
    }

    set icon(value: string | null) {
        this._sprite = value;
    }

    get spellBook(): Array<Skill | null> {
        return this._spellBook;
    }

    set spellBook(value: Array<Skill | null>) {
        this._spellBook = value;
    }

    get posY(): number {
        return this._y / scaledTileSize()
    }

    get posX(): number {
        return this._x / scaledTileSize()
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
    }

    public get target(): Actor | undefined | any {
        return this._target;
    }

    public set target(value: Actor | any) {
        this._target = value;
    }

    public get direction(): string {
        return this._direction;
    }

    public set direction(value: string) {
        this._direction = value;
    }

    public get renderState(): string {
        return this._renderState;
    }

    public set renderState(value: string) {
        this._renderState = value;
    }

    public get attackRange(): number {
        return this._attackRange;
    }

    public set attackRange(value: number) {
        this._attackRange = value;
    }

    public get attackDelay(): TimeDelay {
        return this._attackDelay;
    }

    public set attackDelay(value: TimeDelay) {
        this._attackDelay = value;
    }

    public get moveSpeed(): number {
        return this._moveSpeed * settings.defaultTileScale;
    }

    public set moveSpeed(value: number) {
        this._moveSpeed = value;
    }

    public get criticalDamage(): number {
        return this._criticalDamage;
    }

    public set criticalDamage(value: number) {
        this._criticalDamage = value;
    }

    public get criticalChance(): number {
        return this._criticalChance;
    }

    public set criticalChance(value: number) {
        this._criticalChance = value;
    }

    public get evasion(): number {
        return this._evasion;
    }

    public set evasion(value: number) {
        this._evasion = value;
    }

    public get accuracy(): number {
        return this._accuracy;
    }

    public set accuracy(value: number) {
        this._accuracy = value;
    }

    public get magicDefense(): number {
        return this._magicDefense;
    }

    public set magicDefense(value: number) {
        this._magicDefense = value;
    }

    public get defense(): number {
        return this._defense;
    }

    public set defense(value: number) {
        this._defense = value;
    }

    public get MT(): number {
        return this._MT;
    }

    public set MT(value: number) {
        this._MT = value;
    }

    public get MP(): number {
        return this._MP;
    }

    public set MP(value: number) {
        this._MP = value;
    }

    public get minDamage(): number {
        return this._minDamage;
    }

    public set minDamage(value: number) {
        this._minDamage = value;
    }

    public get maxDamage(): number {
        return this._maxDamage;
    }

    public set maxDamage(value: number) {
        this._maxDamage = value;
    }

    public get HR(): number {
        return this._HR;
    }

    public set HR(value: number) {
        this._HR = value;
    }

    public get HT(): number {
        return this._HT;
    }

    public set HT(value: number) {
        this._HT = value;
    }

    public get HP(): number {
        return this._HP;
    }

    public set HP(value: number) {
        this._HP = value;
    }

    public get offsetY(): number {
        return this._offsetY;
    }

    public set offsetY(value: number) {
        this._offsetY = value;
    }

    public get offsetX(): number {
        return this._offsetX;
    }

    public set offsetX(value: number) {
        this._offsetX = value;
    }

    public get image(): AnimatedImageManager | null | undefined {
        return this._image;
    }

    public set image(value: AnimatedImageManager | null) {
        this._image = value;
    }

    public get note(): string | undefined {
        return this._note;
    }

    public set note(value: string) {
        this._note = value;
    }

    public get rarity(): "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" {
        return this._rarity;
    }

    public set rarity(value: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike") {
        this._rarity = value;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    private _name: string = "???";
    // private _id: string = uuidv4();

    private _id: number = 0;

    private _image?: AnimatedImageManager | null;
    private _sprite?: string | null;
    private _description: string = "Unknown creature";
    private _note?: string;
    private _rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" = "common";

    private _x: number = 0;
    private _y: number = 0;
    // private readonly posX: number = Math.floor(this._x / scaledTileSize());
    // private readonly posY: number = Math.floor(this._y / scaledTileSize());
    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _HP: number = 100;
    private _HT: number = 100;
    private _HR: number = 1;
    private _maxDamage: number = 5;
    private _minDamage: number = 2;
    private _MP: number = 0;
    private _MT: number = 0;
    private _defense: number = 0;
    private _magicDefense: number = 0;
    private _accuracy: number = 0;
    private _evasion: number = 0;
    private _criticalChance: number = 0.05;
    private _criticalDamage: number = 2;
    private _moveSpeed: number = 2;
    private _attackDelay: TimeDelay = new TimeDelay(2000, true);
    private _attackRange: number = 1;
    private _renderState: string = "idle";
    private _direction: string = "down";

    private _fearFactor: number = 0;

    private _target?: Actor | any;

    private _spellBook: Array<Skill | null> = [];

    public setCoordinates(x: number, y: number) {
        const result = {x: this.x, y: this.y}
        this.x = x;
        this.y = y;
        result.x -= this.x;
        result.y -= this.y;
        return result
    }

    autoAttack(): void {
        if (this._attackDelay.timeIsUp()) {
            this.target!.dealDamage(randomInt(this._minDamage, this._maxDamage), this);
        }
    }

    public dealDamage(damage: number, source?: Actor | null): void {
        let realDamage: number = damage;
        let crit: boolean = false;

        const isPlayer = this instanceof Player;

        if (source) {
            if (source._criticalChance > Math.random()) {
                realDamage *= source._criticalDamage;
                crit = true;
            }
        }
        realDamage -= this._defense;

        if (realDamage < 0) {
            realDamage = 0;
        } else {
            gameRTC.dealDamage( {value: realDamage, target: {targetId: this.id, targetType: isPlayer ? "player" : "mob"}} );
        }

        this._HP -= realDamage;
        graphics?.floatTextList.push(new FloatText({
            text: realDamage,
            x: this._x,
            y: this._y,
            color: isPlayer ? "red" : "orange",
            crit: crit
        }));

        if (this.HP <= 0 && !isPlayer) {
            entityManager.removeMob(this.id);
            player!.target = null;
        }
    }

    learn<T extends Skill>(spell: T): void {
        this._spellBook.push(spell);
    }

    heal(value: number): void {
        const realValue: number = Math.min(value, this._HT - this._HP);
        this._HP += realValue;
        graphics?.floatTextList.push(new FloatText({text: value, x: this._x, y: this._y, color: "green", crit: false}));
    }

    inRangeOfAttack(): boolean {
        return calcDistance(this.target!, this) < scaledTileSize() * this._attackRange * 1.5;
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

    collision(): { x: boolean, y: boolean } {
        const stop: { x: boolean, y: boolean } = {x: false, y: false};

        // Текущие координаты игрока
        const pos = {x: Math.floor(this.posX), y: Math.floor(this.posY)};

        // Получаем чанк по текущим координатам
        const chunk = worldMap.getChunk(pos.x, pos.y, "foreground");
        if (!chunk || !chunk.chunk) {
            return stop; // Если чанк не существует, коллизии нет
        }

        try {
            const tile = worldMap.getTile(pos.x, pos.y, "foreground");
            if (tile) {
                // console.log(JSON.stringify(tile.props));
                graphics.ctx?.strokeRect(pos.x * scaledTileSize(), pos.y * scaledTileSize(), scaledTileSize(), scaledTileSize());
                graphics.ctx!.drawImage(tile.image.tile, pos.x * scaledTileSize(), pos.y * scaledTileSize(), scaledTileSize(), scaledTileSize());
            }
        } catch (e) {

        }

        // Для отладки
        // console.log(`Player pos: ${pos.x.toFixed(2)},${pos.y.toFixed(2)}, Chunk start: ${chunk.startX},${chunk.startY}`);

        // Радиус коллизии персонажа
        const playerRadius = 0.4;
        const checkRadius = 2;

        // Проверяем тайлы вокруг игрока в глобальных координатах
        const playerTileX = Math.floor(pos.x);
        const playerTileY = Math.floor(pos.y);

        for (let offY = -checkRadius; offY <= checkRadius; offY++) {
            for (let offX = -checkRadius; offX <= checkRadius; offX++) {
                // Вычисляем глобальные координаты тайла напрямую
                const tileGlobalX = playerTileX + offX;
                const tileGlobalY = playerTileY + offY;

                // Определяем, к какому чанку относится этот тайл
                // const tileChunkKey = worldMap.getTilePosKey(tileGlobalX, tileGlobalY);
                const tileChunk = worldMap.getChunk(tileGlobalX, tileGlobalY, "foreground");

                if (!tileChunk || !tileChunk.chunk) {
                    continue; // Если чанка нет, пропускаем
                }

                // Вычисляем локальные координаты внутри чанка
                const localX = ((tileGlobalX - tileChunk.startX) + MapManager.CHUNK_SIZE) % MapManager.CHUNK_SIZE;
                const localY = ((tileGlobalY - tileChunk.startY) + MapManager.CHUNK_SIZE) % MapManager.CHUNK_SIZE;

                // Проверяем границы массива
                if (localY >= 0 && localY < tileChunk.chunk.length &&
                    localX >= 0 && localX < tileChunk.chunk[0].length) {

                    const tileId = tileChunk.chunk[localY][localX];
                    const tile = tileList[tileId];

                    if (tile && !tile.props.isWalkable) {
                        // Расстояние между игроком и тайлом
                        const dx = pos.x - (tileGlobalX + 0.5);
                        const dy = pos.y - (tileGlobalY + 0.5);
                        const distanceSquared = dx * dx + dy * dy;

                        // Квадрат порога коллизии
                        const thresholdSquared = (playerRadius + 0.5) * (playerRadius + 0.5);

                        // Для отладки
                        // console.log(`Checking tile at ${tileGlobalX},${tileGlobalY} (${localX},${localY} in chunk ${tileChunk.startX},${tileChunk.startY}), ID: ${tileId}, dist: ${Math.sqrt(distanceSquared).toFixed(2)}, threshold: ${Math.sqrt(thresholdSquared).toFixed(2)}`);

                        if (distanceSquared < thresholdSquared) {
                            // Определяем ось коллизии на основе направления движения и положения
                            if (Math.abs(dx) > Math.abs(dy)) {
                                stop.x = true;
                            } else {
                                stop.y = true;
                            }

                            // Для отладки
                            // console.log(`Collision at ${tileGlobalX},${tileGlobalY} (tile ${tileId}), distance: ${Math.sqrt(distanceSquared).toFixed(2)}`);
                            // if (player) {
                            //     player.name = `Collision: ${tileId} at ${tileGlobalX},${tileGlobalY}`;
                            // }
                        }
                    }
                }
            }
        }

        return stop;
    }

// Вспомогательный метод для вычисления координаты внутри чанка
    private getPosInChunk(globalPos: number, chunkStart: number, chunkSize: number): number {
        return Math.floor(globalPos - chunkStart);
    }

// Вспомогательный метод для вычисления расстояния между двумя точками
    private calcDistance(point1: { x: number, y: number }, point2: { x: number, y: number }): number {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }


}