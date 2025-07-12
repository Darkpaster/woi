// types/skill.types.ts
export interface Skill {
    id: number;
    characterId: number;
    name: string;
    level: number;
    experience: number;
}

export interface SkillProgressResult {
    skill: Skill;
    levelsGained: number;
    totalExperience: number;
    experienceToNextLevel: number;
    isMaxLevel: boolean;
}

export interface SkillStatistics {
    totalSkills: number;
    averageLevel: number;
    highestLevel: number;
    totalExperience: number;
    maxLevelSkills: number;
}

// api/skill.api.ts
export class SkillAPI {
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

    // Skill retrieval
    async getCharacterSkills(characterId: number): Promise<Skill[]> {
        return this.request(`/skills/character/${characterId}`);
    }

    async getCharacterSkill(characterId: number, skillTitle: string): Promise<Skill> {
        return this.request(`/skills/character/${characterId}/skill/${skillTitle}`);
    }

    async getSkillLevel(characterId: number, skillTitle: string): Promise<number> {
        return this.request(`/skills/character/${characterId}/skill/${skillTitle}/level`);
    }

    async getSkillExperience(characterId: number, skillTitle: string): Promise<number> {
        return this.request(`/skills/character/${characterId}/skill/${skillTitle}/experience`);
    }

    // Skill management
    async createSkill(characterId: number, skillTitle: string): Promise<Skill> {
        return this.request(`/skills/character/${characterId}/skill/${skillTitle}/create`, {
            method: 'POST',
        });
    }

    async addExperience(
        characterId: number,
        skillTitle: string,
        experiencePoints: number
    ): Promise<SkillProgressResult> {
        return this.request(
            `/skills/character/${characterId}/skill/${skillTitle}/experience?experiencePoints=${experiencePoints}`,
            {
                method: 'POST',
            }
        );
    }

    async setSkillLevel(
        characterId: number,
        skillTitle: string,
        level: number
    ): Promise<Skill> {
        return this.request(
            `/skills/character/${characterId}/skill/${skillTitle}/level?level=${level}`,
            {
                method: 'POST',
            }
        );
    }

    async deleteSkill(skillId: number): Promise<void> {
        await this.request(`/skills/skill/${skillId}`, {
            method: 'DELETE',
        });
    }

    async deleteAllCharacterSkills(characterId: number): Promise<number> {
        return this.request(`/skills/character/${characterId}/skills`, {
            method: 'DELETE',
        });
    }

    // Skill requirements
    async checkSkillLevelRequirement(
        characterId: number,
        skillTitle: string,
        requiredLevel: number
    ): Promise<boolean> {
        return this.request(
            `/skills/character/${characterId}/skill/${skillTitle}/requirements/level?requiredLevel=${requiredLevel}`
        );
    }

    async checkSkillExperienceRequirement(
        characterId: number,
        skillTitle: string,
        requiredExperience: number
    ): Promise<boolean> {
        return this.request(
            `/skills/character/${characterId}/skill/${skillTitle}/requirements/experience?requiredExperience=${requiredExperience}`
        );
    }

    // Skill statistics and information
    async getSkillStatistics(characterId: number): Promise<SkillStatistics> {
        return this.request(`/skills/character/${characterId}/statistics`);
    }

    async getTopSkills(characterId: number, limit: number = 5): Promise<Skill[]> {
        return this.request(`/skills/character/${characterId}/top?limit=${limit}`);
    }

    async getExperienceToNextLevel(characterId: number, skillTitle: string): Promise<number> {
        return this.request(`/skills/character/${characterId}/skill/${skillTitle}/next-level`);
    }

    async getProgressToNextLevel(characterId: number, skillTitle: string): Promise<number> {
        return this.request(`/skills/character/${characterId}/skill/${skillTitle}/progress`);
    }

    async getSkillBonus(characterId: number, skillTitle: string): Promise<number> {
        return this.request(`/skills/character/${characterId}/skill/${skillTitle}/bonus`);
    }

    // Ability checks
    async canUseAbility(
        characterId: number,
        requiredSkill: string,
        requiredLevel: number
    ): Promise<boolean> {
        return this.request(
            `/skills/character/${characterId}/ability?requiredSkill=${requiredSkill}&requiredLevel=${requiredLevel}`
        );
    }
}