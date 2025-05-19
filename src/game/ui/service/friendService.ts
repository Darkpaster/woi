import axios from "axios";


import axios from 'axios';

export interface UserDto {
    id: number;
    username: string;
    avatarUrl?: string;
    status: string;
    // Add other user properties as needed
}

export interface FriendRequestDto {
    id: number;
    senderId: number;
    senderUsername: string;
    receiverId: number;
    receiverUsername: string;
    status: string;
    createdAt: string;
    // Add other friend request properties as needed
}

export interface FriendRequestCreateDto {
    receiverId: number;
}

export class FriendService {
    private baseUrl = '/friends';

    async getFriendsList(userId: number): Promise<UserDto[]> {
        const response = await axios.get<UserDto[]>(`${this.baseUrl}?userId=${userId}`);
        return response.data;
    }

    async getIncomingRequests(userId: number): Promise<FriendRequestDto[]> {
        const response = await axios.get<FriendRequestDto[]>(`${this.baseUrl}/requests/incoming?userId=${userId}`);
        return response.data;
    }

    async getOutgoingRequests(userId: number): Promise<FriendRequestDto[]> {
        const response = await axios.get<FriendRequestDto[]>(`${this.baseUrl}/requests/outgoing?userId=${userId}`);
        return response.data;
    }

    async sendFriendRequest(senderId: number, receiverId: number): Promise<FriendRequestDto> {
        const request: FriendRequestCreateDto = { receiverId };
        const response = await axios.post<FriendRequestDto>(
            `${this.baseUrl}/requests?senderId=${senderId}`,
            request
        );
        return response.data;
    }

    async acceptFriendRequest(userId: number, requestId: number): Promise<void> {
        await axios.put(`${this.baseUrl}/requests/${requestId}/accept?userId=${userId}`);
    }

    async rejectFriendRequest(userId: number, requestId: number): Promise<void> {
        await axios.put(`${this.baseUrl}/requests/${requestId}/reject?userId=${userId}`);
    }

    async removeFriend(userId: number, friendId: number): Promise<void> {
        await axios.delete(`${this.baseUrl}/${friendId}?userId=${userId}`);
    }

    async searchUsers(query: string): Promise<UserDto[]> {
        const response = await axios.get<UserDto[]>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
        return response.data;
    }
}

export default new FriendService();