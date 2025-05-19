import {Point, Vector2D} from "../../../../../../../utils/math/2d.ts";
import {RenderOptions} from "../../../../../../../utils/math/graphics.ts";
import {Calculus} from "../calculus.ts";
import MathFunction = Calculus.MathFunction;
import {CoordinateSystem} from "../../visualization/coordinateSystem.ts";

/**
 * Класс для численного дифференцирования
 */
export class Differential {
    // Численное дифференцирование функции
    static derivative(
        func: (x: number) => number,
        x: number,
        h: number = 0.0001,
        method: 'central' | 'forward' | 'backward' = 'central'
    ): number {
        switch (method) {
            case 'central':
                return (func(x + h) - func(x - h)) / (2 * h);
            case 'forward':
                return (func(x + h) - func(x)) / h;
            case 'backward':
                return (func(x) - func(x - h)) / h;
            default:
                throw new Error('Unknown differentiation method');
        }
    }

    // Вторая производная
    static secondDerivative(func: (x: number) => number, x: number, h: number = 0.0001): number {
        return (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);
    }

    // Частная производная функции двух переменных
    static partialDerivative(
        func: (x: number, y: number) => number,
        x: number,
        y: number,
        variable: 'x' | 'y',
        h: number = 0.0001
    ): number {
        if (variable === 'x') {
            return (func(x + h, y) - func(x - h, y)) / (2 * h);
        } else {
            return (func(x, y + h) - func(x, y - h)) / (2 * h);
        }
    }

    // Градиент функции (для функций двух переменных)
    static gradient(
        func: (x: number, y: number) => number,
        x: number,
        y: number,
        h: number = 0.0001
    ): Vector2D {
        const dx = Differential.partialDerivative(func, x, y, 'x', h);
        const dy = Differential.partialDerivative(func, x, y, 'y', h);

        return new Vector2D(dx, dy);
    }

    // Визуализация производной функции
    static renderDerivativeVisualization(
        ctx: CanvasRenderingContext2D,
        func: MathFunction,
        options?: RenderOptions & {
            xMin?: number;
            xMax?: number;
            coordinateSystem?: CoordinateSystem;
            samples?: number;
            showTangentAt?: number[];
        }
    ): void {
        const coordinateSystem = options?.coordinateSystem;
        if (!coordinateSystem) {
            console.error('Coordinate system is required for derivative visualization');
            return;
        }

        // Рисуем саму функцию
        func.render(ctx, options);

        // Если указаны точки для отображения касательных
        if (options?.showTangentAt && options.showTangentAt.length > 0) {
            ctx.save();
            ctx.strokeStyle = options.color || 'red';
            ctx.lineWidth = options.strokeWidth || 1;

            for (const x0 of options.showTangentAt) {
                try {
                    // Вычисляем значение функции и её производной в точке x0
                    const y0 = func.evaluate(x0);
                    const derivative = func.derivative(x0);

                    // Координаты точки на графике
                    const point = coordinateSystem.toScreenCoordinates(new Point(x0, y0));

                    // Рисуем точку касания
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = options.color || 'red';
                    ctx.fill();

                    // Рисуем касательную
                    // Определяем длину линии касательной
                    const tangentLength = 2 * (options.xMax - options.xMin) / 10;

                    // Вычисляем точки для касательной в математических координатах
                    const x1 = x0 - tangentLength / 2;
                    const y1 = y0 - derivative * tangentLength / 2;
                    const x2 = x0 + tangentLength / 2;
                    const y2 = y0 + derivative * tangentLength / 2;

                    // Преобразуем в экранные координаты
                    const point1 = coordinateSystem.toScreenCoordinates(new Point(x1, y1));
                    const point2 = coordinateSystem.toScreenCoordinates(new Point(x2, y2));

                    // Рисуем линию касательной
                    ctx.beginPath();
                    ctx.moveTo(point1.x, point1.y);
                    ctx.lineTo(point2.x, point2.y);
                    ctx.stroke();

                    // Добавляем метку со значением производной, если нужно
                    if (options.showLabels) {
                        ctx.font = `${options.fontSize || 12}px ${options.fontFamily || 'Arial'}`;
                        ctx.fillText(`f'(${x0.toFixed(2)}) = ${derivative.toFixed(2)}`, point.x + 10, point.y - 10);
                    }
                } catch (error) {
                    console.error(`Could not draw tangent at x = ${x0}:`, error);
                }
            }

            ctx.restore();
        }
    }
}