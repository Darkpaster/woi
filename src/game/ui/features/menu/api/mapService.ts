import axios from "axios";
import {Tiles} from "../../../../core/graphics/tilesGenerator.ts";

export type MapType = {
    backgroundChunks: {
        [key: string]: number[][]
    },
    foregroundChunks: {
        [key: string]: number[][]
    },
    animatedChunks: {
        [key: string]: number[][]
    }
}


export class MapService {
    private baseUrl = '/map';

    async getTiles(): Promise<Tiles> {
        const response = await axios.get<Tiles>(`${this.baseUrl}/tiles`);
        return response.data;
    }

    async getMap(): Promise<MapType> {
        const response = await axios.get<MapType>(`${this.baseUrl}`);
        return response.data;
    }
}

export default new MapService();