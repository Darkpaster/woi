export type EntityType = 'mob' | 'player' | 'item';

export interface Entity {
    id: string;
    type: EntityType;
    x: number;
    y: number;
    // другие свойства...
}

// Простая реализация решетки для индексирования
export class EntityManager {
    private entities = new Map<string, Entity>();
    private grid = new Map<string, Set<string>>();
    private gridSize: number;

    constructor(gridSize: number = 100) {
        this.gridSize = gridSize;
    }

    private getGridKey(x: number, y: number): string {
        const col = Math.floor(x / this.gridSize);
        const row = Math.floor(y / this.gridSize);
        return `${col}_${row}`;
    }

    addEntity(entity: Entity) {
        this.entities.set(entity.id, entity);
        const key = this.getGridKey(entity.x, entity.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
        this.grid.get(key)!.add(entity.id);
    }

    removeEntity(entityId: string) {
        const entity = this.entities.get(entityId);
        if (entity) {
            const key = this.getGridKey(entity.x, entity.y);
            this.grid.get(key)?.delete(entityId);
            this.entities.delete(entityId);
        }
    }

    updateEntity(entity: Entity) {
        // Обновляем позицию, если изменилась
        const oldEntity = this.entities.get(entity.id);
        if (oldEntity) {
            const oldKey = this.getGridKey(oldEntity.x, oldEntity.y);
            const newKey = this.getGridKey(entity.x, entity.y);
            if (oldKey !== newKey) {
                this.grid.get(oldKey)?.delete(entity.id);
                if (!this.grid.has(newKey)) {
                    this.grid.set(newKey, new Set());
                }
                this.grid.get(newKey)!.add(entity.id);
            }
            this.entities.set(entity.id, entity);
        }
    }

    // Поиск сущностей по координатам (например, в ячейке или в окрестности)
    findEntitiesAt(x: number, y: number): Entity[] {
        const key = this.getGridKey(x, y);
        const ids = this.grid.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.entities.get(id)!).filter(Boolean);
    }
}

export const entityManager = new EntityManager(100);
