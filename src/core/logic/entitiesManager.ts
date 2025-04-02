import {scaledTileSize} from "../../utils/math.ts";
import {Mob} from "./actors/mobs/mob.ts";
import {Item} from "./items/item.ts";
import {Player} from "./actors/player.ts";
import {MapManager} from "./world/mapManager.ts";

export class EntityManager {
    get players(): Map<number, Player> {
        return this._players;
    }

    private _players = new Map<number, Player>();
    private mobs = new Map<number, Mob>();
    private items = new Map<number, Item>();
    private grid = new Map<string, Set<number>>();

    private getChunkPosKey(x: number, y: number): string { //обычные координаты в чанки
        const col = Math.floor(x / scaledTileSize() / MapManager.chunkSize);
        const row = Math.floor(y / scaledTileSize() / MapManager.chunkSize);
        return `${col},${row}`;
    }

    public hasPlayer(id: number) {
        return this._players.has(id);
    }

    public getPlayer(id: number) {
        return this._players.get(id);
    }

    public addPlayer(entity: Player) {
        this._players.set(entity.id, entity);
        const key = this.getChunkPosKey(entity.x, entity.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
        this.grid.get(key)!.add(entity.id);
    }

    public removePlayer(entityId: number) {
        const entity = this._players.get(entityId);
        if (entity) {
            const key = this.getChunkPosKey(entity.x, entity.y);
            this.grid.get(key)?.delete(entityId);
            this._players.delete(entityId);
        }
    }

    public updatePlayer(entity: Player) {
        const oldEntity = this._players.get(entity.id);
        if (!oldEntity) {
            return
        }
        const oldKey = this.getChunkPosKey(oldEntity.x, oldEntity.y);
        const newKey = this.getChunkPosKey(entity.x, entity.y);
        if (oldKey !== newKey) {
            this.grid.get(oldKey)?.delete(entity.id);
            if (!this.grid.has(newKey)) {
                this.grid.set(newKey, new Set());
            }
            this.grid.get(newKey)!.add(entity.id);
        }
        this._players.set(entity.id, entity);
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

    // Поиск сущностей по координатам (например, в ячейке или в окрестности)
    public findPlayerAt(x: number, y: number): Player[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.grid.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this._players.get(id)!).filter(Boolean);
    }

    public findMobsAt(x: number, y: number): Mob[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.grid.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.mobs.get(id)!).filter(Boolean);
    }

    public findItemsAt(x: number, y: number): Item[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.grid.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.items.get(id)!).filter(Boolean);
    }
}
