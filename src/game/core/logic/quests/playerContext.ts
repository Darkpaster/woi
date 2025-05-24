
export interface PlayerContextData {
    playerId: string;
    stats: Record<string, number>;
    completedQuests: string[];
    inventory: Record<string, number>;
    currentQuests: string[];
}


export class PlayerContext {
    private _playerId: string;
    private _stats: Map<string, number> = new Map();
    private _completedQuests: Set<string> = new Set();
    private _inventory: Map<string, number> = new Map();
    private _currentQuests: Set<string> = new Set();

    constructor(data: PlayerContextData) {
        this._playerId = data.playerId;

        // Загружаем данные
        Object.entries(data.stats).forEach(([key, value]) => {
            this._stats.set(key, value);
        });

        data.completedQuests.forEach(questId => {
            this._completedQuests.add(questId);
        });

        Object.entries(data.inventory).forEach(([key, value]) => {
            this._inventory.set(key, value);
        });

        data.currentQuests.forEach(questId => {
            this._currentQuests.add(questId);
        });
    }

    get playerId(): string {
        return this._playerId;
    }

    // Статистика
    public getStat(statName: string): number {
        return this._stats.get(statName) || 0;
    }

    public updateStat(statName: string, value: number): void {
        this._stats.set(statName, value);
    }

    public getAllStats(): Record<string, number> {
        return Object.fromEntries(this._stats);
    }

    // Квесты
    public hasCompletedQuest(questId: string): boolean {
        return this._completedQuests.has(questId);
    }

    public completeQuest(questId: string): void {
        this._completedQuests.add(questId);
        this._currentQuests.delete(questId);
    }

    public startQuest(questId: string): void {
        this._currentQuests.add(questId);
    }

    public isQuestInProgress(questId: string): boolean {
        return this._currentQuests.has(questId);
    }

    public getCompletedQuests(): string[] {
        return Array.from(this._completedQuests);
    }

    public getCurrentQuests(): string[] {
        return Array.from(this._currentQuests);
    }

    // Инвентарь
    public hasItem(itemId: string, amount: number = 1): boolean {
        return (this._inventory.get(itemId) || 0) >= amount;
    }

    public getItemCount(itemId: string): number {
        return this._inventory.get(itemId) || 0;
    }

    public updateItem(itemId: string, amount: number): void {
        if (amount <= 0) {
            this._inventory.delete(itemId);
        } else {
            this._inventory.set(itemId, amount);
        }
    }

    public getAllItems(): Record<string, number> {
        return Object.fromEntries(this._inventory);
    }

    // Сериализация
    public toJSON(): PlayerContextData {
        return {
            playerId: this._playerId,
            stats: this.getAllStats(),
            completedQuests: this.getCompletedQuests(),
            inventory: this.getAllItems(),
            currentQuests: this.getCurrentQuests()
        };
    }
}
