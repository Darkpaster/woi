import {scaledTileSize} from "../../utils/math.ts";
import Mob from "./actors/mobs/mob.ts";
import Item from "./items/item.ts";
import Player from "./actors/player.ts";
import {MapManager} from "./world/mapManager.ts";

export class EntityManager {
    get items(): Map<number, Item> {
        return this._items;
    }
    get mobs(): Map<number, Mob> {
        return this._mobs;
    }
    get players(): Map<number, Player> {
        return this._players;
    }

    private _players = new Map<number, Player>();
    private _mobs = new Map<number, Mob>();
    private _items = new Map<number, Item>();
    private playerStorage = new Map<string, Set<number>>();
    private mobStorage = new Map<string, Set<number>>();
    private itemStorage = new Map<string, Set<number>>();

    private getChunkPosKey(x: number, y: number): string { //обычные координаты в чанки
        const col = Math.floor(x / scaledTileSize() / MapManager.CHUNK_SIZE);
        const row = Math.floor(y / scaledTileSize() / MapManager.CHUNK_SIZE);
        return `${col},${row}`;
    }

    public hasPlayer(id: number) {
        return this._players.has(id);
    }

    public getPlayer(id: number) {
        return this._players.get(id);
    }

    public getMob(id: number) {
        return this.mobs.get(id);
    }

    public addPlayer<P extends Player>(player: P) {
        this.players.set(player.id, player);
        const key = this.getChunkPosKey(player.x, player.y);
        if (!this.playerStorage.has(key)) {
            this.playerStorage.set(key, new Set());
        }
        this.playerStorage.get(key)!.add(player.id);
    }

    public removePlayer(playerId: number) {
        const player = this._players.get(playerId);
        if (player) {
            const key = this.getChunkPosKey(player.x, player.y);
            this.playerStorage.get(key)?.delete(playerId);
            this._players.delete(playerId);
        }
    }

    public addItem<I extends Item>(item: I) {
        this._items.set(item.id, item);
        const key = this.getChunkPosKey(item.x, item.y);
        if (!this.itemStorage.has(key)) {
            this.itemStorage.set(key, new Set());
        }
        this.itemStorage.get(key)!.add(item.id);
    }

    public removeItem(itemId: number) {
        const item = this._items.get(itemId);
        if (item) {
            const key = this.getChunkPosKey(item.x, item.y);
            this.itemStorage.get(key)?.delete(itemId);
            this._items.delete(itemId);
        }
    }

    public addMob<M extends Mob>(mob: M) {
        this._mobs.set(mob.id, mob);
        const key = this.getChunkPosKey(mob.x, mob.y);
        if (!this.mobStorage.has(key)) {
            this.mobStorage.set(key, new Set());
        }
        this.mobStorage.get(key)!.add(mob.id);
    }

    public removeMob(mobId: number) {
        const mob = this.mobs.get(mobId);
        if (mob) {
            const key = this.getChunkPosKey(mob.x, mob.y);
            this.mobStorage.get(key)?.delete(mobId);
            this.mobs.delete(mobId);
        }
    }

    public updatePlayer<P extends Player>(player: P) {
        const oldEntity = this._players.get(player.id);
        if (!oldEntity) {
            return
        }
        const oldKey = this.getChunkPosKey(oldEntity.x, oldEntity.y);
        const newKey = this.getChunkPosKey(player.x, player.y);
        if (oldKey !== newKey) {
            this.playerStorage.get(oldKey)?.delete(player.id);
            if (!this.playerStorage.has(newKey)) {
                this.playerStorage.set(newKey, new Set());
            }
            this.playerStorage.get(newKey)!.add(player.id);
        }
        this._players.set(player.id, player);
    }

    public updateMob<M extends Mob>(mob: M) {
        const oldEntity = this.mobs.get(mob.id);
        if (!oldEntity) {
            return
        }
        const oldKey = this.getChunkPosKey(oldEntity.x, oldEntity.y);
        const newKey = this.getChunkPosKey(mob.x, mob.y);
        if (oldKey !== newKey) {
            this.mobStorage.get(oldKey)?.delete(mob.id);
            if (!this.mobStorage.has(newKey)) {
                this.mobStorage.set(newKey, new Set());
            }
            this.mobStorage.get(newKey)!.add(mob.id);
        }
        this.mobs.set(mob.id, mob);
    }

    // updateAllEntities() {
    //     this.entities.forEach((entity, key) => {
    //         const newKey = this.getChunkPosKey(entity.x, entity.y);
    //         if (key !== newKey) {
    //             this.grid.get(key)?.delete(entity.id);
    //             if (!this.grid.has(newKey)) {
    //                 this.grid.set(newKey, new Set());
    //             }
    //             this.grid.get(newKey)!.add(entity.id);
    //         }
    //         this.entities.set(entity.id, entity);
    //     })
    // }

    private getNearestKeys(x: number, y: number): string[] {
        const unit = Math.round(window.innerHeight / 2);
        const result: string[] = [];
        const angles = [[x - unit, y - unit], [x - unit, y + unit], [x + unit, y - unit], [x + unit, y + unit]];
        for (const coor of angles) {
            const key = this.getChunkPosKey(coor[0], coor[1]);
            if (!result.includes(key)) {
                result.push(key);
            }
        }
        return result;
    }

    public findPlayerAt(x: number, y: number): Player[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.playerStorage.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this._players.get(id)!).filter(Boolean);
    }

    public findMobsAt(x: number, y: number): Mob[] {
        const keys = this.getNearestKeys(x, y);
        const result: Mob[] = [];
        for (const key of keys) {
            const ids = this.mobStorage.get(key);
            if (!ids){
             continue
            }
            result.push(...Array.from(ids).map(id => this._mobs.get(id)!).filter(Boolean));
        }
        return result
    }

    public findItemsAt(x: number, y: number): Item[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.itemStorage.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this._items.get(id)!).filter(Boolean);
    }
}
