import axios from 'axios';

export interface Character {
    id: number;
    accountId: number;
    name: string;
    class: string;
    race: string;
    level: number;
    experience: number;
    gender: string;
    // Add other character properties as needed
}

export interface CharacterStats {
    id: number;
    characterId: number;
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
    // Add other stat properties as needed
}

export interface InitCharacterConnection {
    character: Character;
    // Add other initialization properties as needed
}

export class PlayerService {
    private baseUrl = '/player';

    async createNewCharacter(init: InitCharacterConnection): Promise<InitCharacterConnection> {
        const response = await axios.post<InitCharacterConnection>(`${this.baseUrl}/createChar`, init);
        return response.data;
    }

    async getCharacters(): Promise<Character[]> {
        const response = await axios.get<Character[]>(`${this.baseUrl}/getCharList`);
        return response.data;
    }

    async updateCharacterStats(characterStats: CharacterStats): Promise<void> {
        await axios.post(`${this.baseUrl}/updateStats`, characterStats);
    }

    async updateCharacter(character: Character): Promise<void> {
        await axios.post(`${this.baseUrl}/updateChar`, character);
    }

    async deleteCharacter(characterId: number): Promise<void> {
        await axios.delete(`${this.baseUrl}/deleteChar`, {
            data: characterId
        });
    }
}

export default new PlayerService();