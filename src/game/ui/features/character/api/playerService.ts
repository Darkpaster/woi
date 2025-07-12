// types/player.types.ts
export interface InitCharacterConnection {
    characterId: number;
    name: string;
    roomId: string;
    characterType: string;
}

export interface Character {
    id: number;
    accountId: number;
    x: number;
    y: number;
    name: string;
    level: number;
    experience: number;
    gold: number;
    sanity: number;
    reputation: number;
    characterType: 'wanderer' | 'samurai' | 'knight' | 'werewolf' | 'mage';
    creationDate: string;
    lastOnline: string;
}

export interface CharacterStats {
    id: number;
    characterId: number;
    health: number;
    mana: number;
    stamina: number;
    strength: number;
    agility: number;
    intellect: number;
}

// api/player.api.ts
export class PlayerAPI {
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

    // Character management
    async createNewCharacter(init: InitCharacterConnection): Promise<InitCharacterConnection> {
        return this.request('/player/createChar', {
            method: 'POST',
            body: JSON.stringify(init),
        });
    }

    async getCharacters(): Promise<Character[]> {
        return this.request('/player/getCharList');
    }

    async getCharacterData(characterId: number): Promise<any> {
        return this.request(`/player/getCharData?characterId=${characterId}`);
    }

    async updateCharacterStats(characterStats: CharacterStats): Promise<void> {
        await this.request('/player/updateStats', {
            method: 'POST',
            body: JSON.stringify(characterStats),
        });
    }

    async updateCharacter(character: Character): Promise<void> {
        await this.request('/player/updateChar', {
            method: 'POST',
            body: JSON.stringify(character),
        });
    }

    async deleteCharacter(characterId: number): Promise<void> {
        await this.request('/player/deleteChar', {
            method: 'DELETE',
            body: JSON.stringify(characterId),
        });
    }

    // Requirements checks
    async checkLevelRequirement(characterId: number, requiredLevel: number): Promise<boolean> {
        return this.request(`/player/${characterId}/requirements/level?requiredLevel=${requiredLevel}`);
    }

    async checkAttributeRequirement(
        characterId: number,
        attributeName: string,
        requiredValue: number
    ): Promise<boolean> {
        return this.request(
            `/player/${characterId}/requirements/attribute?attributeName=${attributeName}&requiredValue=${requiredValue}`
        );
    }

    async checkSkillRequirement(
        characterId: number,
        skillName: string,
        requiredValue: number
    ): Promise<boolean> {
        return this.request(
            `/player/${characterId}/requirements/skill?skillName=${skillName}&requiredValue=${requiredValue}`
        );
    }

    async checkQuestRequirement(characterId: number, questName: string): Promise<boolean> {
        return this.request(`/player/${characterId}/requirements/quest?questName=${questName}`);
    }

    async checkItemRequirement(
        characterId: number,
        itemId: string,
        quantity: number
    ): Promise<boolean> {
        return this.request(
            `/player/${characterId}/requirements/item?itemId=${itemId}&quantity=${quantity}`
        );
    }

    // Attribute modification
    async modifyAttribute(
        characterId: number,
        attributeName: string,
        value: number
    ): Promise<void> {
        await this.request(`/player/${characterId}/attributes/modify`, {
            method: 'POST',
            body: new URLSearchParams({
                attributeName,
                value: value.toString(),
            }),
        });
    }
}