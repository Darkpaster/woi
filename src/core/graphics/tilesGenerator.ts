
import {tileImage} from "./image.ts";
import {logf} from "../../utils/debug.ts";

interface TileProps {
    [key: string]: string|boolean|number
}

interface Tile {
    [key: number]: {
        name: string;
        props: TileProps;
        image: tileImage;
    }
}

export const tileList: Tile = {

};

interface Tileset {
    name: string;
    firstgid: number;
    tilecount: number;
    tilewidth: number;
    tileheight: number;
    image: string;
    imagewidth: number;
    imageheight: number;
    // Опциональное поле с дополнительными данными для отдельных тайлов
    tiles?: {
        id: number;
        properties?: Property[];
        animation?: { tileid: number; duration: number }[];
    }[];
    wangsets?: {
        id: number;
        properites?: Property[];
        animation?: { tileid: number; duration: number }[];
    }
    // properties: Property[];
}

type Property = {
    name: string, //название свойства
    type: string, // тип данных (хз зачем он тут)
    propertytype?: string, //название кастомного типа
    value: boolean | number | string; // сами данные
}

export async function generateTiles(map: any) {

        const tilesets: Tileset[] = map.tilesets;

        for (const tileset of tilesets) {
            const tilesetImagePath = `src/assets/tileMap/forGeneration/${tileset.image.substring(tileset.image.lastIndexOf("/") + 1)}`;

            const columns = Math.floor(tileset.imagewidth / tileset.tilewidth);

            for (let localId = 0; localId < tileset.tilecount; localId++) {

                // Ищем дополнительную информацию о тайле, если она задана
                let tileData = tileset.tiles?.find(tile => tile.id === localId);

                const hasTileData = tileData !== undefined;
                const globalId = hasTileData
                    ? tileData.id + tileset.firstgid
                    : localId + tileset.firstgid;

                // Если в properties присутствует свойство "name", используем его
                let name = tileData?.properties?.find(p => p.name === "name")?.value;
                if (!name) {
                    name = `Tile${globalId}`;
                }

                // Вычисляем смещение (offset) тайла в tileset‑изображении:
                const col = localId % columns;
                const row = Math.floor(localId / columns);

                tileList[globalId] = {
                    name: name.toString(),
                    props: {
                        isWalkable: true,
                        renderAfter: false,
                        damage: 0,
                        animated: false,
                    },
                    image: new tileImage(tilesetImagePath, col, row),
                }

                if (hasTileData && tileData.properties !== undefined) {
                    for (const property of tileData.properties) {
                        tileList[globalId].props[property.name] = property.value;
                    }
                }

            }

        }

        setTimeout(() => {
            logf(tileList);
        }, 1000);
}
