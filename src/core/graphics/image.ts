import { settings } from "../config/settings.ts";
import { scaledTileSize } from "../../utils/math.ts";
import { Delay } from "../../utils/time.ts";
import {graphics} from "../main.ts";

export class AnimatedImageManager {
    list: Record<string, AnimatedImage>;
    isFlipped: boolean;
    currentAnimation: AnimatedImage;
    flipX: boolean;
    horizontalSheet: boolean;

    constructor(list: Record<string, AnimatedImage>, flipX: boolean = true, horizontalSheet: boolean = true) {
        this.list = list;
        this.isFlipped = false;
        this.currentAnimation = this.list["idle"] || this.list[Object.keys(this.list)[0]];
        this.flipX = flipX;
        this.horizontalSheet = horizontalSheet;

        for (const key in this.list) {
            this.list[key].manager = this;
        }
    }

    render(sheet: string, ctx: CanvasRenderingContext2D, x: number, y: number, direction: string): void {
        const current = this.list[sheet];
        const prevAnimation = this.currentAnimation;
        if (prevAnimation.disposable && !prevAnimation.endOfAnimation) {
            prevAnimation.render(ctx, this.isFlipped, x, y, direction);
            return;
        }
        if (!current) {
            alert(sheet + " not found in AnimatedImageManager");
        }
        this.isFlipped = current.render(ctx, this.isFlipped, x, y, direction);
        this.currentAnimation = current;
        if (prevAnimation.name !== this.currentAnimation.name) {
            prevAnimation.currentFrame = 0;
        }
    }

}

export class AnimatedImage extends Image {
    get manager(): AnimatedImageManager | undefined{
        return this._manager;
    }

    set manager(value: AnimatedImageManager) {
        this._manager = value;
    }
    name: string;
    src: string;
    framesNumber: number;
    currentFrame: number;
    framesRate: Delay;
    disposable: boolean;
    endOfAnimation: boolean;
    private _manager: AnimatedImageManager | undefined;

    constructor(name: string, src: string, framesNumber: number, disposable: boolean = false,
        framesRate: number = 400) {
        super();
        this.name = name;
        this.src = src;
        this.framesNumber = framesNumber;
        this.currentFrame = 0;
        this.framesRate = new Delay(Math.floor(framesRate / settings.delay()));
        this.disposable = disposable;
        this.endOfAnimation = false;
    }

    render(ctx: CanvasRenderingContext2D, isFlipped: boolean, x: number, y: number, direction: string): boolean {
        if (!this.manager!.flipX) {
            isFlipped = false;
        }
        if (this.endOfAnimation) {
            this.endOfAnimation = false;
        }
        let spriteWidth = this.width / this.framesNumber;
        let spriteHeight = this.height;
        let cutX = this.currentFrame * spriteWidth;
        let cutY = 0;
        // if (!this.manager.horizontalSheet) {
        //     spriteWidth = this.width;
        //     spriteHeight = this.height / this.framesNumber;
        //     cutX = 0;
        //     cutY = this.currentFrame * spriteHeight;
        // }
        // const renderXOffset = spriteWidth * this.scale / 2;
        // const renderYOffset = spriteHeight * this.scale / 2;
        const flipX = direction === "left" || isFlipped && direction !== "right";
        if (flipX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this, cutX, cutY, spriteWidth,
                spriteHeight, -x - scaledTileSize(), y,
                spriteWidth * settings.defaultTileScale, spriteHeight * settings.defaultTileScale);
            ctx.restore();
        } else {
            ctx.drawImage(this, cutX, cutY, spriteWidth,
                spriteHeight, x, y, spriteWidth * settings.defaultTileScale, spriteHeight * settings.defaultTileScale);
        }

        if (this.framesRate.timeIsUp()) {
            this.currentFrame++;
            if (this.currentFrame >= this.framesNumber) {
                this.currentFrame = 0;
                if (this.disposable) {
                    this.endOfAnimation = true;
                }
            }
        }

        return flipX;

    }
}

export class AnimatedEffect extends Image {
    name: string
    src: string
    framesNumber: number
    framesRate: Delay
    currentFrame: number
    ax: number = 0;
    ay: number = 0;

    constructor(src: string, framesNumber: number, framesRate = 200) {
        super()
        this.name = "name";
        this.src = src;
        this.framesNumber = framesNumber;
        this.framesRate = new Delay(Math.floor(framesRate / settings.delay()));
        this.currentFrame = 0;
    }

    create(x: number, y: number) {
        this.ax = x;
        this.ay = y;
        graphics?.effectList.push(this);
    }

    render(ctx: CanvasRenderingContext2D): boolean {
        let spriteWidth = this.width / this.framesNumber;
        let spriteHeight = this.height;
        let cutX = this.currentFrame * spriteWidth;
        let cutY = 0;
        ctx.drawImage(this, cutX, cutY, spriteWidth,
            spriteHeight, this.ax, this.ay, scaledTileSize(), scaledTileSize());

        if (this.framesRate.timeIsUp()) {
            this.currentFrame++;
            if (this.currentFrame >= this.framesNumber) {
                this.currentFrame = 0;
                return true;
            }
        }
        return false;
    }

}

export class StaticImage extends Image {
    src: string

    constructor(src: string) {
        super()
        this.src = src;
    }
}


export class tileImage {

    private _tile: ImageBitmap | null = null;  // Initializing with null since it will be set later

    constructor(src: string, tileX: number, tileY: number, _tileSize = settings.tileSize) {
        const image: HTMLImageElement = new Image();
        image.src = src;
        image.onload = () => createImageBitmap(image, tileX * _tileSize, tileY * _tileSize, _tileSize, _tileSize).then(bitmap => {
            this.tile = bitmap;
        }).catch((error) => {
            console.error("Error creating ImageBitmap:", error);
        });
    }

    get tile(): ImageBitmap {
        return <ImageBitmap>this._tile;
    }

    set tile(value: ImageBitmap) {
        this._tile = value;
    }
}