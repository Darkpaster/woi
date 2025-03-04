import {promises as fs} from "fs";
import {scaledTileSize} from "../../../utils/math.ts";
import {player, worldMap} from "../../main.ts";
import {alertf, logf} from "../../../utils/debug.ts";

interface ChunkData {
    data: number[];   // одномерный массив тайлов
    width: number;    // ширина чанка в тайлах
    height: number;   // высота чанка в тайлах
    startX: number;
    startY: number;
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

    // private foregroundOffset = { x: 0, y: 0};
    // private animatedOffset = { x: 256, y: 144};

    public getWorldMap() {
        return { backgroundChunks: this.backgroundChunks, foregroundChunks: this.foregroundChunks, animatedChunks: this.animatedChunks };
    }

    public async initWorld() {
        try {
            // const reader = new FileReader();

            const data: Response = await fetch("http://localhost:5173/public/world.json");
            // const data: string = reader.readAsText("fds", "utf-8");

            // alertf(data.status, data.headers);

            data.json().then((json) => {
                // alertf(json);
                // const parsedData: { layers: Layer[] } = JSON.parse(json);
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

    private getGridKey(x: number, y: number): string {
        const col = Math.floor(x - (x % 32));
        const row = Math.floor(y - (y % 32));
        return `${col},${row}`; // координаты чанков в тайлах, а координаты игрока были в чанках
    }

    public getIndexingChunks(): IndexingChunks { //важно потом хорошо оптимизировать!
        const tilesY: number = Math.round(window.innerHeight / scaledTileSize() / 2) + 2;
        const tilesX: number = Math.round(window.innerWidth / scaledTileSize() / 2) + 2;

        const beforeY: number = player!.posY - tilesY + 2;
        const afterY: number = player!.posY + tilesY;

        const beforeX: number = player!.posX - tilesX + 2;
        const afterX: number = player!.posX + tilesX;

        const { backgroundChunks, foregroundChunks, animatedChunks } = worldMap.getWorldMap();

        const uniqueChunks: string[] = []

        uniqueChunks.push(this.getGridKey(beforeX, beforeY));
        const leftBottomCorner = this.getGridKey(beforeX, afterY);
        const rightTopCorner = this.getGridKey(afterX, beforeY);
        const rightBottomCorner = this.getGridKey(afterX, afterY);
        if (!uniqueChunks.includes(leftBottomCorner)) {
            uniqueChunks.push(leftBottomCorner);
        }
        if (!uniqueChunks.includes(rightTopCorner)) {
            uniqueChunks.push(rightTopCorner);
        }
        if (!uniqueChunks.includes(rightBottomCorner)) {
            uniqueChunks.push(rightBottomCorner);
        }

        const indexingChunks: IndexingChunks = { backgroundChunks: [], foregroundChunks: [], animatedChunks: [] };

        for (let i = 0; i < uniqueChunks.length; i++) {
            const key = uniqueChunks[i];
            if (backgroundChunks.has(key)) {
                indexingChunks.backgroundChunks.push( { startX: Number(key.substring(0, key.indexOf(","))),
                    startY: Number(key.substring(key.indexOf(",")+1)), chunk: backgroundChunks.get(key)! } );
            }
            if (foregroundChunks.has(key)) {
                indexingChunks.foregroundChunks.push( { startX: Number(key.substring(0, key.indexOf(","))),
                    startY: Number(key.substring(key.indexOf(",")+1)), chunk: foregroundChunks.get(key)! } );
            }
            if (animatedChunks.has(key)) {
                indexingChunks.animatedChunks.push( { startX: Number(key.substring(0, key.indexOf(","))),
                    startY: Number(key.substring(key.indexOf(",")+1)), chunk: animatedChunks.get(key)! } );
            }
        }

        return indexingChunks;
    }

    // Функция для преобразования одномерного массива в матрицу
    private convertToMatrix(chunk: ChunkData): number[][] {
        const matrix: number[][] = [];
        for (let y = 0; y < chunk.height; y++) {
            matrix.push(chunk.data.slice(y * chunk.width, (y + 1) * chunk.width));
        }
        return matrix;
    }

    private parseLayers(layers: { layers: Layer[] }): ParsedChunks {
        for (const layer of layers.layers) {
            // Вычисляем, сколько чанков в ряду. Предполагается, что все чанки одного слоя имеют одинаковый размер.
            if (layer.chunks.length === 0) continue; // если нет чанков, переходим к следующему слою
            const chunkWidth = layer.chunks[0].width;
            const chunksPerRow = Math.floor(layer.width / chunkWidth);

            const layerName = layer.name.toLowerCase()
            // Обходим все чанки слоя
            layer.chunks.forEach((chunk, index) => {
                const col = index % chunksPerRow;
                const row = Math.floor(index / chunksPerRow);
                const key = `${col * chunkWidth},${row * chunk.height}`;
                const matrix = this.convertToMatrix(chunk);

                // Если имя слоя содержит "background", сохраняем в backgroundChunks, иначе — в foregroundChunks.
                if (layerName.includes("background")) {
                    this.backgroundChunks.set(key, matrix);
                } else if (layerName.includes("foreground")) {
                    this.foregroundChunks.set(key, matrix);
                } else if (layerName.includes("animated")) {
                    this.animatedChunks.set("256,144", matrix); // костыль, only one chunk
                }
            });
        }
        return { backgroundChunks: this.backgroundChunks, foregroundChunks: this.foregroundChunks, animatedChunks: this.animatedChunks };
    }
}