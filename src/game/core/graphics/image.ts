import { settings } from "../config/settings.ts";
import { Delay, TimeDelay } from "../../../utils/general/time.ts";
import { graphics } from "../main.ts";
import { AnimationList } from "./static/animatedSprites.ts";
import { scaledTileSize } from "../../../utils/math/general.ts";

// Типы для направлений и состояний
export type Direction = "left" | "right" | "up" | "down";

// Интерфейс для размеров спрайта
interface SpriteSize {
    width: number;
    height: number;
}

// Интерфейс для конфигурации анимации
interface AnimationConfig {
    name: string;
    src: string;
    framesNumber?: number;
    framesRate?: number;
    imageSize?: number;
    disposable?: boolean;
    horizontalSheet?: boolean;
}

export class AnimatedImageManager {
    private readonly _list: AnimationList;
    private _isFlipped: boolean = false;
    private _currentAnimation: AnimatedImage;
    private readonly _flipX: boolean;
    private readonly _horizontalSheet: boolean;

    constructor(list: AnimationList, flipX: boolean = true, horizontalSheet: boolean = true) {
        this._list = list;
        this._flipX = flipX;
        this._horizontalSheet = horizontalSheet;

        // Устанавливаем анимацию по умолчанию
        this._currentAnimation = this._list["idle"] || this._list[Object.keys(this._list)[0]];

        if (!this._currentAnimation) {
            throw new Error("AnimationList не содержит анимаций");
        }

        // Устанавливаем менеджер для всех анимаций
        this._initializeAnimations();
    }

    private _initializeAnimations(): void {
        for (const key in this._list) {
            if (this._list.hasOwnProperty(key)) {
                this._list[key].manager = this;
            }
        }
    }

    get currentAnimation(): AnimatedImage {
        return this._currentAnimation;
    }

    get isFlipped(): boolean {
        return this._isFlipped;
    }

    get flipX(): boolean {
        return this._flipX;
    }

    get horizontalSheet(): boolean {
        return this._horizontalSheet;
    }

    /**
     * Рендерит анимацию
     * @param animationName - Имя анимации для рендеринга
     * @param ctx - Контекст канваса
     * @param x - Позиция X
     * @param y - Позиция Y
     * @param direction - Направление для отражения спрайта
     */
    render(animationName: string, ctx: CanvasRenderingContext2D, x: number, y: number, direction: Direction): void {
        const animation = this._list[animationName];

        if (!animation) {
            console.error(`Анимация "${animationName}" не найдена в AnimatedImageManager`);
            return;
        }

        const prevAnimation = this._currentAnimation;

        // Если предыдущая анимация одноразовая и не завершена, продолжаем её
        if (prevAnimation.disposable && !prevAnimation.endOfAnimation) {
            prevAnimation.render(ctx, this._isFlipped, x, y, direction);
            return;
        }

        // Рендерим новую анимацию
        this._isFlipped = animation.render(ctx, this._isFlipped, x, y, direction);

        // Сбрасываем кадр если сменилась анимация
        if (prevAnimation.name !== animation.name) {
            prevAnimation.reset();
        }

        this._currentAnimation = animation;
    }

    /**
     * Проверяет, существует ли анимация
     */
    hasAnimation(name: string): boolean {
        return name in this._list;
    }

    /**
     * Возвращает список доступных анимаций
     */
    getAnimationNames(): string[] {
        return Object.keys(this._list);
    }
}

export class AnimatedImage {
    private readonly _image: HTMLImageElement = new Image();
    private readonly _name: string;
    private readonly _framesNumber: number;
    private _currentFrame: number = 0;
    private readonly _framesRate: TimeDelay;
    private readonly _disposable: boolean;
    private readonly _imageSize: number;
    private _widthSize: number = 0;
    private _heightSize: number = 0;
    private _endOfAnimation: boolean = false;
    private _manager: AnimatedImageManager | undefined;
    private _prevScale: number = 0;
    private _isLoaded: boolean = false;

    constructor(config: AnimationConfig) {
        const {
            name,
            src,
            framesNumber = 3,
            framesRate = 5,
            imageSize = settings.tileSize,
            disposable = false
        } = config;

        this._name = name;
        this._framesNumber = framesNumber;
        this._disposable = disposable;
        this._imageSize = imageSize;
        this._framesRate = new TimeDelay(Math.floor(framesRate * settings.delay()));
        this._prevScale = settings.defaultTileScale;

        this._image.src = src;
        this._image.onload = () => {
            this._isLoaded = true;
            this._calculateSize();
        };

        this._image.onerror = () => {
            console.error(`Ошибка загрузки изображения: ${src}`);
        };
    }

    // Геттеры
    get image(): HTMLImageElement { return this._image; }
    get name(): string { return this._name; }
    get framesNumber(): number { return this._framesNumber; }
    get currentFrame(): number { return this._currentFrame; }
    get disposable(): boolean { return this._disposable; }
    get endOfAnimation(): boolean { return this._endOfAnimation; }
    get manager(): AnimatedImageManager | undefined { return this._manager; }
    get isLoaded(): boolean { return this._isLoaded; }
    get size(): SpriteSize { return { width: this._widthSize, height: this._heightSize }; }

    // Сеттеры
    set manager(value: AnimatedImageManager) { this._manager = value; }
    set currentFrame(value: number) { this._currentFrame = Math.max(0, Math.min(value, this._framesNumber - 1)); }

    /**
     * Вычисляет размеры спрайта на основе изображения
     */
    private _calculateSize(): void {
        if (!this._isLoaded) return;

        const frameWidth = this._image.width / this._framesNumber;
        const frameHeight = this._image.height;
        const scale = settings.defaultTileScale;

        this._widthSize = Math.floor((frameWidth / frameHeight * this._imageSize) * scale);
        this._heightSize = Math.floor((frameHeight / frameWidth * this._imageSize) * scale);
    }

    /**
     * Обновляет размеры при изменении масштаба
     */
    private _updateSizeIfNeeded(): void {
        if (this._prevScale !== settings.defaultTileScale) {
            this._calculateSize();
            this._prevScale = settings.defaultTileScale;
        }
    }

    /**
     * Сбрасывает анимацию в начальное состояние
     */
    reset(): void {
        this._currentFrame = 0;
        this._endOfAnimation = false;
    }

    /**
     * Переходит к следующему кадру
     */
    private _nextFrame(): void {
        this._currentFrame++;
        if (this._currentFrame >= this._framesNumber) {
            this._currentFrame = 0;
            if (this._disposable) {
                this._endOfAnimation = true;
            }
        }
    }

    /**
     * Рендерит анимацию
     */
    render(ctx: CanvasRenderingContext2D, isFlipped: boolean, x: number, y: number, direction: Direction): boolean {
        if (!this._isLoaded) return isFlipped;

        this._updateSizeIfNeeded();

        // Сбрасываем флаг окончания анимации
        if (this._endOfAnimation) {
            this._endOfAnimation = false;
        }

        // Определяем нужно ли отражать спрайт
        const shouldFlip = this._shouldFlipSprite(isFlipped, direction);

        // Рендерим спрайт
        this._renderSprite(ctx, shouldFlip, x, y);

        // Обновляем анимацию
        if (this._framesRate.timeIsUp()) {
            this._nextFrame();
        }

        return shouldFlip;
    }

    /**
     * Определяет, нужно ли отражать спрайт
     */
    private _shouldFlipSprite(isFlipped: boolean, direction: Direction): boolean {
        if (!this._manager?.flipX) return false;
        return direction === "left" || (isFlipped && direction !== "right");
    }

    /**
     * Рендерит спрайт на канвасе
     */
    private _renderSprite(ctx: CanvasRenderingContext2D, flipX: boolean, x: number, y: number): void {
        const spriteWidth = this._image.width / this._framesNumber;
        const spriteHeight = this._image.height;
        const cutX = this._currentFrame * spriteWidth;
        const cutY = 0;

        if (flipX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
                this._image,
                cutX, cutY, spriteWidth, spriteHeight,
                -x - this._widthSize, y, this._widthSize, this._heightSize
            );
            ctx.restore();
        } else {
            ctx.drawImage(
                this._image,
                cutX, cutY, spriteWidth, spriteHeight,
                x, y, this._widthSize, this._heightSize
            );
        }
    }
}

export class AnimatedEffect {
    private readonly _image: HTMLImageElement = new Image();
    private readonly _name: string;
    private readonly _framesNumber: number;
    private readonly _framesRate: Delay;
    private _currentFrame: number = 0;
    private _x: number = 0;
    private _y: number = 0;
    private _isLoaded: boolean = false;

    constructor(src: string, framesNumber: number, framesRate: number = 200, name: string = "effect") {
        this._name = name;
        this._framesNumber = framesNumber;
        this._framesRate = new Delay(Math.floor(framesRate / settings.delay()));

        this._image.src = src;
        this._image.onload = () => {
            this._isLoaded = true;
        };

        this._image.onerror = () => {
            console.error(`Ошибка загрузки эффекта: ${src}`);
        };
    }

    get image(): HTMLImageElement { return this._image; }
    get name(): string { return this._name; }
    get isLoaded(): boolean { return this._isLoaded; }
    get position(): { x: number; y: number } { return { x: this._x, y: this._y }; }

    /**
     * Создает эффект в указанной позиции
     */
    public create(x: number, y: number): void {
        this._x = x;
        this._y = y;
        this._currentFrame = 0;
        graphics?.effectList.push(this);
    }

    /**
     * Рендерит эффект
     * @returns true если анимация завершена
     */
    public render(ctx: CanvasRenderingContext2D): boolean {
        if (!this._isLoaded) return false;

        const spriteWidth = this._image.width / this._framesNumber;
        const spriteHeight = this._image.height;
        const cutX = this._currentFrame * spriteWidth;
        const size = scaledTileSize();

        ctx.drawImage(
            this._image,
            cutX, 0, spriteWidth, spriteHeight,
            this._x, this._y, size, size
        );

        if (this._framesRate.timeIsUp()) {
            this._currentFrame++;
            if (this._currentFrame >= this._framesNumber) {
                return true; // Анимация завершена
            }
        }

        return false;
    }

    /**
     * Сбрасывает эффект
     */
    reset(): void {
        this._currentFrame = 0;
    }
}

export class StaticImage extends Image {
    private readonly _src: string;

    constructor(src: string) {
        super();
        this._src = src;
        this.src = src;
    }

    get imageSrc(): string {
        return this._src;
    }
}

export class TileImage {
    private _tile: ImageBitmap | null = null;
    private _isLoaded: boolean = false;
    private readonly _src: string;
    private readonly _tileX: number;
    private readonly _tileY: number;
    private readonly _tileSize: number;

    constructor(
        src: string,
        tileX: number,
        tileY: number,
        resolver?: (value: any) => void,
        tileSize: number = settings.tileSize
    ) {
        this._src = src;
        this._tileX = tileX;
        this._tileY = tileY;
        this._tileSize = tileSize;

        this._loadTile(resolver);
    }

    private async _loadTile(resolver?: (value: any) => void): Promise<void> {
        try {
            const image = new Image();
            image.src = this._src;

            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () => reject(new Error(`Failed to load image: ${this._src}`));
            });

            const bitmap = await createImageBitmap(
                image,
                this._tileX * this._tileSize,
                this._tileY * this._tileSize,
                this._tileSize,
                this._tileSize
            );

            this._tile = bitmap;
            this._isLoaded = true;

            resolver?.("loaded");
        } catch (error) {
            console.error("Ошибка создания ImageBitmap:", error);
        }
    }

    get tile(): ImageBitmap | null {
        return this._tile;
    }

    get isLoaded(): boolean {
        return this._isLoaded;
    }

    get src(): string {
        return this._src;
    }

    get coordinates(): { x: number; y: number } {
        return { x: this._tileX, y: this._tileY };
    }

    /**
     * Освобождает ресурсы
     */
    dispose(): void {
        if (this._tile) {
            this._tile.close();
            this._tile = null;
            this._isLoaded = false;
        }
    }
}