
// ============ ОБЩИЕ ТИПЫ ============

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ============ МОДЕЛИ ============

export interface Group {
    id: number;
    groupLeaderId: number;
    groupType: string;
    maxMembers: number;
    creationTime: string; // ISO string
}

export interface GroupMember {
    id: number;
    groupId: number;
    characterId: number;
    joinTime: string; // ISO string
}

// ============ REQUEST/RESPONSE ТИПЫ ============

export interface GroupCreateRequest {
    targetId: number;
    leaderId: number;
    groupType: string;
}


export class GroupAPI {
    private baseUrl: string;

    constructor(baseUrl: string = '/group') {
        this.baseUrl = baseUrl;
    }

    /**
     * Создать новую группу
     */
    async createGroup(request: GroupCreateRequest): Promise<ApiResponse<Group>> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Получить группу по ID
     */
    async getGroup(id: number): Promise<ApiResponse<Group>> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Получить участников группы
     */
    async getGroupMembers(id: number): Promise<ApiResponse<GroupMember[]>> {
        const response = await fetch(`${this.baseUrl}/${id}/members`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Распустить группу
     */
    async disbandGroup(id: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Добавить участника в группу
     */
    async addMember(groupId: number, playerId: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${this.baseUrl}/${groupId}/members/${playerId}`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Удалить участника из группы
     */
    async removeMember(groupId: number, playerId: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${this.baseUrl}/${groupId}/members/${playerId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Передать лидерство в группе
     */
    async transferLeadership(groupId: number, playerId: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${this.baseUrl}/${groupId}/leader/${playerId}`, {
            method: 'PUT',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Получить группы игрока
     */
    async getPlayerGroups(): Promise<ApiResponse<Group[]>> {
        const response = await fetch(`${this.baseUrl}/player`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Получить группы, которые ищут новых участников
     */
    async getGroupsLookingForMore(groupType?: string): Promise<ApiResponse<Group[]>> {
        const url = new URL(`${window.location.origin}${this.baseUrl}/looking-for-more`);

        if (groupType) {
            url.searchParams.append('groupType', groupType);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Установить статус поиска новых участников
     */
    async setLookingForMore(groupId: number, isLookingForMore: boolean): Promise<ApiResponse<void>> {
        const url = new URL(`${window.location.origin}${this.baseUrl}/${groupId}/looking-for-more`);
        url.searchParams.append('isLookingForMore', isLookingForMore.toString());

        const response = await fetch(url.toString(), {
            method: 'PUT',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}