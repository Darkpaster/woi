import { player } from "../../main.ts";
import { tileList, Tiles } from "../../graphics/tilesGenerator.ts";
import { memoizeCalculation } from "../../../../utils/general/general.ts";
import { settings } from "../../config/settings.ts";
import { MapService, MapType } from "../../../ui/features/menu/api/mapService.ts";
import { TileImage } from "../../graphics/image.ts";

interface ChunkCoordinates {
    startX: number;
    startY: number;
}

interface TileMatrix {
    matrix: number[][];
    startX: number;
    startY: number;
    width: number;
    height: number;
}

interface Chunk extends ChunkCoordinates {
    chunk: number[][];
}

interface WorldMap {
    backgroundChunks: Map<string, number[][]>;
    foregroundChunks: Map<string, number[][]>;
    animatedChunks: Map<string, number[][]>;
}

export class MapManager {
    static readonly CHUNK_SIZE = 32;

    private readonly backgroundChunks = new Map<string, number[][]>();
    private readonly foregroundChunks = new Map<string, number[][]>();
    private readonly animatedChunks = new Map<string, number[][]>();
    private readonly mapService = new MapService();

    private readonly calculateVisibleTiles = memoizeCalculation(([tileSize]) => {
        const tilesY = Math.ceil(window.innerHeight / (tileSize * settings.tileSize) / 2);
        const tilesX = Math.ceil(window.innerWidth / (tileSize * settings.tileSize) / 2);
        return [tilesX, tilesY];
    });

    getWorldMap(): WorldMap {
        return {
            backgroundChunks: this.backgroundChunks,
            foregroundChunks: this.foregroundChunks,
            animatedChunks: this.animatedChunks
        };
    }

    async initWorld(): Promise<MapType> {
        try {
            await this.loadTiles();
            const map = await this.mapService.getMap();

            this.loadChunks(map.backgroundChunks, this.backgroundChunks);
            this.loadChunks(map.foregroundChunks, this.foregroundChunks);
            this.loadChunks(map.animatedChunks, this.animatedChunks);

            return map;
        } catch (error) {
            console.error("Error initializing world:", error);
            throw new Error("Failed to initialize world");
        }
    }

    private async loadTiles(): Promise<Tiles> {
        const tiles = await this.mapService.getTiles();

        for (const [globalId, tile] of Object.entries(tiles)) {
            const imageData = tile.image.startsWith('data:')
                ? tile.image
                : `data:image/png;base64,${tile.image}`;

            const img = new TileImage(imageData, 0, 0);
            console.log(img.tile);

            tile.image = img;
            tileList[globalId] = tile;
        }

        return tileList;
    }

    private loadChunks(source: Record<string, number[][]>, target: Map<string, number[][]>): void {
        for (const [coordinate, matrix] of Object.entries(source)) {
            target.set(coordinate, matrix);
        }
    }

    private getChunkKey(xPos: number, yPos: number): string {
        const col = xPos - (xPos % MapManager.CHUNK_SIZE);
        const row = yPos - (yPos % MapManager.CHUNK_SIZE);
        return `${Math.round(col)},${Math.round(row)}`;
    }

    private parseChunkKey(key: string): ChunkCoordinates {
        const [startX, startY] = key.split(",").map(Number);
        return { startX, startY };
    }

    private getChunkCollection(layer: string): Map<string, number[][]> {
        switch (layer) {
            case "background":
                return this.backgroundChunks;
            case "foreground":
                return this.foregroundChunks;
            case "animated":
                return this.animatedChunks;
            default:
                return this.backgroundChunks;
        }
    }

    getChunk(posX: number, posY: number, layer = "background"): Chunk {
        const key = this.getChunkKey(posX, posY);
        const chunks = this.getChunkCollection(layer);
        const coordinates = this.parseChunkKey(key);
        const chunk = chunks.get(key);

        return {
            ...coordinates,
            chunk: chunk || []
        };
    }

    getTile(posX: number, posY: number, layer = "background"): number {
        const screen = this.getScreenTileMatrix(layer);
        const matrixX = posX - screen.startX;
        const matrixY = posY - screen.startY;

        if (matrixY < 0 || matrixY >= screen.matrix.length ||
            matrixX < 0 || matrixX >= screen.matrix[0].length) {
            return 0;
        }

        return screen.matrix[matrixY][matrixX];
    }

    getScreenTileMatrix(layer = "background"): TileMatrix {
        const [tilesX, tilesY] = this.calculateVisibleTiles(settings.defaultTileScale);
        const pos = { x: player!.posX, y: player!.posY };

        const startX = Math.floor(pos.x - tilesX) + 1;
        const startY = Math.floor(pos.y - tilesY) + 1;
        const endX = Math.ceil(pos.x + tilesX) + 3;
        const endY = Math.ceil(pos.y + tilesY) + 3;

        return this.buildTileMatrix(startX, startY, endX, endY, layer);
    }

    getUpdateTileMatrix(multiplier = 3, layer = "background"): TileMatrix {
        const [tilesX, tilesY] = this.calculateVisibleTiles(settings.defaultTileScale);
        const pos = { x: player!.posX, y: player!.posY };

        const startX = Math.floor(pos.x - tilesX * multiplier);
        const startY = Math.floor(pos.y - tilesY * multiplier);
        const endX = Math.ceil(pos.x + tilesX * multiplier);
        const endY = Math.ceil(pos.y + tilesY * multiplier);

        return this.buildTileMatrix(startX, startY, endX, endY, layer);
    }

    private buildTileMatrix(startX: number, startY: number, endX: number, endY: number, layer: string): TileMatrix {
        const width = endX - startX;
        const height = endY - startY;
        const matrix: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));
        const chunks = this.getChunkCollection(layer);

        for (let worldY = startY; worldY < endY; worldY++) {
            for (let worldX = startX; worldX < endX; worldX++) {
                const chunkX = Math.floor(worldX / MapManager.CHUNK_SIZE);
                const chunkY = Math.floor(worldY / MapManager.CHUNK_SIZE);
                const chunkKey = `${chunkX * MapManager.CHUNK_SIZE},${chunkY * MapManager.CHUNK_SIZE}`;
                const chunk = chunks.get(chunkKey);

                if (!chunk) continue;

                const localX = worldX - (chunkX * MapManager.CHUNK_SIZE);
                const localY = worldY - (chunkY * MapManager.CHUNK_SIZE);
                const arrayX = localX >= 0 ? localX : MapManager.CHUNK_SIZE + localX;
                const arrayY = localY >= 0 ? localY : MapManager.CHUNK_SIZE + localY;

                if (chunk[arrayY]?.[arrayX] !== undefined) {
                    const matrixX = worldX - startX;
                    const matrixY = worldY - startY;
                    matrix[matrixY][matrixX] = chunk[arrayY][arrayX];
                }
            }
        }

        return { matrix, startX, startY, width, height };
    }
}