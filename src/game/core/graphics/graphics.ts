import {entityManager, once, player, worldMap} from "../main.ts";
import {selector1} from "./static/sprites.ts";
import {AnimatedEffect, TileImage} from "./image.ts";
import {FloatText} from "./floatText.ts";
import {tileList} from "./tilesGenerator.ts";
import {settings} from "../config/settings.ts";
import Mob from "../logic/actors/mobs/mob.ts";
import {selectorSheet} from "./static/paths.ts";
import {scaledTileSize} from "../../../utils/math/general.ts";

export class Graphics {
    get debugMode(): boolean {
        return this._debugMode;
    }

    set debugMode(value: boolean) {
        this._debugMode = value;
    }
    get canvas(): HTMLCanvasElement | null {
        return this._canvas;
    }

    set canvas(value: HTMLCanvasElement | null) {
        this._canvas = value;
    }
    get ctx(): CanvasRenderingContext2D | null | undefined {
        return this._ctx;
    }

    set ctx(value: CanvasRenderingContext2D | null) {
        this._ctx = value;
    }

    get floatTextList(): Array<any> {
        return this._floatTextList;
    }

    get effectList(): Array<any> {
        return this._effectList;
    }

    private readonly _floatTextList: Array<FloatText> = [];
    private readonly _effectList: Array<AnimatedEffect> = [];
    private _ctx: CanvasRenderingContext2D | null | undefined;
    private _canvas: HTMLCanvasElement | null = null;
    private selector1: TileImage = new TileImage(selectorSheet, 0, 0);
    // private chunkCanvas: OffscreenCanvas = new OffscreenCanvas(32 * scaledTileSize(), 32 * scaledTileSize());
    // private chunkCtx: OffscreenCanvasRenderingContext2D | null = this.chunkCanvas.getContext("2d");

    // private cachedChunks: Map<string, CanvasImageSource> = new Map();

    private renderAfterList: { (): void; } [] = [];

    private _debugMode: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
        this.ctx!.imageSmoothingEnabled = false;
        this.ctx!.textAlign = "center"
        this._canvas = canvas;
    }

    public render(): void {
        if (this.ctx && this.canvas) {
            this.ctx.save();                       // Сохраняем текущие трансформации (например, от камеры)
            this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Сброс трансформации (координаты теперь в "экранных" координатах)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            this.renderTilemap();
            this.renderActors();
            this.renderEffects();
            this.renderText();
            // if (this._debugMode) {
            //     this.debugRender();
            // }
        }
    }

    private debugRender() {
        this.ctx!.strokeRect(player!.x, player!.y, player!.image!.currentAnimation.size.width, player!.image!.currentAnimation.size.height);
        // this.ctx!.fillText(`x:${player!.posX},y:${player!.posY}`, player!.x + player!.image!.currentAnimation.widthSize / 2, player!.y + 40);
    }

    public drawFPS(fps: number) {
        if (!settings.showFPS) {
            return
        }
        this.ctx?.fillText(`fps: ${fps}`, player.x + window.innerWidth / 2 - scaledTileSize(), player.y + window.innerHeight / 2);
    }

    private renderActors(): void {
        const ctx = <CanvasRenderingContext2D>this.ctx;
        ctx.fillStyle = "blue";

        const mobsAfter: Mob[] = [];
        entityManager.findMobsAt(player.x, player.y).forEach(mob => {
            if (mob.y > player.y + 32 * settings.defaultTileScale) {
                mobsAfter.push(mob);
            } else {
                mob.image?.render(mob.renderState, ctx, mob.x - (32 * settings.defaultTileScale), mob.y - (64 * settings.defaultTileScale), mob.direction);
                // ctx.fillText(mob.x + " "+mob.y, mob!.x + mob.image.currentAnimation.widthSize / 2, mob!.y);
            }
        })

        player!.image!.render(player!.renderState, ctx, player!.x - player?.image?.currentAnimation.size.width / 2, player!.y - player?.image?.currentAnimation.size.height / 2, player!.direction);

        for (const mob of mobsAfter) {
            mob.image?.render(mob.renderState, ctx, mob.x - (32 * settings.defaultTileScale), mob.y - (64 * settings.defaultTileScale), mob.direction);
            // ctx.fillText(mob.x + " "+mob.y, mob!.x + mob.image.currentAnimation.widthSize / 2, mob!.y);
        }

        entityManager.findPlayersAt(player.x, player.y).forEach((player, index) => {
            player.image!.render(player.renderState, ctx, player.x, player.y, player.direction);
        })




        if (this.renderAfterList.length !== 0) {
                for (const render of this.renderAfterList) {
                    render();
                }
        }
        this.renderAfterList = [];

        if (player!.target) {
            const targetWidth = player?.target.image.currentAnimation.size.width;
            const targetHeight = player?.target.image.currentAnimation.size.height;
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.arc(player!.target.x || 0, player!.target.y || 0, Math.max(targetHeight / 3, targetWidth / 3), 0, 2 * Math.PI)
            ctx.stroke();
        }
        ctx.fillText(player!.name, player!.x, player!.y - player?.image?.currentAnimation.size.height / 2);
        // ctx.fillText(`total mobs: ${entityManager.mobs.size}`, player!.x + player.image.currentAnimation.size.width / 2 + 300, player!.y);
        // ctx.fillText(`mobs in chunk: ${entityManager.findMobsAt(player.x, player.y).length}`, player!.x + player.image.currentAnimation.size.width / 2 + 300, player!.y + 200);
        // ctx.fillText(`x:${player.x}, y:${player.y}`, player!.x + player.image.currentAnimation.widthSize / 2, player!.y);
    }

    private renderEffects(): void {
        for (const effect of this.effectList) {
            if (effect.render(this.ctx)) {
                this.effectList.splice(this.effectList.indexOf(effect), 1);
            }
        }
    }

    private renderText(): void {
        let length: number = this.floatTextList.length;
        if (!length) return;

        while (length--) {
            const text: FloatText = this.floatTextList[length];
            text.render(<CanvasRenderingContext2D>this.ctx);
            if (text.update()) {
                this.floatTextList.splice(this.floatTextList.indexOf(text), 1);
            }
        }
    }
    private renderTilemap(): void {
        this.ctx!.fillStyle = "black";

        const layers = [
            worldMap.getScreenTileMatrix("background"),
            worldMap.getScreenTileMatrix("foreground"),
            worldMap.getScreenTileMatrix("animated")
        ];

        for (const screen of layers) {
            const { matrix, startX, startY } = screen;

            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    const tileIndex = matrix[i][j];
                    const tile = tileList[tileIndex];

                    if (!tile) continue;

                    const x = (j + startX) * scaledTileSize();
                    const y = (i + startY) * scaledTileSize();
                    const size = scaledTileSize();

                    const drawTile = () => {
                        this.ctx!.drawImage(tile.image.tile, x, y, size, size);
                        if (this._debugMode) {
                            this.ctx?.strokeRect(x, y, size, size);
                            this.ctx!.fillText(`x:${j + startX},y:${i + startY}`, x, y);
                        }
                    };

                    if (tile.props.renderAfter) {
                        this.renderAfterList.push(drawTile);
                    } else {
                        drawTile();
                    }
                }
            }

            if (this._debugMode) {
                this.ctx?.strokeRect(
                    startX * scaledTileSize(),
                    startY * scaledTileSize(),
                    matrix[0].length * scaledTileSize(),
                    matrix.length * scaledTileSize()
                );
            }
        }
    }
}