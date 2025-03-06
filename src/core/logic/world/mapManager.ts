import {once, player} from "../../main.ts";
import {generateTiles} from "../../graphics/tilesGenerator.ts";
import {memoizeCalculation} from "../../../utils/general.ts";
import {settings} from "../../config/settings.ts";

interface ChunkData {
    data: number[];   // одномерный массив тайлов
    width: number;    // ширина чанка в тайлах
    height: number;   // высота чанка в тайлах
    x: number;
    y: number;
}

interface Layer {
    name: string;
    startX: number;
    startY: number; //-256 -160, 0, -16
    width: number;    // общая ширина слоя (в тайлах)
    height: number;   // общая высота слоя (в тайлах)
    chunks: ChunkData[];
}

interface ParsedChunks {
    backgroundChunks: Map<string, number[][]>;
    foregroundChunks: Map<string, number[][]>;
    animatedChunks: Map<string, number[][]>;
}

type Chunk = {
    startX: number, startY: number, chunk: number[][]
}

type IndexingChunks = {
    backgroundChunks: Chunk[]
    foregroundChunks: Chunk[]
    animatedChunks: Chunk[]
}


export class MapManager {
    private backgroundChunks: Map<string, number[][]> = new Map();
    private foregroundChunks: Map<string, number[][]> = new Map();
    private animatedChunks: Map<string, number[][]> = new Map();

    private updateCalculation = memoizeCalculation(([tileSize]) => {
        const tilesY: number = Math.round(window.innerHeight / (tileSize * settings.tileSize) / 2);
        const tilesX: number = Math.round(window.innerWidth / (tileSize * settings.tileSize) / 2);
        return [tilesX, tilesY]
    })

    public static readonly chunkSize: 32 = 32;

    public getWorldMap() {
        return { backgroundChunks: this.backgroundChunks, foregroundChunks: this.foregroundChunks, animatedChunks: this.animatedChunks };
    }

    public async initWorld() {
        try {
            const data: Response = await fetch("http://localhost:5173/public/world.json");

            data.json().then((json) => {
                generateTiles(json);

                const parsedData: { layers: Layer[] } = json

                const parsedChunks: ParsedChunks = this.parseLayers(parsedData);
                this.backgroundChunks = parsedChunks.backgroundChunks;
                this.foregroundChunks = parsedChunks.foregroundChunks;
                this.animatedChunks = parsedChunks.animatedChunks;
            })

        } catch (err) {
            console.error("Error while parsing map:", err);
        }
    }


    private getTilePosKey(xPos: number, yPos: number): string { //тайлы в тайлы без остатка
        const col = xPos - (xPos % MapManager.chunkSize);
        const row = yPos - (yPos % MapManager.chunkSize);
        return `${col},${row}`;
    }

    public getIndexingChunks(): IndexingChunks {
        const [tilesX, tilesY] = this.updateCalculation(settings.defaultTileScale); // оптимизация

        const beforeY: number = player!.posY - tilesY - 30;
        const afterY: number = player!.posY + tilesY;

        const beforeX: number = player!.posX - tilesX - 30;
        const afterX: number = player!.posX + tilesX;

        const { backgroundChunks, foregroundChunks, animatedChunks } = this.getWorldMap();

        const uniqueChunks: string[] = []

        for (let i: number = beforeY; i < afterY; i++) {
            for (let j: number = beforeX; j < afterX; j++) {
                const coors = this.getTilePosKey(j, i);
                if (!uniqueChunks.includes(coors)) {
                    uniqueChunks.push(coors);
                }
            }
        }

        const indexingChunks: IndexingChunks = { backgroundChunks: [], foregroundChunks: [], animatedChunks: [] };

        for (let i = 0; i < uniqueChunks.length; i++) {
            const key = uniqueChunks[i];
            if (backgroundChunks.has(key)) {
                indexingChunks.backgroundChunks.push( { ...this.keyToCoors(key), chunk: backgroundChunks.get(key)! } );
            }
            if (foregroundChunks.has(key)) {
                indexingChunks.foregroundChunks.push( { ...this.keyToCoors(key), chunk: foregroundChunks.get(key)! } );
            }
            if (animatedChunks.has(key)) {
                indexingChunks.animatedChunks.push( { ...this.keyToCoors(key), chunk: animatedChunks.get(key)! } );
            }
        }

        return indexingChunks;
    }

    private keyToCoors(key: string) {
        return { startX: Number(key.substring(0, key.indexOf(","))),
            startY: Number(key.substring(key.indexOf(",")+1)) }
    }

    public getChunk(posX: number, posY: number): Chunk {
        return { startX: posX, startY: posY, chunk: this.getWorldMap().backgroundChunks.get(`${posX},${posY}`)! }
    }

    private convertToMatrix(chunk: ChunkData): number[][] {
        const matrix: number[][] = [];
        for (let y = 0; y < MapManager.chunkSize; y++) {
            matrix.push(chunk.data.slice(y * MapManager.chunkSize, (y + 1) * MapManager.chunkSize));
        }
        return matrix;
    }

    private parseLayers(layers: { layers: Layer[] }): ParsedChunks {
        for (const layer of layers.layers) {
            if (layer.chunks.length === 0) continue; // если нет чанков, переходим к следующему слою
            const layerName = layer.name.toLowerCase()
            layer.chunks.forEach((chunk: ChunkData) => {
                let key = this.getTilePosKey(chunk.x, chunk.y);
                const matrix = this.convertToMatrix(chunk);

                if (layerName.includes("background")) {
                    this.backgroundChunks.set(key, matrix);
                } else if (layerName.includes("foreground")) {
                    this.foregroundChunks.set(key, matrix);
                } else if (layerName.includes("animated")) {
                    this.animatedChunks.set(key, matrix);
                }
            });
        }
        return { backgroundChunks: this.backgroundChunks, foregroundChunks: this.foregroundChunks, animatedChunks: this.animatedChunks };
    }
}