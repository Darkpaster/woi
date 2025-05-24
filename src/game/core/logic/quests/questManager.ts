import {PlayerContext, PlayerContextData} from "./playerContext";
import {Quest, QuestData, QuestStatus} from "./quest";

export class QuestManager {
    private quests: Map<string, Quest> = new Map();
    private playerContext?: PlayerContext;
    private callbacks: Map<string, Function[]> = new Map();

    // События
    public on(event: string, callback: Function): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event)!.push(callback);
    }

    public off(event: string, callback: Function): void {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    private emit(event: string, ...args: any[]): void {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(...args));
        }
    }

    // Инициализация
    public initialize(playerContextData: PlayerContextData): void {
        this.playerContext = new PlayerContext(playerContextData);
        this.emit('initialized', this.playerContext);
    }

    public updatePlayerContext(data: PlayerContextData): void {
        this.playerContext = new PlayerContext(data);
        this.updateAllQuestStates();
        this.emit('playerContextUpdated', this.playerContext);
    }

    // Управление квестами
    public addQuest(questData: QuestData): void {
        const quest = new Quest(questData);
        this.quests.set(quest.id, quest);
        this.updateQuestState(quest);
        this.emit('questAdded', quest);
    }

    public updateQuest(questData: QuestData): void {
        const existingQuest = this.quests.get(questData.id);
        if (existingQuest) {
            // Обновляем существующий квест
            existingQuest.updateStatus(questData.status);
            if (questData.currentNodeId) {
                existingQuest.updateCurrentNode(questData.currentNodeId);
            }
            if (questData.progress !== undefined) {
                existingQuest.updateProgress(questData.progress);
            }

            this.updateQuestState(existingQuest);
            this.emit('questUpdated', existingQuest);
        } else {
            this.addQuest(questData);
        }
    }

    public getQuest(questId: string): Quest | undefined {
        return this.quests.get(questId);
    }

    public getAllQuests(): Quest[] {
        return Array.from(this.quests.values());
    }

    public getQuestsByStatus(status: QuestStatus): Quest[] {
        return this.getAllQuests().filter(quest => quest.status === status);
    }

    public getActiveQuests(): Quest[] {
        return this.getQuestsByStatus(QuestStatus.IN_PROGRESS);
    }

    public getCompletedQuests(): Quest[] {
        return this.getQuestsByStatus(QuestStatus.COMPLETED);
    }

    public getAvailableQuests(): Quest[] {
        if (!this.playerContext) return [];

        return this.getAllQuests().filter(quest =>
            quest.status === QuestStatus.NOT_STARTED && quest.canStart(this.playerContext!)
        );
    }

    // Обновление состояний
    private updateQuestState(quest: Quest): void {
        if (!this.playerContext) return;

        // Обновляем доступность решений во всех узлах
        for (const node of quest.nodes.values()) {
            node.updateDecisionAvailability(this.playerContext);
        }
    }

    private updateAllQuestStates(): void {
        for (const quest of this.quests.values()) {
            this.updateQuestState(quest);
        }
    }

    // Получение контекста игрока
    public getPlayerContext(): PlayerContext | undefined {
        return this.playerContext;
    }

    // Статистика
    public getQuestStats(): {
        total: number;
        completed: number;
        inProgress: number;
        available: number;
        failed: number;
    } {
        const quests = this.getAllQuests();
        return {
            total: quests.length,
            completed: quests.filter(q => q.isCompleted()).length,
            inProgress: quests.filter(q => q.isActive()).length,
            available: this.getAvailableQuests().length,
            failed: quests.filter(q => q.isFailed()).length
        };
    }

    // Поиск
    public searchQuests(query: string): Quest[] {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllQuests().filter(quest =>
            quest.title.toLowerCase().includes(lowercaseQuery) ||
            quest.description.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Очистка
    public clear(): void {
        this.quests.clear();
        this.playerContext = undefined;
        this.callbacks.clear();
        this.emit('cleared');
    }
}