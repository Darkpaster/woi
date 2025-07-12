// types/profession.types.ts
export interface Profession {
    id: number;
    characterId: number;
    name: string;
    level: number;
    experience: number;
}

// api/profession.api.ts
export class ProfessionAPI {
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

    // Profession retrieval
    async getCharacterProfessions(characterId: number): Promise<Profession[]> {
        return this.request(`/professions/character/${characterId}`);
    }

    async getProfessionById(professionId: number): Promise<Profession> {
        return this.request(`/professions/profession/${professionId}`);
    }

    async getProfessionLevel(characterId: number, professionName: string): Promise<number> {
        return this.request(`/professions/character/${characterId}/profession/${professionName}/level`);
    }

    // Profession management
    async learnProfession(characterId: number, professionName: string): Promise<Profession> {
        return this.request(`/professions/character/${characterId}/learn?professionName=${professionName}`, {
            method: 'POST',
        });
    }

    async addExperience(professionId: number, experience: number): Promise<void> {
        await this.request(`/professions/profession/${professionId}/experience?experience=${experience}`, {
            method: 'POST',
        });
    }

    async deleteProfession(professionId: number): Promise<void> {
        await this.request(`/professions/profession/${professionId}`, {
            method: 'DELETE',
        });
    }
}