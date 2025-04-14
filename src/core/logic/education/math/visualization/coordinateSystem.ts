import {Point} from "../../../../../utils/math/2d.ts";
import {RenderOptions} from "../../../../../utils/math/graphics.ts";

export class CoordinateSystem {
    private origin: Point;
    private scaleX: number;
    private scaleY: number;

    constructor(origin: Point = new Point(0, 0), scaleX: number = 1, scaleY: number = 1) {
        this.origin = origin;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }

    toScreenCoordinates(mathPoint: Point): Point {
        return new Point(
            this.origin.x + mathPoint.x * this.scaleX,
            this.origin.y - mathPoint.y * this.scaleY // Инвертируем Y для экранных координат
        );
    }

    toMathCoordinates(screenPoint: Point): Point {
        return new Point(
            (screenPoint.x - this.origin.x) / this.scaleX,
            (this.origin.y - screenPoint.y) / this.scaleY // Инвертируем Y для математических координат
        );
    }

    setOrigin(origin: Point): void {
        this.origin = origin;
    }

    setScale(scaleX: number, scaleY: number): void {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }

    getOrigin(): Point {
        return this.origin.clone();
    }

    getScale(): { scaleX: number, scaleY: number} {
        return { scaleX: this.scaleX, scaleY: this.scaleY };
    }

    /**
     * Отрисовка координатной системы
     * @param ctx Контекст рисования
     * @param options Настройки отображения
     */
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions): void {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        ctx.save();
        ctx.strokeStyle = options?.color || '#888';
        ctx.lineWidth = options?.strokeWidth || 1;

        // Отрисовка осей
        if (options?.showAxes) {
            ctx.beginPath();
            // X ось
            ctx.moveTo(0, this.origin.y);
            ctx.lineTo(canvasWidth, this.origin.y);
            // Y ось
            ctx.moveTo(this.origin.x, 0);
            ctx.lineTo(this.origin.x, canvasHeight);
            ctx.stroke();

            // Стрелки на осях
            ctx.beginPath();
            // X ось - стрелка
            ctx.moveTo(canvasWidth - 10, this.origin.y - 5);
            ctx.lineTo(canvasWidth, this.origin.y);
            ctx.lineTo(canvasWidth - 10, this.origin.y + 5);
            // Y ось - стрелка
            ctx.moveTo(this.origin.x - 5, 10);
            ctx.lineTo(this.origin.x, 0);
            ctx.lineTo(this.origin.x + 5, 10);
            ctx.stroke();

            // Метки на осях
            if (options?.showLabels) {
                ctx.fillStyle = options?.color || '#888';
                ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
                ctx.fillText('X', canvasWidth - 12, this.origin.y + 16);
                ctx.fillText('Y', this.origin.x + 6, 12);

                // Рисуем деления на осях с цифрами
                const gridSpacingX = this.scaleX;
                const gridSpacingY = this.scaleY;

                // Метки по оси X
                let xStart = Math.ceil(-this.origin.x / gridSpacingX);
                let xEnd = Math.floor((canvasWidth - this.origin.x) / gridSpacingX);

                for (let i = xStart; i <= xEnd; i++) {
                    if (i === 0) continue; // Пропускаем 0

                    const x = this.origin.x + i * gridSpacingX;
                    ctx.beginPath();
                    ctx.moveTo(x, this.origin.y - 5);
                    ctx.lineTo(x, this.origin.y + 5);
                    ctx.stroke();

                    ctx.fillText(i.toString(), x - 3, this.origin.y + 15);
                }

                // Метки по оси Y
                let yStart = Math.ceil(-this.origin.y / gridSpacingY);
                let yEnd = Math.floor((canvasHeight - this.origin.y) / gridSpacingY);

                for (let i = yStart; i <= yEnd; i++) {
                    if (i === 0) continue; // Пропускаем 0

                    const y = this.origin.y - i * gridSpacingY;
                    ctx.beginPath();
                    ctx.moveTo(this.origin.x - 5, y);
                    ctx.lineTo(this.origin.x + 5, y);
                    ctx.stroke();

                    ctx.fillText(i.toString(), this.origin.x - 20, y + 3);
                }
            }
        }

        // Отрисовка сетки
        if (options?.showGrid) {
            ctx.beginPath();
            ctx.setLineDash([1, 1]);
            ctx.strokeStyle = options?.gridColor || '#ddd';

            // Вертикальные линии сетки (параллельные оси Y)
            const xGridSpacing = this.scaleX;
            let xStart = Math.ceil(-this.origin.x / xGridSpacing);
            let xEnd = Math.floor((canvasWidth - this.origin.x) / xGridSpacing);

            for (let i = xStart; i <= xEnd; i++) {
                const x = this.origin.x + i * xGridSpacing;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasHeight);
            }

            // Горизонтальные линии сетки (параллельные оси X)
            const yGridSpacing = this.scaleY;
            let yStart = Math.ceil(-this.origin.y / yGridSpacing);
            let yEnd = Math.floor((canvasHeight - this.origin.y) / yGridSpacing);

            for (let i = yStart; i <= yEnd; i++) {
                const y = this.origin.y - i * yGridSpacing;
                ctx.moveTo(0, y);
                ctx.lineTo(canvasWidth, y);
            }

            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }

    /**
     * Панорамирование системы координат
     * @param dx Сдвиг по оси X
     * @param dy Сдвиг по оси Y
     */
    pan(dx: number, dy: number): void {
        this.origin.x += dx;
        this.origin.y += dy;
    }

    /**
     * Изменение масштаба с сохранением центра в точке (centerX, centerY)
     * @param factor Коэффициент масштабирования
     * @param centerX X-координата центра масштабирования
     * @param centerY Y-координата центра масштабирования
     */
    zoom(factor: number, centerX: number, centerY: number): void {
        // Преобразуем экранные координаты центра масштабирования в математические
        const mathCenter = this.toMathCoordinates(new Point(centerX, centerY));

        // Новые масштабы
        const newScaleX = this.scaleX * factor;
        const newScaleY = this.scaleY * factor;

        // Чтобы точка mathCenter осталась на месте, нужно обновить начало координат
        // Решаем уравнение: mathCenter * newScale + newOrigin = centerScreen
        const newOriginX = centerX - mathCenter.x * newScaleX;
        const newOriginY = centerY + mathCenter.y * newScaleY;

        // Обновляем масштаб и начало координат
        this.scaleX = newScaleX;
        this.scaleY = newScaleY;
        this.origin.x = newOriginX;
        this.origin.y = newOriginY;
    }
}
