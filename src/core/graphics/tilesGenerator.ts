
// import { readFileSync, writeFileSync } from "fs";
// import * as path from "path";

interface TiledTileset {
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
        properties?: { name: string; type: string; value: any }[];
        animation?: { tileid: number; duration: number }[];
    }[];
}

interface Tile {
    name: string;
    animated: boolean;
    props: Record<string, any>;
    image: any; // предположим, что tileImage – это класс или функция, типизировать можно подробнее
}

export async function generateTiles() {

    const data: Response = await fetch("http://localhost:5173/public/world.json");
    data.json().then((json) => {
        // alertf(json);
        // const parsedData: { layers: Layer[] } = JSON.parse(json);
        const tilesets: TiledTileset[] = json.tilesets;

        for (const tileset of tilesets) {

// Генерируемый код, который будет записан в файл foregroundTiles.ts
            let output = "export const tileList: Record<number, Tile> = {\n";

// Количество тайлов в ряду изображения tileset
            const columns = Math.floor(tileset.imagewidth / tileset.tilewidth);

            for (let localId = 0; localId < tileset.tilecount; localId++) {
                // Глобальный ID = firstgid + локальный ID
                const globalId = tileset.firstgid + localId;

                // Ищем дополнительную информацию о тайле, если она задана
                const tileData = tileset.tiles?.find(tile => tile.id === localId);

                // Если в properties присутствует свойство "name", используем его
                let name = tileData?.properties?.find(p => p.name === "name")?.value;
                if (!name) {
                    name = `Tile${globalId}`;
                }

                // Если у тайла задана анимация, считаем его анимированным
                const animated = !!tileData?.animation;

                // Вычисляем смещение (offset) тайла в tileset‑изображении:
                // Колонка считается от 0, но в шаблоне offsetX начинается с 1.
                const col = localId % columns;
                const row = Math.floor(localId / columns);
                const offsetX = col + 1; // согласно примеру: 1, 2, 3...
                const offsetY = row;     // согласно примеру: 0, 1, 2...

                // Формируем строковое представление объекта для данного тайла.
                output += `  ${globalId}: {\n`;
                output += `    name: '${name}',\n`;
                output += `    animated: ${animated},\n`;
                output += `    props: {\n`;
                // Добавляем все свойства, кроме "name" (если они заданы)
                if (tileData?.properties) {
                    tileData.properties.forEach(prop => {
                        if (prop.name !== "name") {
                            output += `      ${prop.name}: ${JSON.stringify(prop.value)},\n`;
                        }
                    });
                }
                output += `    },\n`;
                output += `    image: new tileImage(vegetation_tiles, ${offsetX}, ${offsetY})\n`;
                output += `  },\n`;
            }

            output += "};\n";

// Записываем результат в файл foregroundTiles.ts
// writeFileSync("foregroundTiles.ts", output, "utf8");
            console.log(output);

            // console.log("Tiles generated successfully in foregroundTiles.ts");
        }
    })


}
