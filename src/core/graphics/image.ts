import { settings } from "../config/settings.ts";
import { scaledTileSize } from "../../utils/math.ts";
import {Delay, TimeDelay} from "../../utils/time.ts";
import {graphics} from "../main.ts";
import {AnimationList} from "./static/animatedSprites.ts";

export class AnimatedImageManager {
    list: AnimationList;
    isFlipped: boolean;
    currentAnimation: AnimatedImage;
    flipX: boolean;
    horizontalSheet: boolean;

    constructor(list: AnimationList, flipX: boolean = true, horizontalSheet: boolean = true) {
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
        const current: AnimatedImage = this.list[sheet];
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

export class AnimatedImage {
    get image(): HTMLImageElement {
        return this._image;
    }

    get manager(): AnimatedImageManager | undefined{
        return this._manager;
    }

    set manager(value: AnimatedImageManager) {
        this._manager = value;
    }

    private readonly _image: HTMLImageElement = new Image();
    name: string;
    framesNumber: number;
    currentFrame: number;
    framesRate: TimeDelay;
    disposable: boolean;
    imageSize: number;
    widthSize: number = 0;
    heightSize: number = 0;
    endOfAnimation: boolean;
    private _manager: AnimatedImageManager | undefined;

    prevSize: number = 0;

    // private updateSize: () => void | null = null;

    constructor(name: string, src: string, framesNumber: number = 3, framesRate: number = 5,
                imageSize: number = settings.tileSize, disposable: boolean = false) {
        this.image.src = src;
        this.name = name;
        this.framesNumber = framesNumber;
        this.currentFrame = 0;
        this.framesRate = new TimeDelay(Math.floor(framesRate * settings.delay()));
        this.disposable = disposable;
        this.endOfAnimation = false;
        this.imageSize = imageSize;
        this.prevSize = settings.defaultTileScale;
        this.image.onload = () => {
            this.widthSize = Math.floor(((this.image.width / framesNumber) / (this.image.height) * imageSize) * settings.defaultTileScale);
            this.heightSize = Math.floor(((this.image.height) / (this.image.width / framesNumber) * imageSize) * settings.defaultTileScale);
        }
    }

    public update() {
        this.widthSize = Math.floor(((this.image.width / this.framesNumber) / (this.image.height) * this.imageSize) * settings.defaultTileScale);
        this.heightSize = Math.floor(((this.image.height) / (this.image.width / this.framesNumber) * this.imageSize) * settings.defaultTileScale);
    }

    render(ctx: CanvasRenderingContext2D, isFlipped: boolean, x: number, y: number, direction: string): boolean {
        if (this.prevSize !== settings.defaultTileScale) {
            this.update();
            this.prevSize = settings.defaultTileScale;
        }

        if (!this.manager!.flipX) {
            isFlipped = false;
        }
        if (this.endOfAnimation) {
            this.endOfAnimation = false;
        }
        let spriteWidth = this.image.width / this.framesNumber;
        let spriteHeight = this.image.height;
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
            ctx.drawImage(this.image, cutX, cutY, spriteWidth,
                spriteHeight, -x - this.widthSize, y,
                this.widthSize, this.heightSize);
            ctx.restore();
        } else {
            ctx.drawImage(this.image, cutX, cutY, spriteWidth,
                spriteHeight, x, y, this.widthSize,
                this.heightSize);
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

export class AnimatedEffect {
    get image(): HTMLImageElement {
        return this._image;
    }
    name: string
    framesNumber: number
    framesRate: Delay
    currentFrame: number
    ax: number = 0;
    ay: number = 0;
    private readonly _image: HTMLImageElement = new Image();

    constructor(src: string, framesNumber: number, framesRate = 200) {
        this.name = "name";
        this._image.src = src;
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
        let spriteWidth = this.image.width / this.framesNumber;
        let spriteHeight = this.image.height;
        let cutX = this.currentFrame * spriteWidth;
        let cutY = 0;
        ctx.drawImage(this.image, cutX, cutY, spriteWidth,
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

    private _tile: ImageBitmap | null = null;

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