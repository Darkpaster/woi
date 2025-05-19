import {player} from "../../main.ts";
import {tileList, Tiles} from "../../graphics/tilesGenerator.ts";
import {memoizeCalculation} from "../../../../utils/general/general.ts";
import {settings} from "../../config/settings.ts";
import {MapService, MapType} from "../../../ui/service/mapService.ts";
import {TileImage} from "../../graphics/image.ts";
import {scaledTileSize} from "../../../../utils/math/general.ts";

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

type TileMatrix = {
    matrix: number[][];
    startX: number;
    startY: number;
    width: number;
    height: number;
}


export class MapManager {
    private backgroundChunks: Map<string, number[][]> = new Map();
    private foregroundChunks: Map<string, number[][]> = new Map();
    private animatedChunks: Map<string, number[][]> = new Map();

    private mapService: MapService = new MapService();

    private updateCalculation = memoizeCalculation(([tileSize]) => {
        // Вычисляем количество видимых тайлов по оси Y и X
        const tilesY: number = Math.ceil(window.innerHeight / (tileSize * settings.tileSize) / 2);
        const tilesX: number = Math.ceil(window.innerWidth / (tileSize * settings.tileSize) / 2);
        return [tilesX, tilesY]
    })

    public static readonly CHUNK_SIZE: 32 = 32;

    public getWorldMap() {
        return {
            backgroundChunks: this.backgroundChunks,
            foregroundChunks: this.foregroundChunks,
            animatedChunks: this.animatedChunks
        };
    }

    public async initWorld() {
        return new Promise((resolve, reject) => {
            try {

                this.fetchTiles().then(async data => {

                    const map: MapType = await this.mapService.getMap()

                    for (const [coor, matrix] of Object.entries(map.backgroundChunks)) {
                        this.backgroundChunks.set(coor, matrix);
                    }
                    for (const [coor, matrix] of Object.entries(map.foregroundChunks)) {
                        this.foregroundChunks.set(coor, matrix);
                    }
                    for (const [coor, matrix] of Object.entries(map.animatedChunks)) {
                        this.animatedChunks.set(coor, matrix);
                    }

                    resolve(map);
                })
            } catch (err) {
                console.error("Error while parsing map:", err);
                reject("Error while parsing map");
            }
        })
    }

    private async fetchTiles() {
        const tiles: Tiles = await this.mapService.getTiles()
        for (const [globalId, tile] of Object.entries(tiles)) {
            const img = new TileImage(tile.image.startsWith('data:')
                ? tile.image
                : 'data:image/png;base64,' + tile.image, 0, 0);
            console.log(img.tile);
            tile.image = img;
            tileList[globalId] = tile;
        }
        return tileList;
    }


    private getTilePosKey(xPos: number, yPos: number): string { //тайлы в тайлы без остатка
        const col = xPos - (xPos % MapManager.CHUNK_SIZE);
        const row = yPos - (yPos % MapManager.CHUNK_SIZE);
        return `${Math.round(col)},${Math.round(row)}`;
    }

    private keyToCoors(key: string) {
        return {
            startX: Number(key.substring(0, key.indexOf(","))),
            startY: Number(key.substring(key.indexOf(",") + 1))
        }
    }

    public getChunk(posX: number, posY: number, layer: string = "background"): Chunk {
        const key = this.getTilePosKey(posX, posY);
        let chunks: Map<string, number[][]> | null = null;
        if (layer === "background") {
            chunks = this.getWorldMap().backgroundChunks;
        } else if (layer === "foreground") {
            chunks = this.getWorldMap().foregroundChunks;
        } else {
            chunks = this.getWorldMap().animatedChunks;
        }
        return {...this.keyToCoors(key), chunk: chunks.get(key)!}
    }

    public getTile(posX: number, posY: number, layer: string = "background") { //работает только с игроком
        // const chunk = this.getChunk(posX, posY, layer);
        const screen = this.getScreenTileMatrix(layer);
        return screen.matrix[posY - screen.startY][posX - screen.startX];
        // return tileList[chunk.chunk[Math.abs(posY % MapManager.CHUNK_SIZE)][Math.abs(posX % MapManager.CHUNK_SIZE)]];
    }




    /**
     * Получает матрицу тайлов размером с экран для рендеринга вокруг позиции игрока
     * @param layer - слой тайлов ("background", "foreground", "animated")
     * @returns объект с матрицей тайлов и информацией о её размерах и позиции
     */
    public getScreenTileMatrix(layer: string = "background"): TileMatrix {
        const [tilesX, tilesY] = this.updateCalculation(settings.defaultTileScale);

        const pos = {x: player!.posX, y: player!.posY};

        // Используем Math.floor вместо Math.round для корректного центрирования
        // Определение границ отображаемой области
        const bias = 30;
        const startX = Math.floor(pos.x - tilesX) - bias;
        const startY = Math.floor(pos.y - tilesY) - bias;
        const endX = Math.ceil(pos.x + tilesX) + bias;
        const endY = Math.ceil(pos.y + tilesY) + bias;

        // Создание матрицы нужного размера
        const width = endX - startX;
        const height = endY - startY;
        const matrix: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

        // Получаем все чанки, которые могут содержать нужные нам тайлы
        const chunkKeys = new Set<string>();
        for (let worldY = startY; worldY <= endY; worldY++) {
            for (let worldX = startX; worldX <= endX; worldX++) {
                chunkKeys.add(this.getTilePosKey(worldX, worldY));
            }
        }

        // Определяем, какую коллекцию чанков использовать
        let chunks: Map<string, number[][]>;
        if (layer === "background") {
            chunks = this.backgroundChunks;
        } else if (layer === "foreground") {
            chunks = this.foregroundChunks;
        } else {
            chunks = this.animatedChunks;
        }

        // Проходим по всем чанкам и копируем их данные в нашу матрицу
        chunkKeys.forEach(chunkKey => {
            if (!chunks.has(chunkKey)) return;

            const chunkData = chunks.get(chunkKey)!;
            const { startX: chunkStartX, startY: chunkStartY } = this.keyToCoors(chunkKey);

            // Вычисляем относительные координаты в матрице и чанке
            for (let chunkY = 0; chunkY < MapManager.CHUNK_SIZE; chunkY++) {
                const worldY = chunkStartY + chunkY;
                if (worldY < startY || worldY >= endY) continue;

                for (let chunkX = 0; chunkX < MapManager.CHUNK_SIZE; chunkX++) {
                    const worldX = chunkStartX + chunkX;
                    if (worldX < startX || worldX >= endX) continue;

                    const matrixX = worldX - startX;
                    const matrixY = worldY - startY;

                    if (chunkData[chunkY] && chunkData[chunkY][chunkX] !== undefined) {
                        matrix[matrixY][matrixX] = chunkData[chunkY][chunkX];
                    }
                }
            }
        });

        return {
            matrix,
            startX,
            startY,
            width,
            height
        };
    }

    /**
     * Получает матрицу тайлов размером 3-4 экрана для обновления данных вокруг позиции игрока
     * @param multiplier - множитель размера области (3 или 4)
     * @param layer - слой тайлов ("background", "foreground", "animated")
     * @returns объект с матрицей тайлов и информацией о её размерах и позиции
     */
    public getUpdateTileMatrix(multiplier: number = 3, layer: string = "background"): TileMatrix {
        const [tilesX, tilesY] = this.updateCalculation(settings.defaultTileScale);

        const pos = {x: player!.posX, y: player!.posY};

        // Определение границ обновляемой области (multiplier раз больше экрана)
        const startX = Math.floor(pos.x - tilesX * multiplier);
        const startY = Math.floor(pos.y - tilesY * multiplier);
        const endX = Math.ceil(pos.x + tilesX * multiplier);
        const endY = Math.ceil(pos.y + tilesY * multiplier);

        // Создание матрицы нужного размера
        const width = endX - startX;
        const height = endY - startY;
        const matrix: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

        // Получаем все чанки, которые могут содержать нужные нам тайлы
        const chunkKeys = new Set<string>();
        for (let worldY = startY; worldY <= endY; worldY++) {
            for (let worldX = startX; worldX <= endX; worldX++) {
                chunkKeys.add(this.getTilePosKey(worldX, worldY));
            }
        }

        // Определяем, какую коллекцию чанков использовать
        let chunks: Map<string, number[][]>;
        if (layer === "background") {
            chunks = this.backgroundChunks;
        } else if (layer === "foreground") {
            chunks = this.foregroundChunks;
        } else {
            chunks = this.animatedChunks;
        }

        // Проходим по всем чанкам и копируем их данные в нашу матрицу
        chunkKeys.forEach(chunkKey => {
            if (!chunks.has(chunkKey)) return;

            const chunkData = chunks.get(chunkKey)!;
            const { startX: chunkStartX, startY: chunkStartY } = this.keyToCoors(chunkKey);

            // Вычисляем относительные координаты в матрице и чанке
            for (let chunkY = 0; chunkY < MapManager.CHUNK_SIZE; chunkY++) {
                const worldY = chunkStartY + chunkY;
                if (worldY < startY || worldY >= endY) continue;

                for (let chunkX = 0; chunkX < MapManager.CHUNK_SIZE; chunkX++) {
                    const worldX = chunkStartX + chunkX;
                    if (worldX < startX || worldX >= endX) continue;

                    const matrixX = worldX - startX;
                    const matrixY = worldY - startY;

                    if (chunkData[chunkY] && chunkData[chunkY][chunkX] !== undefined) {
                        matrix[matrixY][matrixX] = chunkData[chunkY][chunkX];
                    }
                }
            }
        });

        return {
            matrix,
            startX,
            startY,
            width,
            height
        };
    }
}