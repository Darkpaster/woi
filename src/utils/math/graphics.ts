import {CoordinateSystem} from "../../core/logic/education/math/visualization/coordinateSystem.ts";
import {Point} from "./2d.ts";
import {VisualizationOptions} from "../../core/logic/education/music/visualization/visualizer.ts";

export class AnimatedPoint extends Point implements Animatable {
    private targetX: number;
    private targetY: number;
    private speed: number;
    private completed: boolean = false;

    constructor(x: number, y: number, targetX: number, targetY: number, speed: number = 1, name: string = "", description?: string) {
        super(x, y, name, description);
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
    }

    animate(deltaTime: number): void {
        if (this.completed) return;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.1) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.completed = true;
            return;
        }

        const moveDistance = Math.min(this.speed * deltaTime, distance);
        const ratio = moveDistance / distance;

        this.x += dx * ratio;
        this.y += dy * ratio;
    }

    isAnimationComplete(): boolean {
        return this.completed;
    }

    setTarget(x: number, y: number): void {
        this.targetX = x;
        this.targetY = y;
        this.completed = false;
    }
}

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
    strokeStyle?: string;
    lineWidth?: number;
    gridColor?: string;
    coordinateSystem?: CoordinateSystem;
    radius?: number;
}

export const DEFAULT_VISUALIZATION_OPTIONS: VisualizationOptions = {
    width: 800,
    height: 800,
    backgroundColor: '#282c34',
    foregroundColor: '#61dafb',
    fontFamily: 'Arial, sans-serif',
    fontSize: 12
};

export interface VisualizationOptions {
    width: number;
    height: number;
    backgroundColor: string;
    foregroundColor: string;
    fontFamily: string;
    fontSize: number;
}

/**
 * Интерфейс для объектов, требующих вычислений
 */
export interface Computable<T> {
    compute(): T;
}