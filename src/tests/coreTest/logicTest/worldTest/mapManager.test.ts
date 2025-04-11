import { expect } from "chai";
import sinon from "sinon";
import {MapManager} from "../../../../core/logic/world/mapManager.ts";
import {scaledTileSize} from "../../../../utils/general/math.ts";
import {player, worldMap} from "../../../../core/main.ts";

// const main = await import("../../../../core/main.ts");
// const worldMap = await import("../../../../core/main.ts");


// Мокаем внешние зависимости, если они не замокаются через DI:
// sinon.stub(scaledTileSize, "call").callsFake(() => 16); // Альтернативно: sinon.stub().returns(16);
// Если scaledTileSize — простая функция, можно сделать так:
sinon.stub().returns(16);

// Мокаем глобальные объекты (в тестах Mocha можно использовать глобальный объект "global")
declare var global: any;

describe("MapManager", () => {
    let manager: MapManager;
    let fetchStub: sinon.SinonStub;

    beforeEach(() => {
        manager = new MapManager();

        // Мокаем размеры окна
        Object.defineProperty(global, "window", {
            value: { innerWidth: 800, innerHeight: 600 },
            configurable: true,
        });

        // Настраиваем глобальные значения для player и worldMap:
        player.posX = 10;
        player.posY = 20;
        sinon.stub(worldMap, "getWorldMap").returns({
            backgroundChunks: new Map(),
            foregroundChunks: new Map(),
            animatedChunks: new Map(),
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    // ---------------------------
    // 1. Тест getWorldMap()
    // ---------------------------
    it("getWorldMap() должен возвращать внутренние Map", () => {
        const result = manager.getWorldMap();
        expect(result.backgroundChunks).to.be.instanceOf(Map);
        expect(result.foregroundChunks).to.be.instanceOf(Map);
        expect(result.animatedChunks).to.be.instanceOf(Map);
    });

    // ---------------------------
    // 2. Тест getTilePosKey()
    // ---------------------------
    it("getTilePosKey(x, y) должен возвращать правильный ключ 'col,row'", () => {
        // Обращаемся к приватному методу через приведение к any
        const key = (manager as any).getTilePosKey(40, 50);
        // scaledTileSize = 16, поэтому: col = Math.floor(40/16)=2, row = Math.floor(50/16)=3
        expect(key).to.equal("2,3");
    });

    // ---------------------------
    // 3. Тест convertToMatrix()
    // ---------------------------
    it("convertToMatrix() корректно преобразует одномерный массив в матрицу", () => {
        const chunkData = {
            data: [1, 2, 3, 4],
            width: 2,
            height: 2,
            startX: 0,
            startY: 0,
        };
        // Обращаемся к приватному методу
        const matrix = (manager as any).convertToMatrix(chunkData);
        expect(matrix).to.deep.equal([
            [1, 2],
            [3, 4],
        ]);
    });

    // ---------------------------
    // 4. Тест parseLayers()
    // ---------------------------
    it("parseLayers() должен корректно парсить слои и заполнять чанки", () => {
        const mockLayers = {
            layers: [
                {
                    name: "Background Layer 1",
                    width: 4,
                    height: 2,
                    startX: 0,
                    startY: 0,
                    chunks: [
                        {
                            data: [1, 2, 3, 4],
                            width: 2,
                            height: 2,
                            startX: 0,
                            startY: 0,
                        },
                    ],
                },
                {
                    name: "Foreground Layer A",
                    width: 4,
                    height: 2,
                    startX: 0,
                    startY: 0,
                    chunks: [
                        {
                            data: [9, 8, 7, 6],
                            width: 2,
                            height: 2,
                            startX: 0,
                            startY: 0,
                        },
                    ],
                },
                {
                    name: "Animated Something",
                    width: 4,
                    height: 2,
                    startX: 0,
                    startY: 0,
                    chunks: [
                        {
                            data: [11, 12, 13, 14],
                            width: 2,
                            height: 2,
                            startX: 0,
                            startY: 0,
                        },
                    ],
                },
            ],
        };

        // Обращаемся к приватному методу parseLayers
        const result = (manager as any).parseLayers(mockLayers);

        // Проверяем, что в backgroundChunks есть ключ "0,0"
        expect(result.backgroundChunks.has("0,0")).to.be.true;
        // Проверяем, что в foregroundChunks есть ключ "0,0"
        expect(result.foregroundChunks.has("0,0")).to.be.true;
        // Анимация по коду записывается с ключом "256,144"
        expect(result.animatedChunks.has("256,144")).to.be.true;

        expect(result.backgroundChunks.get("0,0")).to.deep.equal([
            [1, 2],
            [3, 4],
        ]);
        expect(result.foregroundChunks.get("0,0")).to.deep.equal([
            [9, 8],
            [7, 6],
        ]);
        expect(result.animatedChunks.get("256,144")).to.deep.equal([
            [11, 12],
            [13, 14],
        ]);
    });

    // ---------------------------
    // 5. Тест initWorld()
    // ---------------------------
    it("initWorld() должен вызывать fetch, парсить JSON и обрабатывать данные", async () => {
        const fakeResponse = {
            json: async () => ({
                layers: [
                    {
                        name: "Background Test",
                        width: 2,
                        height: 2,
                        startX: 0,
                        startY: 0,
                        chunks: [
                            {
                                data: [1, 2, 3, 4],
                                width: 2,
                                height: 2,
                                startX: 0,
                                startY: 0,
                            },
                        ],
                    },
                ],
            }),
        };

        // Мокаем fetch
        fetchStub = sinon.stub(global, "fetch").resolves(fakeResponse as any);

        // Для проверки вызова generateTiles можно замокать импортированный метод,
        // но здесь мы сосредоточимся на fetch и парсинге.
        await manager.initWorld();

        expect(fetchStub.calledOnce).to.be.true;
        expect(fetchStub.calledWith("http://localhost:5173/public/world.json")).to.be.true;
    });

    // ---------------------------
    // 6. Тест getIndexingChunks()
    // ---------------------------
    it("getIndexingChunks() должен возвращать чанки, попадающие в зону вокруг игрока", () => {
        // Подготавливаем фиктивные чанки в backgroundChunks
        const mockBackground = new Map<string, number[][]>();
        mockBackground.set("0,1", [[1]]);
        mockBackground.set("0,2", [[2]]);
        mockBackground.set("1,1", [[3]]);

        // Обновляем возвращаемое значение для worldMap.getWorldMap()
        (worldMap.getWorldMap as sinon.SinonStub).returns({
            backgroundChunks: mockBackground,
            foregroundChunks: new Map(),
            animatedChunks: new Map(),
        });

        const indexing = manager.getIndexingChunks();

        // Проверяем, что в backgroundChunks найден хотя бы один элемент
        expect(indexing.backgroundChunks.length).to.be.greaterThan(0);
        // Проверяем, что ключ "0,1" присутствует
        const chunk01 = indexing.backgroundChunks.find(
            (c: any) => c.startX === 0 && c.startY === 1
        );
        expect(chunk01).to.exist;
        expect(chunk01.chunk).to.deep.equal([[1]]);
    });
});
