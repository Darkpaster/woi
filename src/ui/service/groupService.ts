import axios from 'axios';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export enum GroupType {
    PARTY = 'PARTY',
    RAID = 'RAID',
    DUNGEON = 'DUNGEON'
}

export interface Group {
    id: number;
    name: string;
    leader: number;
    members: number[];
    groupType: GroupType;
    isLookingForMore: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GroupCreateRequest {
    name: string;
    groupType: GroupType;
}

export class GroupService {
    private baseUrl = '/group';

    async createGroup(request: GroupCreateRequest): Promise<ApiResponse<Group>> {
        const response = await axios.post<ApiResponse<Group>>(this.baseUrl, request);
        return response.data;
    }

    async getGroup(id: number): Promise<ApiResponse<Group>> {
        const response = await axios.get<ApiResponse<Group>>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async disbandGroup(id: number): Promise<ApiResponse<void>> {
        const response = await axios.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async addMember(groupId: number, playerId: number): Promise<ApiResponse<void>> {
        const response = await axios.post<ApiResponse<void>>(`${this.baseUrl}/${groupId}/members/${playerId}`);
        return response.data;
    }

    async removeMember(groupId: number, playerId: number): Promise<ApiResponse<void>> {
        const response = await axios.delete<ApiResponse<void>>(`${this.baseUrl}/${groupId}/members/${playerId}`);
        return response.data;
    }

    async transferLeadership(groupId: number, newLeaderId: number): Promise<ApiResponse<void>> {
        const response = await axios.put<ApiResponse<void>>(`${this.baseUrl}/${groupId}/leader/${newLeaderId}`);
        return response.data;
    }

    async getPlayerGroups(): Promise<ApiResponse<Group[]>> {
        const response = await axios.get<ApiResponse<Group[]>>(`${this.baseUrl}/player`);
        return response.data;
    }

    async getGroupsLookingForMore(groupType?: GroupType): Promise<ApiResponse<Group[]>> {
        const url = groupType
            ? `${this.baseUrl}/looking-for-more?groupType=${groupType}`
            : `${this.baseUrl}/looking-for-more`;

        const response = await axios.get<ApiResponse<Group[]>>(url);
        return response.data;
    }

    async setLookingForMore(groupId: number, isLookingForMore: boolean): Promise<ApiResponse<void>> {
        const response = await axios.put<ApiResponse<void>>(
            `${this.baseUrl}/${groupId}/looking-for-more?isLookingForMore=${isLookingForMore}`
        );
        return response.data;
    }
}

export default new GroupService();