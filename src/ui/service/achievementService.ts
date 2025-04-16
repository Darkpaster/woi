import axios from 'axios';

export interface Achievement {
    id: number;
    name: string;
    description: string;
    category: string;
    points: number;
    iconUrl: string;
    // Add other achievement properties as needed
}

export interface PlayerAchievement {
    id: number;
    playerId: number;
    achievementId: number;
    completedDate?: string;
    progress: number;
    completed: boolean;
    // Add other player achievement properties as needed
}

export enum ObjectiveType {
    KILL_MOB = 'KILL_MOB',
    GATHER_ITEM = 'GATHER_ITEM',
    COMPLETE_QUEST = 'COMPLETE_QUEST',
    REACH_LEVEL = 'REACH_LEVEL',
    // Add other objective types as needed
}

export interface ProgressUpdateRequest {
    playerId: number;
    objectiveType: ObjectiveType;
    objectiveId: number;
    increment: number;
}

export class AchievementService {
    private baseUrl = '/achievements';

    async getAllAchievements(): Promise<Achievement[]> {
        const response = await axios.get<Achievement[]>(this.baseUrl);
        return response.data;
    }

    async getPlayerAchievements(playerId: number): Promise<PlayerAchievement[]> {
        const response = await axios.get<PlayerAchievement[]>(`${this.baseUrl}/player/${playerId}`);
        return response.data;
    }

    async updateProgress(request: ProgressUpdateRequest): Promise<void> {
        await axios.post(`${this.baseUrl}/progress`, request);
    }
}

export default new AchievementService();