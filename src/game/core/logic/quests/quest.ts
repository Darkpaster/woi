// Типы для квестовой системы

// Статус квеста
import {QuestNode, QuestNodeData} from "./questNode.ts";
import {Reward, RewardData} from "./reward.ts";
import {QuestRequirement, RequirementType} from "./questRequirement.ts";
import {PlayerContext} from "./playerContext.ts";

export enum QuestStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}



// Интерфейсы для данных с сервера
export interface QuestRequirementData {
    type: RequirementType;
    description: string;
    // Для разных типов требований
    level?: number;
    itemId?: string;
    quantity?: number;
    questId?: string;
    statName?: string;
    statValue?: number;
}

export interface QuestData {
    id: string;
    title: string;
    description: string;
    status: QuestStatus;
    rootNodeId: string;
    nodes: Record<string, QuestNodeData>;
    rewards: Record<string, RewardData>;
    requirements: QuestRequirementData[];
    currentNodeId?: string;
    progress?: number;
    completedAt?: number;
    metadata?: Record<string, any>;
}


export class Quest {
    public readonly id: string;
    public readonly title: string;
    public readonly description: string;
    public readonly rootNodeId: string;
    public readonly nodes: Map<string, QuestNode>;
    public readonly rewards: Map<string, Reward>;
    public readonly requirements: QuestRequirement[];
    public readonly metadata: Record<string, any>;

    private _status: QuestStatus;
    private _currentNodeId?: string;
    private _progress: number;
    private _completedAt?: number;

    constructor(data: QuestData) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.rootNodeId = data.rootNodeId;
        this.nodes = new Map(
            Object.entries(data.nodes).map(([key, node]) => [key, new QuestNode(node)])
        );
        this.rewards = new Map(
            Object.entries(data.rewards).map(([key, reward]) => [key, new Reward(reward)])
        );
        this.requirements = data.requirements.map(req => new QuestRequirement(req));
        this.metadata = data.metadata || {};

        this._status = data.status;
        this._currentNodeId = data.currentNodeId;
        this._progress = data.progress || 0;
        this._completedAt = data.completedAt;
    }

    // Геттеры
    get status(): QuestStatus {
        return this._status;
    }

    get currentNodeId(): string | undefined {
        return this._currentNodeId;
    }

    get progress(): number {
        return this._progress;
    }

    get completedAt(): number | undefined {
        return this._completedAt;
    }

    // Методы состояния
    public isActive(): boolean {
        return this._status === QuestStatus.IN_PROGRESS;
    }

    public isCompleted(): boolean {
        return this._status === QuestStatus.COMPLETED;
    }

    public isFailed(): boolean {
        return this._status === QuestStatus.FAILED;
    }

    public canStart(playerContext: PlayerContext): boolean {
        if (this._status !== QuestStatus.NOT_STARTED) return false;
        return this.requirements.every(req => req.isMet(playerContext));
    }

    // Обновление состояния (вызывается при получении данных с сервера)
    public updateStatus(status: QuestStatus): void {
        this._status = status;
        if (status === QuestStatus.COMPLETED) {
            this._completedAt = Date.now();
        }
    }

    public updateCurrentNode(nodeId: string): void {
        this._currentNodeId = nodeId;
    }

    public updateProgress(progress: number): void {
        this._progress = Math.max(0, Math.min(100, progress));
    }

    // Навигация
    public getCurrentNode(): QuestNode | undefined {
        if (!this._currentNodeId) return undefined;
        return this.nodes.get(this._currentNodeId);
    }

    public getRootNode(): QuestNode | undefined {
        return this.nodes.get(this.rootNodeId);
    }

    public getNode(nodeId: string): QuestNode | undefined {
        return this.nodes.get(nodeId);
    }

    // Поиск решений и путей
    public findPath(fromNodeId: string, toNodeId: string): string[] {
        const visited = new Set<string>();
        const path: string[] = [];

        const dfs = (currentNodeId: string): boolean => {
            if (currentNodeId === toNodeId) {
                path.push(currentNodeId);
                return true;
            }

            if (visited.has(currentNodeId)) return false;
            visited.add(currentNodeId);

            const node = this.nodes.get(currentNodeId);
            if (!node) return false;

            for (const decision of node.decisions) {
                if (dfs(decision.nextNodeId)) {
                    path.unshift(currentNodeId);
                    return true;
                }
            }

            return false;
        };

        dfs(fromNodeId);
        return path;
    }

    // Получение всех наград квеста
    public getAllRewards(): Reward[] {
        const allRewards: Reward[] = [];

        // Награды самого квеста
        allRewards.push(...Array.from(this.rewards.values()));

        // Награды узлов
        for (const node of this.nodes.values()) {
            allRewards.push(...node.getRewardsList());
        }

        return allRewards;
    }

    // Сериализация
    public toJSON(): QuestData {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this._status,
            rootNodeId: this.rootNodeId,
            nodes: Object.fromEntries(
                Array.from(this.nodes.entries()).map(([id, node]) => [
                    id,
                    {
                        id: node.id,
                        description: node.description,
                        type: node.type,
                        decisions: node.decisions.map(d => ({
                            id: d.id,
                            text: d.text,
                            nextNodeId: d.nextNodeId,
                            isAvailable: d.isAvailable,
                            requirements: d.requirements.map(r => ({
                                type: r.type,
                                description: r.description,
                                level: r.level,
                                itemId: r.itemId,
                                quantity: r.quantity,
                                questId: r.questId,
                                statName: r.statName,
                                statValue: r.statValue
                            }))
                        })),
                        requirements: node.requirements.map(r => ({
                            type: r.type,
                            description: r.description,
                            level: r.level,
                            itemId: r.itemId,
                            quantity: r.quantity,
                            questId: r.questId,
                            statName: r.statName,
                            statValue: r.statValue
                        })),
                        rewards: Object.fromEntries(
                            Array.from(node.rewards.entries()).map(([k, r]) => [
                                k,
                                { id: r.id, type: r.type, amount: r.amount, metadata: r.metadata }
                            ])
                        ),
                        isCompleted: node.isCompleted,
                        metadata: node.metadata
                    }
                ])
            ),
            rewards: Object.fromEntries(
                Array.from(this.rewards.entries()).map(([k, r]) => [
                    k,
                    { id: r.id, type: r.type, amount: r.amount, metadata: r.metadata }
                ])
            ),
            requirements: this.requirements.map(r => ({
                type: r.type,
                description: r.description,
                level: r.level,
                itemId: r.itemId,
                quantity: r.quantity,
                questId: r.questId,
                statName: r.statName,
                statValue: r.statValue
            })),
            currentNodeId: this._currentNodeId,
            progress: this._progress,
            completedAt: this._completedAt,
            metadata: this.metadata
        };
    }
}
