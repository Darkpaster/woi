// types/achievement.types.ts
export enum AchievementType {
    COMBAT = 'COMBAT',
    EXPLORATION = 'EXPLORATION',
    SOCIAL = 'SOCIAL',
    CRAFTING = 'CRAFTING',
    QUEST = 'QUEST',
    LEVEL = 'LEVEL',
    SKILL = 'SKILL',
    COLLECTION = 'COLLECTION'
}

export interface Achievement {
    id: number;
    accountId: number;
    name: string;
    type: AchievementType;
}

// api/achievement.api.ts
export class AchievementAPI {
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

    // Achievement retrieval
    async getAllAchievements(): Promise<Achievement[]> {
        return this.request('/achievements');
    }

    async getPlayerAchievements(accountId: number): Promise<Achievement[]> {
        return this.request(`/achievements/account/${accountId}`);
    }

    async getAchievementById(achievementId: number): Promise<Achievement> {
        return this.request(`/achievements/${achievementId}`);
    }

    // Achievement management
    async createAchievement(
        accountId: number,
        name: string,
        type: AchievementType
    ): Promise<Achievement> {
        return this.request(`/achievements/account/${accountId}/create`, {
            method: 'POST',
            body: new URLSearchParams({
                name,
                type: type.toString(),
            }),
        });
    }

    async deleteAchievement(achievementId: number): Promise<void> {
        await this.request(`/achievements/${achievementId}`, {
            method: 'DELETE',
        });
    }

    // Achievement checks
    async hasAchievement(accountId: number, achievementName: string): Promise<boolean> {
        return this.request(`/achievements/account/${accountId}/has/${achievementName}`);
    }
}