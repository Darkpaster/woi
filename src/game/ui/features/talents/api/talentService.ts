// types/talent.types.ts
export interface Talent {
    id: number;
    name: string;
    description?: string;
    requirements?: TalentRequirement[];
    effects?: TalentEffect[];
}

export interface TalentRequirement {
    type: string;
    value: number;
    description: string;
}

export interface TalentEffect {
    type: string;
    value: number;
    description: string;
}

// api/talent.api.ts
export class TalentAPI {
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

    // Talent retrieval
    async getAllTalents(): Promise<Talent[]> {
        return this.request('/talents');
    }

    async getTalentById(id: number): Promise<Talent> {
        return this.request(`/talents/${id}`);
    }

    async getTalentByName(name: string): Promise<Talent> {
        return this.request(`/talents/name/${name}`);
    }

    // Talent management
    async createTalent(name: string): Promise<Talent> {
        return this.request(`/talents/create?name=${name}`, {
            method: 'POST',
        });
    }

    async deleteTalent(talentId: number): Promise<void> {
        await this.request(`/talents/${talentId}`, {
            method: 'DELETE',
        });
    }

    // Talent checks
    async canLearnTalent(characterId: number, talentId: number): Promise<boolean> {
        return this.request(`/talents/character/${characterId}/can-learn/${talentId}`);
    }
}