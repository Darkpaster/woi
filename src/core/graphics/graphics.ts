import {scaledTileSize} from "../../utils/math.ts";
import {tiles} from "./tileSprites.ts";
import {getCurrentLocation} from "../logic/world/locationList.ts";
import {settings} from "../config/settings.ts";
import {graphics, player} from "../main.ts";

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

    set floatTextList(value: Array<any>) {
        this._floatTextList = value;
    }

    get effectList(): Array<any> {
        return this._effectList;
    }

    set effectList(value: Array<any>) {
        this._effectList = value;
    }

    private _floatTextList: Array<any> = [];
    private _effectList: Array<any> = [];
    private _ctx: CanvasRenderingContext2D | null | undefined;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
    }

    public render(): void {
        if (this.ctx) {
            this.ctx.font = 7 * settings.defaultTileScale + "px pixel";
            this.renderTilemap();
            this.renderActors();
            this.renderEffects();
            this.renderText();
        }
    }

    private renderActors(): void {
        // try {
        //     this.ctx!.fillStyle = "blue";
        //     player!.image!.render(player!.renderState, this.ctx, player!.x, player!.y, player!.direction);
        //     for (const mob of Mob.mobList) {
        //         mob.image!.render(mob.renderState, this.ctx, mob.x, mob.y, mob.direction);
        //         this.ctx!.fillText(mob.name, mob.x, mob.y);
        //     }
        //     this.ctx!.drawImage(selector1.tile, player!.target!.x || 0, player!.target?.y || 0, scaledTileSize(), scaledTileSize());
        //     this.ctx!.fillText(player!.name, player!.x, player!.y);
        // } catch (e) {
        //     console.error(e);
        // }
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
            const text: any = this.floatTextList[length];
            text.render(this.ctx);
            if (text.update()) {
                this.floatTextList.splice(this.floatTextList.indexOf(text), 1);
            }
        }
    }

    private renderTilemap(): void {
        const tilesY: number = Math.round(window.innerHeight / scaledTileSize() / 2) + 2;
        const tilesX: number = Math.round(window.innerWidth / scaledTileSize() / 2) + 2;

        const beforeY: number = player!.posY - tilesY + 2;
        const afterY: number = player!.posY + tilesY;

        const beforeX: number = player!.posX - tilesX + 2;
        const afterX: number = player!.posX + tilesX;

        if (this.ctx) {
            this.ctx.fillStyle = "black";

            for (let i: number = beforeY; i < afterY; i++) {
                for (let j: number = beforeX; j < afterX; j++) {
                    const tile: number = getCurrentLocation().floor[i][j];
                    const wall: number = getCurrentLocation().objects[i][j];

                    if (!tiles[tile]) {
                        this.ctx.fillRect(j * scaledTileSize(), i * scaledTileSize(),
                            scaledTileSize(), scaledTileSize());
                        continue;
                    }

                    // console.log(typeof tiles[tile].image.tile);
                    this.ctx.drawImage(tiles[tile].image.tile, j * scaledTileSize(), i * scaledTileSize(),
                        scaledTileSize(), scaledTileSize());

                    if (tiles[wall]) {
                        this.ctx.drawImage(tiles[wall].image.tile, j * scaledTileSize(), i * scaledTileSize(),
                            scaledTileSize(), scaledTileSize());
                    }
                }
            }
        }
    }
}