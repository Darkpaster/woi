/**
 * Интерфейс для всех математических объектов, которые можно визуализировать
 */
export interface Visualizable {
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions): void;
}

/**
 * Интерфейс для объектов, поддерживающих анимацию
 */
export interface Animatable {
    animate(deltaTime: number): void;
    isAnimationComplete(): boolean;
}

/**
 * Опции для отрисовки
 */
export interface RenderOptions {
    color?: string;
    strokeWidth?: number;
    fillStyle?: string;
    fontSize?: number;
    fontFamily?: string;
    showLabels?: boolean;
    showAxes?: boolean;
    showGrid?: boolean;
    // Другие опции визуализации
}

/**
 * Интерфейс для объектов, требующих вычислений
 */
export interface Computable<T> {
    compute(): T;
}