// types/quest.types.ts
export interface QuestDTO {
    name: string;
    questStage: number;
}

export interface QuestNode {
    id: string;
    description: string;
    decisions: QuestDecision[];
    requirements: QuestRequirement[];
    rewards: Record<string, Reward>;
    type: QuestNodeType;
}

export interface QuestDecision {
    id: string;
    text: string;
    requirements?: QuestRequirement[];
    consequences?: any[];
}

export interface QuestRequirement {
    type: string;
    parameters: Record<string, any>;
}

export interface Reward {
    id: string;
    type: string;
    value: any;
}

export enum QuestNodeType {
    START = 'START',
    DECISION = 'DECISION',
    COMBAT = 'COMBAT',
    REWARD = 'REWARD',
    END = 'END'
}

// api/quest.api.ts
export class QuestAPI {
    private baseUrl: string;

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
    }

    private async request<T>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Quest retrieval
    async getActiveQuests(characterId: number): Promise<QuestDTO[]> {
        return this.request(`/quests/active/${characterId}`);
    }

    async getCompletedQuests(characterId: number): Promise<QuestDTO[]> {
        return this.request(`/quests/completed/${characterId}`);
    }

    async getAvailableQuests(characterId: number): Promise<QuestDTO[]> {
        return this.request(`/quests/available/${characterId}`);
    }

    // Quest management
    async startQuest(characterId: number, questId: string): Promise<QuestDTO> {
        return this.request(`/quests/start/${characterId}/${questId}`, {
            method: 'POST',
        });
    }

    async completeQuest(characterId: number, questId: string): Promise<void> {
        await this.request(`/quests/complete/${characterId}/${questId}`, {
            method: 'POST',
        });
    }

    async cancelQuest(characterId: number, questId: string): Promise<void> {
        await this.request(`/quests/cancel/${characterId}/${questId}`, {
            method: 'DELETE',
        });
    }

    // Quest navigation
    async getCurrentQuestNode(characterId: number, questId: string): Promise<QuestNode> {
        return this.request(`/quests/current-node/${characterId}/${questId}`);
    }

    async getAvailableDecisions(characterId: number, questId: string): Promise<QuestDecision[]> {
        return this.request(`/quests/decisions/${characterId}/${questId}`);
    }

    async makeDecision(
        characterId: number,
        questId: string,
        decisionId: string
    ): Promise<QuestNode> {
        return this.request(`/quests/decision/${characterId}/${questId}/${decisionId}`, {
            method: 'POST',
        });
    }

    // Quest information
    async getCurrentQuestDescription(characterId: number, questId: string): Promise<string> {
        return this.request(`/quests/description/${characterId}/${questId}`);
    }

    async getQuestStage(characterId: number, questId: string): Promise<number> {
        return this.request(`/quests/stage/${characterId}/${questId}`);
    }

    async isQuestCompleted(characterId: number, questId: string): Promise<boolean> {
        return this.request(`/quests/is-completed/${characterId}/${questId}`);
    }
}