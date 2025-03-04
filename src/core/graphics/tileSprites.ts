import {Actor} from "../logic/actors/actor.ts";
import {tileImage} from "./image.ts";

// const mainTileSet: string = "src/assets/tileMap/PixelWoods/Terrain(main)/terrainTiles.png";
// const walls: string = "src/assets/tileMap/Texture/TX Tileset Stone Ground.png";
// const tiles_town: string = "src/assets/tileMap/tiles_town.png";

const grass_tiles: string = "src/assets/tileMap/Environment/Tilesets/Grass_Tiles.png";
const vegetation_tiles: string = "src/assets/tileMap/Environment/Props/Static/Vegetation_01.png";

interface TileProps {
    isWalkable: boolean;
}

interface Tile {
    name: string;
    animated: boolean;
    props: TileProps;
    image: tileImage;
}

// [30, 129, 103, 35, 28, 75, 56, 31, 55, 42, 22, 43, 29, 41, 44, 62, 116, 17, 88, 21, 34, 16]

function setIndex(int: number): number {
    return 1829 + int;
}

export const backgroundTiles: Record<number, Tile> = {
    15: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    16: {
        name: 'Grass2',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 3, 1)
    },
    28: {
        name: 'Grass3',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 2)
    },
    29: {
        name: 'Grass4',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 3, 2)
    },
    41: {
        name: 'Grass5',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 2, 3)
    },
    42: {
        name: 'Grass6',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 3, 3)
    },
    54: {
        name: 'Grass7',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 2, 4)
    },
    55: {
        name: 'Grass8',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 3, 4)
    },
    20: {
        name: 'Grass9',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    21: {
        name: 'Grass10',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    33: {
        name: 'Grass11',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    34: {
        name: 'Grass12',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    61: {
        name: 'Grass13',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    74: {
        name: 'Grass14',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    87: {
        name: 'Grass15',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },

    102: {
        name: 'Grass16',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    115: {
        name: 'Grass17',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },
    128: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(grass_tiles, 7, 3)
    },


    30: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    129: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    103: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    35: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    75: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    56: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },

    31: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    22: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    43: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    44: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    62: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    116: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    17: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },
    88: {
        name: 'Grass1',
        animated: false,
        props: {
            isWalkable: true,
        },
        image: new tileImage(grass_tiles, 2, 1)
    },


};


export const foregroundTiles: Record<number, Tile> = {
    1829: { //1829 is startGid
        name: 'Grass19',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 1, 0)
    },
    1830: {
        name: 'Grass20',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 2, 0)
    },
    1831: {
        name: 'Grass19',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 3, 0)
    },
    1842: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 1, 1)
    },
    1843: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 2, 1)
    },
    1844: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 3, 1)
    },
    1857: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 1, 2)
    },
    1858: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 2, 2)
    },
    1859: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 3, 2)
    },


    1834: {
        name: 'Grass19',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 4, 0)
    },
    1835: {
        name: 'Grass20',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 5, 0)
    },
    1836: {
        name: 'Grass19',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 6, 0)
    },
    1847: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 4, 1)
    },
    1848: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 5, 1)
    },
    1849: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 6, 1)
    },
    1860: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 4, 2)
    },
    1861: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 5, 2)
    },
    1862: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 6, 2)
    },

    1869: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 0, 3)
    },
    1870: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 1, 3)
    },
    1871: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 2, 3)
    },
    1872: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 3, 3)
    },
    1873: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 4, 3)
    },

    1882: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 0, 4)
    },
    1883: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 1, 4)
    },
    1884: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 2, 4)
    },
    1885: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 3, 4)
    },
    1886: {
        name: 'Grass18',
        animated: false,
        props: {
            isWalkable: false,
        },
        image: new tileImage(vegetation_tiles, 4, 4)
    },
}

