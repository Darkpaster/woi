import {scaledTileSize} from "../../utils/math.ts";
import Mob from "./actors/mobs/mob.ts";
import Item from "./items/item.ts";
import Player from "./actors/player.ts";
import {MapManager} from "./world/mapManager.ts";

export class EntityManager {
    get players(): Map<number, Player> {
        return this._players;
    }

    private _players = new Map<number, Player>();
    private mobs = new Map<number, Mob>();
    private items = new Map<number, Item>();
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
        this.items.set(item.id, item);
        const key = this.getChunkPosKey(item.x, item.y);
        if (!this.itemStorage.has(key)) {
            this.itemStorage.set(key, new Set());
        }
        this.itemStorage.get(key)!.add(item.id);
    }

    public removeItem(itemId: number) {
        const item = this.items.get(itemId);
        if (item) {
            const key = this.getChunkPosKey(item.x, item.y);
            this.itemStorage.get(key)?.delete(itemId);
            this.items.delete(itemId);
        }
    }

    public addMob<M extends Mob>(mob: M) {
        this.mobs.set(mob.id, mob);
        const key = this.getChunkPosKey(mob.x, mob.y);
        if (!this.mobStorage.has(key)) {
            this.mobStorage.set(key, new Set());
        }
        this.mobStorage.get(key)!.add(mob.id);
    }

    public removeMob(mobId: number) {
        const mob = this._players.get(mobId);
        if (mob) {
            const key = this.getChunkPosKey(mob.x, mob.y);
            this.playerStorage.get(key)?.delete(mobId);
            this._players.delete(mobId);
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

    public findPlayerAt(x: number, y: number): Player[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.playerStorage.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this._players.get(id)!).filter(Boolean);
    }

    public findMobsAt(x: number, y: number): Mob[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.mobStorage.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.mobs.get(id)!).filter(Boolean);
    }

    public findItemsAt(x: number, y: number): Item[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.itemStorage.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.items.get(id)!).filter(Boolean);
    }
}
