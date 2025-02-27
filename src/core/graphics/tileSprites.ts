import { Actor } from "../logic/actors/actor.ts";
import { getCurrentLocation } from "../logic/world/locationList.ts";
import { tileImage } from "./image.ts";

const mainTileSet: string = "src/assets/tileMap/PixelWoods/Terrain(main)/terrainTiles.png";
const walls: string = "src/assets/tileMap/Texture/TX Tileset Stone Ground.png";
const tiles_town: string = "src/assets/tileMap/tiles_town.png";

interface TileProps {
    isWalkable: boolean;
}

interface Tile {
    name: string;
    props: TileProps;
    image: tileImage;
}

export const tiles: Record<number, Tile> = {
    57: {
        name: 'Grass1',
        props: {
            isWalkable: true,
        },
        image: new tileImage(mainTileSet, 8, 2)
    },
    81: {
        name: 'Grass2',
        props: {
            isWalkable: true,
        },
        image: new tileImage(mainTileSet, 8, 3)
    },
    105: {
        name: 'Grass3',
        props: {
            isWalkable: true,
        },
        image: new tileImage(mainTileSet, 8, 4)
    },
    437: {
        name: 'Tree1',
        props: {
            isWalkable: false,
        },
        image: new tileImage(tiles_town, 4, 3)
    },
    438: {
        name: 'Tree2',
        props: {
            isWalkable: false,
        },
        image: new tileImage(tiles_town, 5, 3)
    },
    439: {
        name: 'Tree3',
        props: {
            isWalkable: false,
        },
        image: new tileImage(tiles_town, 6, 3)
    },
};

export function getActorTile(actor: Actor): Tile | undefined {
    return tiles[getCurrentLocation().floor[actor.posY][actor.posX]];
}

export function getTile(posX:number, posY:number): Tile | undefined {
    return tiles[getCurrentLocation().floor[posY][posX]];
}

export function getWallTile(posX:number, posY:number): Tile | null {
    const pos = getCurrentLocation().objects[posY][posX];
    
    if (pos === undefined) {
        console.warn(`No object at position (${posX}, ${posY})`);
        return null;
    }

    let tile = tiles[pos];

    if (!tile) {
        tile = tiles[81];
    }

    return tile;
}