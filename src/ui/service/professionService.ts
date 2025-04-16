import axios from 'axios';

export interface Profession {
    id: number;
    name: string;
    description: string;
    icon: string;
    type: string; // e.g., "GATHERING", "CRAFTING"
    // Add other profession properties as needed
}

export interface PlayerProfession {
    id: number;
    playerId: number;
    professionId: number;
    level: number;
    experience: number;
    // Add other player profession properties as needed
}

export interface ProfessionRecipe {
    id: number;
    professionId: number;
    name: string;
    description: string;
    skillRequired: number;
    materials: any[]; // Materials required for the recipe
    result: any; // Result of crafting the recipe
    // Add other recipe properties as needed
}

export interface Crafting {
    id: number;
    playerProfessionId: number;
    recipeId: number;
    quantity: number;
    startTime: string;
    completionTime: string;
    // Add other crafting properties as needed
}

export interface LearnProfessionRequest {
    playerId: number;
    professionId: number;
}

export interface LearnRecipeRequest {
    playerProfessionId: number;
    recipeId: number;
}

export interface StartCraftingRequest {
    playerProfessionId: number;
    recipeId: number;
    quantity: number;
}

export class ProfessionService {
    private baseUrl = '/profession';

    async getAllProfessions(): Promise<Profession[]> {
        const response = await axios.get<Profession[]>(this.baseUrl);
        return response.data;
    }

    async getPlayerProfessions(playerId: number): Promise<PlayerProfession[]> {
        const response = await axios.get<PlayerProfession[]>(`${this.baseUrl}/player/${playerId}`);
        return response.data;
    }

    async learnProfession(request: LearnProfessionRequest): Promise<PlayerProfession> {
        const response = await axios.post<PlayerProfession>(`${this.baseUrl}/learn`, request);
        return response.data;
    }

    async learnRecipe(request: LearnRecipeRequest): Promise<void> {
        await axios.post(`${this.baseUrl}/recipe/learn`, request);
    }

    async getAvailableRecipes(playerProfessionId: number): Promise<ProfessionRecipe[]> {
        const response = await axios.get<ProfessionRecipe[]>(`${this.baseUrl}/${playerProfessionId}/recipes/available`);
        return response.data;
    }

    async getLearnableRecipes(playerProfessionId: number): Promise<ProfessionRecipe[]> {
        const response = await axios.get<ProfessionRecipe[]>(`${this.baseUrl}/${playerProfessionId}/recipes/learnable`);
        return response.data;
    }

    async startCrafting(request: StartCraftingRequest): Promise<Crafting> {
        const response = await axios.post<Crafting>(`${this.baseUrl}/craft/start`, request);
        return response.data;
    }

    async completeCrafting(craftingId: number): Promise<void> {
        await axios.post(`${this.baseUrl}/craft/${craftingId}/complete`);
    }
}

export default new ProfessionService();