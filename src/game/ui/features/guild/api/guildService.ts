import axios from 'axios';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export enum GuildRank {
    LEADER = 'LEADER',
    OFFICER = 'OFFICER',
    MEMBER = 'MEMBER',
    RECRUIT = 'RECRUIT'
}

export interface Player {
    id: number;
    name: string;
    level: number;
    // Add other player properties as needed
}

export interface Guild {
    id: number;
    name: string;
    description: string;
    leader: number;
    guildCrestUrl?: string;
    messageOfTheDay?: string;
    level: number;
    experience: number;
    createdAt: string;
    updatedAt: string;
}

export interface GuildCreateRequest {
    name: string;
    description: string;
}

export interface GuildUpdateRequest {
    description?: string;
    messageOfTheDay?: string;
    guildCrestUrl?: string;
}

export class GuildService {
    private baseUrl = '/guild';

    async createGuild(request: GuildCreateRequest): Promise<ApiResponse<Guild>> {
        const response = await axios.post<ApiResponse<Guild>>(this.baseUrl, request);
        return response.data;
    }

    async searchGuilds(name?: string): Promise<ApiResponse<Guild[]>> {
        const url = name ? `${this.baseUrl}?name=${encodeURIComponent(name)}` : this.baseUrl;
        const response = await axios.get<ApiResponse<Guild[]>>(url);
        return response.data;
    }

    async getGuild(id: number): Promise<ApiResponse<Guild>> {
        const response = await axios.get<ApiResponse<Guild>>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async updateGuild(id: number, request: GuildUpdateRequest): Promise<ApiResponse<Guild>> {
        const response = await axios.put<ApiResponse<Guild>>(`${this.baseUrl}/${id}`, request);
        return response.data;
    }

    async disbandGuild(id: number): Promise<ApiResponse<void>> {
        const response = await axios.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async getGuildMembers(id: number): Promise<ApiResponse<Player[]>> {
        const response = await axios.get<ApiResponse<Player[]>>(`${this.baseUrl}/${id}/members`);
        return response.data;
    }

    async addMember(guildId: number, playerId: number): Promise<ApiResponse<void>> {
        const response = await axios.post<ApiResponse<void>>(`${this.baseUrl}/${guildId}/members/${playerId}`);
        return response.data;
    }

    async removeMember(guildId: number, playerId: number): Promise<ApiResponse<void>> {
        const response = await axios.delete<ApiResponse<void>>(`${this.baseUrl}/${guildId}/members/${playerId}`);
        return response.data;
    }

    async changeRank(guildId: number, playerId: number, rank: GuildRank): Promise<ApiResponse<void>> {
        const response = await axios.put<ApiResponse<void>>(
            `${this.baseUrl}/${guildId}/members/${playerId}/rank?rank=${rank}`
        );
        return response.data;
    }

    async addExperience(guildId: number, amount: number): Promise<ApiResponse<void>> {
        const response = await axios.post<ApiResponse<void>>(
            `${this.baseUrl}/${guildId}/experience?amount=${amount}`
        );
        return response.data;
    }

    async updateGuildBank(
        guildId: number,
        itemId: number,
        quantity: number,
        tabId: number,
        slotId: number
    ): Promise<ApiResponse<void>> {
        const response = await axios.put<ApiResponse<void>>(
            `${this.baseUrl}/${guildId}/bank?itemId=${itemId}&quantity=${quantity}&tabId=${tabId}&slotId=${slotId}`
        );
        return response.data;
    }
}

export default new GuildService();