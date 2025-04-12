import {CoordinateSystem} from "./coordinateSystem.ts";
import {MathObject} from "../mathObject.ts";
import {Point} from "../../../../../utils/math/2d.ts";

/**
 * Класс для управления визуализацией на холсте
 */
export class MathCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private coordinateSystem: CoordinateSystem;
    private objects: (MathObject & Visualizable)[] = [];
    private animatingObjects: (MathObject & Visualizable & Animatable)[] = [];
    private isAnimating: boolean = false;
    private lastFrameTime: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = context;

        // По умолчанию, начало координат - в центре холста
        this.coordinateSystem = new CoordinateSystem(
            new Point(canvas.width / 2, canvas.height / 2),
            40 // Масштаб по умолчанию
        );
    }

    addObject(object: MathObject & Visualizable): void {
        this.objects.push(object);
        if ('animate' in object && typeof (object as any).animate === 'function') {
            this.animatingObjects.push(object as MathObject & Visualizable & Animatable);
        }
    }

    removeObject(id: string): void {
        this.objects = this.objects.filter(obj => obj.getId() !== id);
        this.animatingObjects = this.animatingObjects.filter(obj => obj.getId() !== id);
    }

    clearObjects(): void {
        this.objects = [];
        this.animatingObjects = [];
    }

    render(options?: RenderOptions): void {
        // Очистка холста
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Отрисовка осей и сетки, если нужно
        if (options?.showAxes || options?.showGrid) {
            this.drawCoordinateSystem(options);
        }

        // Отрисовка всех объектов
        for (const obj of this.objects) {
            obj.render(this.ctx, options);
        }
    }

    private drawCoordinateSystem(options?: RenderOptions): void {
        const origin = this.coordinateSystem.getOrigin();
        const scale = this.coordinateSystem.getScale();

        this.ctx.save();
        this.ctx.strokeStyle = options?.color || '#888';
        this.ctx.lineWidth = options?.strokeWidth || 1;

        // Оси
        if (options?.showAxes) {
            this.ctx.beginPath();
            // X ось
            this.ctx.moveTo(0, origin.y);
            this.ctx.lineTo(this.canvas.width, origin.y);
            // Y ось
            this.ctx.moveTo(origin.x, 0);
            this.ctx.lineTo(origin.x, this.canvas.height);
            this.ctx.stroke();

            // Стрелки на осях
            this.ctx.beginPath();
            // X ось - стрелка
            this.ctx.moveTo(this.canvas.width - 10, origin.y - 5);
            this.ctx.lineTo(this.canvas.width, origin.y);
            this.ctx.lineTo(this.canvas.width - 10, origin.y + 5);
            // Y ось - стрелка
            this.ctx.moveTo(origin.x - 5, 10);
            this.ctx.lineTo(origin.x, 0);
            this.ctx.lineTo(origin.x + 5, 10);
            this.ctx.stroke();

            // Подписи осей
            if (options?.showLabels) {
                this.ctx.fillStyle = options?.color || '#888';
                this.ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
                this.ctx.fillText('X', this.canvas.width - 12, origin.y + 16);
                this.ctx.fillText('Y', origin.x + 6, 12);
            }
        }

        // Сетка
        if (options?.showGrid) {
            this.ctx.beginPath();
            this.ctx.setLineDash([1, 1]);

            // Вертикальные линии сетки
            const xStart = origin.x % scale;
            for (let x = xStart; x < this.canvas.width; x += scale) {
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
            }

            // Горизонтальные линии сетки
            const yStart = origin.y % scale;
            for (let y = yStart; y < this.canvas.height; y += scale) {
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
            }

            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        this.ctx.restore();
    }

    startAnimation(): void {
        if (!this.isAnimating && this.animatingObjects.length > 0) {
            this.isAnimating = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame(this.animationFrame.bind(this));
        }
    }

    stopAnimation(): void {
        this.isAnimating = false;
    }

    private animationFrame(timestamp: number): void {
        if (!this.isAnimating) return;

        const deltaTime = (timestamp - this.lastFrameTime) / 1000; // в секундах
        this.lastFrameTime = timestamp;

        let hasActiveAnimations = false;

        // Обновляем состояние всех анимируемых объектов
        for (const obj of this.animatingObjects) {
            obj.animate(deltaTime);
            if (!obj.isAnimationComplete()) {
                hasActiveAnimations = true;
            }
        }

        // Перерисовываем сцену
        this.render();

        // Продолжаем анимацию, если есть активные анимации
        if (hasActiveAnimations) {
            requestAnimationFrame(this.animationFrame.bind(this));
        } else {
            this.isAnimating = false;
        }
    }

    getCoordinateSystem(): CoordinateSystem {
        return this.coordinateSystem;
    }

    setCoordinateSystem(coordSystem: CoordinateSystem): void {
        this.coordinateSystem = coordSystem;
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }
}