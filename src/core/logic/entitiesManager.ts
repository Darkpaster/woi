import {scaledTileSize} from "../../utils/math.ts";
import {Mob} from "./actors/mobs/mob.ts";
import {Item} from "./items/item.ts";
import {Player} from "./actors/player.ts";
import {MapManager} from "./world/mapManager.ts";

export type EntityType = Mob | Item | Player;

export class EntityManager {
    private entities = new Map<string, EntityType>();
    private grid = new Map<string, Set<string>>();

    private getChunkPosKey(x: number, y: number): string { //обычные координаты в чанки
        const col = Math.floor(x / scaledTileSize() / MapManager.chunkSize);
        const row = Math.floor(y / scaledTileSize() / MapManager.chunkSize);
        return `${col},${row}`;
    }

    public addEntity(entity: EntityType) {
        this.entities.set(entity.id, entity);
        const key = this.getChunkPosKey(entity.x, entity.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
        this.grid.get(key)!.add(entity.id);
    }

    public removeEntity(entityId: string) {
        const entity = this.entities.get(entityId);
        if (entity) {
            const key = this.getChunkPosKey(entity.x, entity.y);
            this.grid.get(key)?.delete(entityId);
            this.entities.delete(entityId);
        }
    }

    public updateEntity(entity: EntityType) {
        const oldEntity = this.entities.get(entity.id);
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
        this.entities.set(entity.id, entity);
    }

    updateAllEntities() {
        this.entities.forEach((entity, key) => {
            const newKey = this.getChunkPosKey(entity.x, entity.y);
            if (key !== newKey) {
                this.grid.get(key)?.delete(entity.id);
                if (!this.grid.has(newKey)) {
                    this.grid.set(newKey, new Set());
                }
                this.grid.get(newKey)!.add(entity.id);
            }
            this.entities.set(entity.id, entity);
        })
    }

    // Поиск сущностей по координатам (например, в ячейке или в окрестности)
    public findEntitiesAt(x: number, y: number): EntityType[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.grid.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.entities.get(id)!).filter(Boolean);
    }

    public findMobsAt(x: number, y: number): Mob[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.grid.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.entities.get(id)!).filter((entity) => entity instanceof Mob);
    }

    public findItemsAt(x: number, y: number): Item[] {
        const key = this.getChunkPosKey(x, y);
        const ids = this.grid.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.entities.get(id)!).filter((entity) => entity instanceof Item);
    }
}
