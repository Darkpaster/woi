import {once, player} from "../../main.ts";
import {generateTiles, tileList} from "../../graphics/tilesGenerator.ts";
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

    public static readonly CHUNK_SIZE: 32 = 32;

    public getWorldMap() {
        return { backgroundChunks: this.backgroundChunks, foregroundChunks: this.foregroundChunks, animatedChunks: this.animatedChunks };
    }

    public async initWorld() {
        return new Promise((resolve, reject) => {
            try {
                const data = fetch("http://localhost:5173/public/world.json");

                data.then((data) => {
                    data.json().then(json => {
                        generateTiles(json).then(res => {
                            const parsedData: { layers: Layer[] } = json;

                            const parsedChunks: ParsedChunks = this.parseLayers(parsedData);
                            this.backgroundChunks = parsedChunks.backgroundChunks;
                            this.foregroundChunks = parsedChunks.foregroundChunks;
                            this.animatedChunks = parsedChunks.animatedChunks;
                        });
                    }).then(() => {
                        resolve("result");
                    })
                    })
            } catch (err) {
                console.error("Error while parsing map:", err);
                reject("Error while parsing map");
            }
        })
    }


    private getTilePosKey(xPos: number, yPos: number): string { //тайлы в тайлы без остатка
        const col = xPos - (xPos % MapManager.CHUNK_SIZE);
        const row = yPos - (yPos % MapManager.CHUNK_SIZE);
        return `${col},${row}`;
    }

    public getIndexingChunks(): IndexingChunks {
        const [tilesX, tilesY] = this.updateCalculation(settings.defaultTileScale); // оптимизация

        const pos = { x: player!.posX, y: player!.posY};
        const beforeY: number = pos.y - tilesY - 30;
        const afterY: number = pos.y + tilesY;

        const beforeX: number = pos.x - tilesX - 30;
        const afterX: number = pos.x + tilesX;

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

    public getChunk(posX: number, posY: number, layer: string = "background"): Chunk {
        const key = this.getTilePosKey(posX, posY);
        let chunks: Map<string, number[][]> | null = null;
        if (layer === "background") {
            chunks = this.getWorldMap().backgroundChunks;
        }else if (layer === "foreground") {
            chunks = this.getWorldMap().foregroundChunks;
        } else {
            chunks = this.getWorldMap().animatedChunks;
        }
        return { ...this.keyToCoors(key), chunk: chunks.get(key)! }
    }

    public getTile(posX: number, posY: number, layer: string = "background") {
        const chunk = this.getChunk(posX, posY, layer);
        return tileList[chunk.chunk[Math.abs(posY % MapManager.CHUNK_SIZE)][Math.abs(posX % MapManager.CHUNK_SIZE)]];
    }

    private convertToMatrix(chunk: ChunkData): number[][] {
        const matrix: number[][] = [];
        for (let y = 0; y < MapManager.CHUNK_SIZE; y++) {
            matrix.push(chunk.data.slice(y * MapManager.CHUNK_SIZE, (y + 1) * MapManager.CHUNK_SIZE));
        }
        return matrix;
    }

// Исправленная версия parseLayers
    private parseLayers(layers: { layers: Layer[] }): ParsedChunks {
        for (const layer of layers.layers) {
            if (layer.chunks.length === 0) continue; // если нет чанков, переходим к следующему слою

            const layerName = layer.name.toLowerCase();

            console.log(`Processing layer: ${layer.name}, chunks: ${layer.chunks.length}`);

            layer.chunks.forEach((chunk: ChunkData) => {
                // Проверяем данные чанка для отладки
                // console.log(`Chunk at (${chunk.x}, ${chunk.y}) with width ${chunk.width}, height ${chunk.height}`);

                // Исправленный расчет ключа чанка
                // Это зависит от формата вашей карты - убедитесь, что это соответствует
                // формату, используемому в Tiled или другом редакторе карт
                let key;

                // Если координаты чанка уже в тайлах (часто так в Tiled)
                if (chunk.width === MapManager.CHUNK_SIZE && chunk.height === MapManager.CHUNK_SIZE) {
                    key = `${chunk.x},${chunk.y}`;
                } else {
                    // Если координаты в пикселях или другом формате, конвертируем их
                    key = this.getTilePosKey(chunk.x, chunk.y);
                }

                // console.log(`Using key: ${key} for chunk at (${chunk.x}, ${chunk.y})`);

                const matrix = this.convertToMatrix(chunk);

                // Сохраняем матрицу чанка с правильным ключом
                if (layerName.includes("background")) {
                    this.backgroundChunks.set(key, matrix);
                } else if (layerName.includes("foreground")) {
                    this.foregroundChunks.set(key, matrix);
                } else if (layerName.includes("animated")) {
                    this.animatedChunks.set(key, matrix);
                }
            });
        }
        // Проверка загруженных чанков для отладки
        console.log(`Loaded ${this.backgroundChunks.size} background chunks, ${this.foregroundChunks.size} foreground chunks, ${this.animatedChunks.size} animated chunks`);

        this.debugCheckMap();

        return {
            backgroundChunks: this.backgroundChunks,
            foregroundChunks: this.foregroundChunks,
            animatedChunks: this.animatedChunks
        };
    }


    // Добавляем диагностическую функцию для проверки карты
    public debugCheckMap(): void {
        console.log("=== Map Debug Info ===");
        console.log(`Total chunks - Background: ${this.backgroundChunks.size}, Foreground: ${this.foregroundChunks.size}, Animated: ${this.animatedChunks.size}`);

        // Проверяем несколько случайных точек на карте
        const testPoints = [
            {x: 0, y: 0},
            {x: 10, y: 10},
            {x: -10, y: -10},
            {x: 100, y: 100},
            {x: -100, y: -100}
        ];

        for (const point of testPoints) {
            console.log(`\nDebug at point (${point.x}, ${point.y}):`);

            // Получаем ключ чанка
            const key = this.getTilePosKey(point.x, point.y);
            console.log(`Chunk key: ${key}`);

            // Проверяем наличие чанков для каждого слоя
            const hasBackground = this.backgroundChunks.has(key);
            const hasForeground = this.foregroundChunks.has(key);
            const hasAnimated = this.animatedChunks.has(key);

            console.log(`Has chunks - Background: ${hasBackground}, Foreground: ${hasForeground}, Animated: ${hasAnimated}`);

            // Проверяем тайл в этой точке
            if (hasForeground) {
                const chunk = this.getChunk(point.x, point.y, "foreground");
                const localX = ((point.x - chunk.startX) + MapManager.CHUNK_SIZE) % MapManager.CHUNK_SIZE;
                const localY = ((point.y - chunk.startY) + MapManager.CHUNK_SIZE) % MapManager.CHUNK_SIZE;

                if (chunk.chunk[localY] && chunk.chunk[localY][localX] !== undefined) {
                    const tileId = chunk.chunk[localY][localX];
                    const tile = tileList[tileId];
                    console.log(`Tile at point: ID ${tileId}, isWalkable: ${tile?.props.isWalkable}`);
                } else {
                    console.log(`No valid tile data at local position (${localX}, ${localY}) in chunk`);
                }
            }
        }

        console.log("=== End Map Debug Info ===");
    }
}