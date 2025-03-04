import {scaledTileSize} from "../../utils/math.ts";
import {backgroundTiles, foregroundTiles} from "./tileSprites.ts";
import {player, worldMap} from "../main.ts";
import {selector1} from "./static/sprites.ts";
import {Mob} from "../logic/actors/mobs/mob.ts";
import {AnimatedEffect} from "./image.ts";
import {FloatText} from "./floatText.ts";
import {settings} from "../config/settings.ts";
import {alertf, logf} from "../../utils/debug.ts";

export class Graphics {
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

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
    }

    public render(): void {
        if (this.ctx) {
            this.renderTilemap();
            this.renderActors();
            this.renderEffects();
            this.renderText();
        }
    }

    private renderActors(): void {
        const ctx = <CanvasRenderingContext2D>this.ctx;
        ctx.fillStyle = "blue";
        player!.image!.render(player!.renderState, ctx, player!.x, player!.y, player!.direction);
        for (const mob of Mob.mobList) {
            mob.image!.render(mob.renderState, ctx, mob.x, mob.y, mob.direction);
            ctx.fillText(mob.name, mob.x, mob.y);
        }
        if (player!.target) {
            ctx.drawImage(selector1.tile, player!.target.x || 0, player!.target.y || 0, scaledTileSize(), scaledTileSize());
        }
        // console.log(player!.name);
        ctx.fillText(player!.name, player!.x, player!.y);
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
        const map = worldMap.getIndexingChunks();
        let l: number = 0;
        for (const layer of Object.values(map)) {
            for (const chunk of layer) {
                const chunkData = chunk.chunk;
                const offsetX = chunk.startX;
                const offsetY = chunk.startY;
                for (let i: number = 0; i < chunkData.length; i++) {
                    for (let j: number = 0; j < chunkData[i].length; j++) {
                        const tile: number = chunkData[i][j];
                        if (l === 0) {
                            if (!backgroundTiles[tile]) {
                                this.ctx!.fillRect((j + offsetX) * scaledTileSize(), (i + offsetY) * scaledTileSize(),
                                    scaledTileSize(), scaledTileSize());
                                continue;
                            }
                            this.ctx!.drawImage(backgroundTiles[tile].image.tile, (j + offsetX) * scaledTileSize(), (i + offsetY) * scaledTileSize(),
                                scaledTileSize(), scaledTileSize());
                        } else if (l === 1) {
                            if (!foregroundTiles[tile]) {
                                // this.ctx!.fillRect((j + offsetX) * scaledTileSize(), (i + offsetY) * scaledTileSize(),
                                //     scaledTileSize(), scaledTileSize());
                                continue;
                            }
                            this.ctx!.drawImage(foregroundTiles[tile].image.tile, (j + offsetX) * scaledTileSize(), (i + offsetY) * scaledTileSize(),
                                scaledTileSize(), scaledTileSize());
                        }
                    }
                }

            }
            l++;
        }
    }
}