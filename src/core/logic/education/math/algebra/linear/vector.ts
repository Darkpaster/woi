import {Matrix} from "./matrix.ts";
import {Point} from "../../../../../../utils/math/2d.ts";
import {RenderOptions} from "../../../../../../utils/math/graphics.ts";
import {CoordinateSystem} from "../../visualization/coordinateSystem.ts";

/**
 * Класс для векторов (как специальный случай матрицы)
 */
export class Vector extends Matrix {
    private isColumnVector: boolean;

    constructor(data: number[], isColumn: boolean = true, name: string = "v", description?: string) {
        // Преобразуем одномерный массив в двумерный для матрицы
        const matrixData = isColumn
            ? data.map(val => [val])  // Вектор-столбец: каждое значение в своей строке
            : [data];                 // Вектор-строка: все значения в одной строке

        super(matrixData, name, description);
        this.isColumnVector = isColumn;
    }

    getValues(): number[] {
        if (this.isColumnVector) {
            return Array(this.getRows()).fill(0).map((_, i) => this.get(i, 0));
        } else {
            return Array(this.getCols()).fill(0).map((_, j) => this.get(0, j));
        }
    }

    getSize(): number {
        return this.isColumnVector ? this.getRows() : this.getCols();
    }

    isColumn(): boolean {
        return this.isColumnVector;
    }

    dot(other: Vector): number {
        const thisValues = this.getValues();
        const otherValues = other.getValues();

        if (thisValues.length !== otherValues.length) {
            throw new Error('Vectors must have the same size for dot product');
        }

        return thisValues.reduce((sum, val, i) => sum + val * otherValues[i], 0);
    }

    norm(): number {
        const values = this.getValues();
        return Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
    }

    normalize(): Vector {
        const values = this.getValues();
        const norm = this.norm();

        if (norm === 0) {
            throw new Error('Cannot normalize zero vector');
        }

        const normalizedValues = values.map(val => val / norm);
        return new Vector(normalizedValues, this.isColumnVector, `${this.getName()}_normalized`);
    }

    // Переопределение рендера для векторов
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions): void {
        // Если хотим отрисовать вектор как стрелку в координатной системе
        const coordinateSystem = (options as any)?.coordinateSystem as CoordinateSystem;

        if (coordinateSystem && this.getSize() === 2) {
            // Отрисовка вектора как стрелки от начала координат
            const values = this.getValues();
            const origin = coordinateSystem.getOrigin();
            const scale = coordinateSystem.getScale();

            const startPoint = new Point(origin.x, origin.y);
            const endPoint = new Point(
                origin.x + values[0] * scale,
                origin.y - values[1] * scale  // Инвертируем Y для экранных координат
            );

            ctx.save();
            ctx.strokeStyle = options?.color || 'blue';
            ctx.lineWidth = options?.strokeWidth || 2;

            // Рисуем линию вектора
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();

            // Рисуем стрелку
            const arrowLength = 10;
            const arrowWidth = 5;

            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            const angle = Math.atan2(dy, dx);

            ctx.beginPath();
            ctx.moveTo(endPoint.x, endPoint.y);
            ctx.lineTo(
                endPoint.x - arrowLength * Math.cos(angle - Math.PI/6),
                endPoint.y - arrowLength * Math.sin(angle - Math.PI/6)
            );
            ctx.lineTo(
                endPoint.x - arrowLength * Math.cos(angle + Math.PI/6),
                endPoint.y - arrowLength * Math.sin(angle + Math.PI/6)
            );
            ctx.closePath();
            ctx.fillStyle = options?.color || 'blue';
            ctx.fill();

            // Добавляем метку, если нужно
            if (options?.showLabels && this.getName()) {
                ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
                ctx.fillText(this.getName(), endPoint.x + 5, endPoint.y + 5);
            }

            ctx.restore();
        } else {
            // Если нет системы координат или размерность не 2, отрисовываем как матрицу
            super.render(ctx, options);
        }
    }

    // Статические методы для создания специальных векторов
    static zero(size: number, isColumn: boolean = true, name: string = "0"): Vector {
        return new Vector(Array(size).fill(0), isColumn, name, "Zero vector");
    }

    static random(size: number, min: number = -10, max: number = 10, isColumn: boolean = true, name: string = "r"): Vector {
        const data = Array(size).fill(0).map(() => min + Math.random() * (max - min));
        return new Vector(data, isColumn, name, "Random vector");
    }

    static fromPoints(p1: Point, p2: Point, isColumn: boolean = true, name: string = "v"): Vector {
        return new Vector([p2.x - p1.x, p2.y - p1.y], isColumn, name, "Vector from points");
    }
}