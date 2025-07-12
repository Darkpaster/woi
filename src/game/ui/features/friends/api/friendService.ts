// types/friend.types.ts
export enum FriendRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export interface FriendRequestDTO {
    senderId: number;
    receiverId: number;
    status: FriendRequestStatus;
}

export interface FriendRequest {
    id: number;
    senderId: number;
    receiverId: number;
    status: FriendRequestStatus;
    createdAt: string;
    updatedAt: string;
}

// api/friend.api.ts
export class FriendAPI {
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

    // Friend request management
    async sendFriendRequest(senderId: number, receiverId: number): Promise<FriendRequestDTO> {
        return this.request(`/api/friends/request?senderId=${senderId}&receiverId=${receiverId}`, {
            method: 'POST',
        });
    }

    async acceptFriendRequest(requestId: number): Promise<FriendRequestDTO> {
        return this.request(`/api/friends/request/${requestId}/accept`, {
            method: 'PUT',
        });
    }

    async rejectFriendRequest(requestId: number): Promise<FriendRequestDTO> {
        return this.request(`/api/friends/request/${requestId}/reject`, {
            method: 'PUT',
        });
    }

    async deleteFriendRequest(requestId: number): Promise<void> {
        await this.request(`/api/friends/request/${requestId}`, {
            method: 'DELETE',
        });
    }

    // Friend request retrieval
    async getFriendRequestsForCharacter(characterId: number): Promise<FriendRequestDTO[]> {
        return this.request(`/api/friends/character/${characterId}/requests`);
    }

    async getPendingFriendRequests(characterId: number): Promise<FriendRequestDTO[]> {
        return this.request(`/api/friends/character/${characterId}/pending`);
    }

    async getAcceptedFriends(characterId: number): Promise<FriendRequestDTO[]> {
        return this.request(`/api/friends/character/${characterId}/friends`);
    }

    async getFriendRequestById(requestId: number): Promise<FriendRequestDTO> {
        return this.request(`/api/friends/request/${requestId}`);
    }
}