import axios from 'axios';

export enum TalentCategory {
    COMBAT = 'COMBAT',
    UTILITY = 'UTILITY',
    PASSIVE = 'PASSIVE',
    // Add other categories as needed
}

export enum TalentSubCategory {
    MELEE = 'MELEE',
    RANGED = 'RANGED',
    MAGIC = 'MAGIC',
    HEALING = 'HEALING',
    // Add other subcategories as needed
}

export enum TalentSpecialization {
    WARRIOR = 'WARRIOR',
    MAGE = 'MAGE',
    ROGUE = 'ROGUE',
    PRIEST = 'PRIEST',
    // Add other specializations as needed
}

export interface Talent {
    id: number;
    name: string;
    description: string;
    category: TalentCategory;
    subCategory: TalentSubCategory;
    specialization: TalentSpecialization;
    levelRequired: number;
    pointCost: number;
    iconUrl: string;
    prerequisites: number[]; // IDs of prerequisite talents
    // Add other talent properties as needed
}

export class TalentService {
    private baseUrl = '/talent';

    async getAllTalents(): Promise<Talent[]> {
        const response = await axios.get<Talent[]>(this.baseUrl);
        return response.data;
    }

    async getTalentById(id: number): Promise<Talent> {
        const response = await axios.get<Talent>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async getTalentsByCategory(category: TalentCategory): Promise<Talent[]> {
        const response = await axios.get<Talent[]>(`${this.baseUrl}/category/${category}`);
        return response.data;
    }

    async getTalentsBySubCategory(subCategory: TalentSubCategory): Promise<Talent[]> {
        const response = await axios.get<Talent[]>(`${this.baseUrl}/subcategory/${subCategory}`);
        return response.data;
    }

    async getTalentsBySpecialization(specialization: TalentSpecialization): Promise<Talent[]> {
        const response = await axios.get<Talent[]>(`${this.baseUrl}/specialization/${specialization}`);
        return response.data;
    }

    async getAvailableTalents(characterId: number): Promise<Talent[]> {
        const response = await axios.get<Talent[]>(`${this.baseUrl}/character/${characterId}/available`);
        return response.data;
    }

    async learnTalent(characterId: number, talentId: number): Promise<boolean> {
        try {
            await axios.post(`${this.baseUrl}/character/${characterId}/learn/${talentId}`);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default new TalentService();