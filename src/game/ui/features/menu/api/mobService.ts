import {ActorDTO} from "../../../../core/types.ts";


export class MobAPI {
    private baseUrl: string;

    constructor(baseUrl: string = '/mob') {
        this.baseUrl = baseUrl;
    }

    /**
     * Инициализировать всех мобов
     */
    async initAllMobs(): Promise<ActorDTO[]> {
        const response = await fetch(`${this.baseUrl}/init`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}