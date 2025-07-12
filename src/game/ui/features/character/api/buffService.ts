// types/buff.types.ts
export interface Buff {
    id: number;
    characterId: number;
    name: string;
    secondsLeft: number;
}

export interface BuffStatistics {
    totalBuffs: number;
    activeBuffs: number;
    expiredBuffs: number;
    positiveBuffs: number;
    negativeBuffs: number;
    averageDuration: number;
}

// api/buff.api.ts
export class BuffAPI {
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

    // Buff management
    async applyBuff(characterId: number, buff: Buff): Promise<void> {
        await this.request(`/buffs/apply/${characterId}`, {
            method: 'POST',
            body: JSON.stringify(buff),
        });
    }

    async removeBuff(characterId: number, buff: Buff): Promise<void> {
        await this.request(`/buffs/remove/${characterId}`, {
            method: 'DELETE',
            body: JSON.stringify(buff),
        });
    }

    async removeBuffsByType(characterId: number, buffClassName: string): Promise<void> {
        await this.request(`/buffs/remove-by-type/${characterId}?buffClassName=${buffClassName}`, {
            method: 'DELETE',
        });
    }

    async removeAllBuffs(characterId: number): Promise<void> {
        await this.request(`/buffs/remove-all/${characterId}`, {
            method: 'DELETE',
        });
    }

    async removeNegativeBuffs(characterId: number): Promise<void> {
        await this.request(`/buffs/remove-negative/${characterId}`, {
            method: 'DELETE',
        });
    }

    // Buff retrieval and checks
    async getBuffs(characterId: number): Promise<Buff[]> {
        return this.request(`/buffs/${characterId}`);
    }

    async hasBuff(characterId: number, buffClassName: string): Promise<boolean> {
        return this.request(`/buffs/has-buff/${characterId}?buffClassName=${buffClassName}`);
    }

    async getBuffStatistics(characterId: number): Promise<BuffStatistics> {
        return this.request(`/buffs/statistics/${characterId}`);
    }
}