import {Point} from "../../../../../utils/math/2d.ts";
import {RenderOptions, Visualizable} from "../../../../../utils/math/graphics.ts";
import {CoordinateSystem} from "../visualization/coordinateSystem.ts";
import {MathObject} from "../mathObject.ts";

export namespace Calculus {

    // ---- Функции и исчисление ----

    /**
     * Базовый класс для математических функций
     */
    export abstract class MathFunction extends MathObject implements Visualizable {
        constructor(name: string, description?: string) {
            super(name, description);
        }

        abstract evaluate(x: number): number;

        // Численное дифференцирование
        derivative(x: number, h: number = 0.0001): number {
            return (this.evaluate(x + h) - this.evaluate(x - h)) / (2 * h);
        }

        // Численное интегрирование (метод трапеций)
        integrate(a: number, b: number, steps: number = 1000): number {
            if (a > b) {
                [a, b] = [b, a];
                return -this.integrate(a, b, steps);
            }

            const dx = (b - a) / steps;
            let sum = 0.5 * (this.evaluate(a) + this.evaluate(b));

            for (let i = 1; i < steps; i++) {
                const x = a + i * dx;
                sum += this.evaluate(x);
            }

            return sum * dx;
        }

        // Визуализация функции на графике
        render(ctx: CanvasRenderingContext2D, options?: RenderOptions & {
            xMin?: number;
            xMax?: number;
            yMin?: number;
            yMax?: number;
            coordinateSystem?: CoordinateSystem;
            samples?: number;
        }): void {
            const coordinateSystem = options?.coordinateSystem;
            if (!coordinateSystem) {
                console.error('Coordinate system is required for function rendering');
                return;
            }

            const canvas = ctx.canvas;
            const origin = coordinateSystem.getOrigin();
            const scale = coordinateSystem.getScale();

            // Определяем границы отображения
            const xMin = options?.xMin ?? -Math.floor(origin.x / scale);
            const xMax = options?.xMax ?? Math.floor((canvas.width - origin.x) / scale);
            const samples = options?.samples ?? canvas.width;

            ctx.save();

            // Рисуем график функции
            ctx.beginPath();

            // Шаг по X в математических координатах
            const dx = (xMax - xMin) / samples;

            // Проходим по всем точкам от xMin до xMax
            let isFirstPoint = true;

            for (let i = 0; i <= samples; i++) {
                const x = xMin + i * dx;
                let y;

                try {
                    y = this.evaluate(x);

                    // Проверяем, что значение в пределах разумного диапазона
                    if (!isFinite(y) || isNaN(y)) {
                        // Если функция не определена в этой точке, прерываем линию
                        if (!isFirstPoint) {
                            ctx.stroke();
                            ctx.beginPath();
                            isFirstPoint = true;
                        }
                        continue;
                    }

                    // Преобразуем в экранные координаты
                    const screenPoint = coordinateSystem.toScreenCoordinates(new Point(x, y));

                    if (isFirstPoint) {
                        ctx.moveTo(screenPoint.x, screenPoint.y);
                        isFirstPoint = false;
                    } else {
                        ctx.lineTo(screenPoint.x, screenPoint.y);
                    }
                } catch (error) {
                    // Если возникла ошибка при вычислении, прерываем линию
                    if (!isFirstPoint) {
                        ctx.stroke();
                        ctx.beginPath();
                        isFirstPoint = true;
                    }
                }
            }

            ctx.strokeStyle = options?.color || 'blue';
            ctx.lineWidth = options?.strokeWidth || 2;
            ctx.stroke();

            // Добавляем метку, если нужно
            if (options?.showLabels && this.getName()) {
                ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
                ctx.fillStyle = options?.color || 'blue';

                // Находим хорошую позицию для метки (в середине видимой части графика)
                const midX = (xMin + xMax) / 2;
                let midY;
                try {
                    midY = this.evaluate(midX);
                    const screenMidPoint = coordinateSystem.toScreenCoordinates(new Point(midX, midY));

                    // Смещаем метку на несколько пикселей от графика
                    ctx.fillText(this.getName(), screenMidPoint.x + 5, screenMidPoint.y - 5);
                } catch (error) {
                    // Если не удалось вычислить значение в средней точке, размещаем метку в углу
                    ctx.fillText(this.getName(), origin.x + 10, origin.y - 10);
                }
            }

            ctx.restore();
        }
    }
}