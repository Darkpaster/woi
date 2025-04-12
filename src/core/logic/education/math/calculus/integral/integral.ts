import {Point} from "../../../../../../utils/math/2d.ts";
import {RenderOptions} from "../../../../../../utils/math/graphics.ts";
import {CoordinateSystem} from "../../visualization/coordinateSystem.ts";
import {Calculus} from "../calculus.ts";
import MathFunction = Calculus.MathFunction;

/**
 * Класс для численного интегрирования
 */
export class Integral {
    // Численное интегрирование методом прямоугольников
    static rectangleMethod(
        func: (x: number) => number,
        a: number,
        b: number,
        n: number = 1000,
        type: 'left' | 'right' | 'midpoint' = 'midpoint'
    ): number {
        if (a > b) {
            [a, b] = [b, a];
            return -Integral.rectangleMethod(func, a, b, n, type);
        }

        const dx = (b - a) / n;
        let sum = 0;

        for (let i = 0; i < n; i++) {
            let x: number;

            switch (type) {
                case 'left':
                    x = a + i * dx;
                    break;
                case 'right':
                    x = a + (i + 1) * dx;
                    break;
                case 'midpoint':
                    x = a + (i + 0.5) * dx;
                    break;
                default:
                    throw new Error('Unknown rectangle method type');
            }

            sum += func(x);
        }

        return sum * dx;
    }

    // Численное интегрирование методом трапеций
    static trapezoidMethod(func: (x: number) => number, a: number, b: number, n: number = 1000): number {
        if (a > b) {
            [a, b] = [b, a];
            return -Integral.trapezoidMethod(func, a, b, n);
        }

        const dx = (b - a) / n;
        let sum = 0.5 * (func(a) + func(b));

        for (let i = 1; i < n; i++) {
            const x = a + i * dx;
            sum += func(x);
        }

        return sum * dx;
    }

    // Численное интегрирование методом Симпсона
    static simpsonMethod(func: (x: number) => number, a: number, b: number, n: number = 1000): number {
        if (a > b) {
            [a, b] = [b, a];
            return -Integral.simpsonMethod(func, a, b, n);
        }

        // Для метода Симпсона нужно четное количество интервалов
        if (n % 2 === 1) {
            n += 1;
        }

        const dx = (b - a) / n;
        let sum = func(a) + func(b);

        for (let i = 1; i < n; i++) {
            const x = a + i * dx;
            const coefficient = i % 2 === 0 ? 2 : 4;
            sum += coefficient * func(x);
        }

        return sum * dx / 3;
    }

    // Адаптивное интегрирование (метод Гаусса-Кронрода)
    static adaptiveIntegration(
        func: (x: number) => number,
        a: number,
        b: number,
        tolerance: number = 1e-6,
        maxDepth: number = 20
    ): number {
        // Рекурсивная функция для адаптивного интегрирования
        function adaptiveStep(a: number, b: number, fa: number, fb: number, depth: number): number {
            const mid = (a + b) / 2;
            const fmid = func(mid);

            // Оценка с помощью метода трапеций
            const trapArea = (b - a) * (fa + fb) / 2;

            // Оценка с помощью метода Симпсона
            const simpArea = (b - a) * (fa + 4 * fmid + fb) / 6;

            // Оценка ошибки
            const error = Math.abs(trapArea - simpArea);

            if (depth >= maxDepth || error < tolerance * (b - a)) {
                return simpArea;
            }

            // Рекурсивно интегрируем левую и правую половины
            const leftArea = adaptiveStep(a, mid, fa, fmid, depth + 1);
            const rightArea = adaptiveStep(mid, b, fmid, fb, depth + 1);

            return leftArea + rightArea;
        }

        if (a > b) {
            [a, b] = [b, a];
            return -Integral.adaptiveIntegration(func, a, b, tolerance, maxDepth);
        }

        return adaptiveStep(a, b, func(a), func(b), 0);
    }

    // Метод Монте-Карло для интегрирования
    static monteCarloIntegration(
        func: (x: number) => number,
        a: number,
        b: number,
        numSamples: number = 10000
    ): number {
        if (a > b) {
            [a, b] = [b, a];
            return -Integral.monteCarloIntegration(func, a, b, numSamples);
        }

        // Находим примерные границы функции на интервале
        let yMin = Infinity;
        let yMax = -Infinity;

        const samplePoints = 100;
        for (let i = 0; i <= samplePoints; i++) {
            const x = a + (b - a) * i / samplePoints;
            const y = func(x);

            if (isFinite(y) && !isNaN(y)) {
                yMin = Math.min(yMin, y);
                yMax = Math.max(yMax, y);
            }
        }

        // Добавляем некоторый запас к границам
        const margin = 0.1 * (yMax - yMin);
        yMin -= margin;
        yMax += margin;

        // Метод Монте-Карло для оценки интеграла
        let pointsUnderCurve = 0;

        for (let i = 0; i < numSamples; i++) {
            // Случайная точка в прямоугольнике [a,b] x [yMin,yMax]
            const x = a + Math.random() * (b - a);
            const y = yMin + Math.random() * (yMax - yMin);

            // Если точка под кривой (и над оси X для положительных значений функции)
            // или над кривой (и под осью X для отрицательных значений)
            const fValue = func(x);

            if ((y >= 0 && y <= fValue) || (y <= 0 && y >= fValue)) {
                pointsUnderCurve += 1;
            }
        }

        // Площадь прямоугольника * доля точек под кривой
        const rectangleArea = (b - a) * (yMax - yMin);
        return rectangleArea * (pointsUnderCurve / numSamples);
    }

    // Визуализация интеграла
    static renderIntegralVisualization(
        ctx: CanvasRenderingContext2D,
        func: MathFunction,
        a: number,
        b: number,
        options?: RenderOptions & {
            coordinateSystem?: CoordinateSystem;
            method?: 'rectangle' | 'trapezoid' | 'simpson';
            rectangleType?: 'left' | 'right' | 'midpoint';
            segments?: number;
            fillStyle?: string;
        }
    ): void {
        const coordinateSystem = options?.coordinateSystem;
        if (!coordinateSystem) {
            console.error('Coordinate system is required for integral visualization');
            return;
        }

        const method = options?.method || 'rectangle';
        const segments = options?.segments || 10;
        const rectangleType = options?.rectangleType || 'midpoint';

        // Рисуем саму функцию
        func.render(ctx, {
            ...options,
            color: options?.color || 'blue'
        });

        ctx.save();

        // Рисуем закрашенную область под кривой
        if (method === 'rectangle') {
            const dx = (b - a) / segments;

            // Рисуем прямоугольники
            for (let i = 0; i < segments; i++) {
                let x: number;

                switch (rectangleType) {
                    case 'left':
                        x = a + i * dx;
                        break;
                    case 'right':
                        x = a + (i + 1) * dx;
                        break;
                    case 'midpoint':
                        x = a + (i + 0.5) * dx;
                        break;
                    default:
                        throw new Error('Unknown rectangle method type');
                }

                let y: number;
                try {
                    y = func.evaluate(x);
                } catch (error) {
                    continue; // Пропускаем, если функция не определена в этой точке
                }

                // Преобразуем в экранные координаты
                const startPoint = coordinateSystem.toScreenCoordinates(new Point(a + i * dx, 0));
                const endPoint = coordinateSystem.toScreenCoordinates(new Point(a + (i + 1) * dx, 0));
                const funcPoint = coordinateSystem.toScreenCoordinates(new Point(x, y));
                const zeroPoint = coordinateSystem.toScreenCoordinates(new Point(x, 0));

                // Рисуем прямоугольник
                ctx.beginPath();
                ctx.rect(
                    startPoint.x,
                    y >= 0 ? funcPoint.y : zeroPoint.y,
                    endPoint.x - startPoint.x,
                    Math.abs(zeroPoint.y - funcPoint.y)
                );
                ctx.fillStyle = options?.fillStyle || 'rgba(0, 0, 255, 0.3)';
                ctx.fill();
                ctx.strokeStyle = options?.color || 'rgba(0, 0, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        } else if (method === 'trapezoid') {
            const dx = (b - a) / segments;

            for (let i = 0; i < segments; i++) {
                const x1 = a + i * dx;
                const x2 = a + (i + 1) * dx;

                let y1: number, y2: number;
                try {
                    y1 = func.evaluate(x1);
                    y2 = func.evaluate(x2);
                } catch (error) {
                    continue; // Пропускаем, если функция не определена в этих точках
                }

                // Преобразуем в экранные координаты
                const point1 = coordinateSystem.toScreenCoordinates(new Point(x1, y1));
                const point2 = coordinateSystem.toScreenCoordinates(new Point(x2, y2));
                const zero1 = coordinateSystem.toScreenCoordinates(new Point(x1, 0));
                const zero2 = coordinateSystem.toScreenCoordinates(new Point(x2, 0));

                // Рисуем трапецию
                ctx.beginPath();
                ctx.moveTo(zero1.x, zero1.y);
                ctx.lineTo(point1.x, point1.y);
                ctx.lineTo(point2.x, point2.y);
                ctx.lineTo(zero2.x, zero2.y);
                ctx.closePath();

                ctx.fillStyle = options?.fillStyle || 'rgba(0, 0, 255, 0.3)';
                ctx.fill();
                ctx.strokeStyle = options?.color || 'rgba(0, 0, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        } else if (method === 'simpson') {
            // Для метода Симпсона рисуем параболические сегменты
            // (В качестве упрощения, просто рисуем с большим количеством точек)
            const dx = (b - a) / segments;
            const subSegments = 10; // Количество подсегментов для плавной отрисовки

            for (let i = 0; i < segments; i += 2) {
                if (i + 2 > segments) break;

                const x0 = a + i * dx;
                const x1 = a + (i + 1) * dx;
                const x2 = a + (i + 2) * dx;

                let y0: number, y1: number, y2: number;
                try {
                    y0 = func.evaluate(x0);
                    y1 = func.evaluate(x1);
                    y2 = func.evaluate(x2);
                } catch (error) {
                    continue; // Пропускаем, если функция не определена в этих точках
                }

                // Рисуем заполненный сегмент с использованием нескольких подсегментов
                ctx.beginPath();

                const zero0 = coordinateSystem.toScreenCoordinates(new Point(x0, 0));
                ctx.moveTo(zero0.x, zero0.y);

                const point0 = coordinateSystem.toScreenCoordinates(new Point(x0, y0));
                ctx.lineTo(point0.x, point0.y);

                // Рисуем кривую с помощью нескольких точек
                for (let j = 1; j <= 2 * subSegments; j++) {
                    const t = j / (2 * subSegments);
                    const x = x0 + t * 2 * dx;

                    // Интерполяция с помощью квадратичной формулы Лагранжа
                    const L0 = (x - x1) * (x - x2) / ((x0 - x1) * (x0 - x2));
                    const L1 = (x - x0) * (x - x2) / ((x1 - x0) * (x1 - x2));
                    const L2 = (x - x0) * (x - x1) / ((x2 - x0) * (x2 - x1));

                    const y = y0 * L0 + y1 * L1 + y2 * L2;
                    const point = coordinateSystem.toScreenCoordinates(new Point(x, y));

                    ctx.lineTo(point.x, point.y);
                }

                const zero2 = coordinateSystem.toScreenCoordinates(new Point(x2, 0));
                ctx.lineTo(zero2.x, zero2.y);
                ctx.closePath();

                ctx.fillStyle = options?.fillStyle || 'rgba(0, 0, 255, 0.3)';
                ctx.fill();
                ctx.strokeStyle = options?.color || 'rgba(0, 0, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Добавляем метку со значением интеграла, если нужно
        if (options?.showLabels) {
            let integralValue: number;

            try {
                switch (method) {
                    case 'rectangle':
                        integralValue = Integral.rectangleMethod(
                            x => func.evaluate(x),
                            a,
                            b,
                            segments,
                            rectangleType
                        );
                        break;
                    case 'trapezoid':
                        integralValue = Integral.trapezoidMethod(x => func.evaluate(x), a, b, segments);
                        break;
                    case 'simpson':
                        integralValue = Integral.simpsonMethod(x => func.evaluate(x), a, b, segments);
                        break;
                    default:
                        integralValue = Integral.trapezoidMethod(x => func.evaluate(x), a, b, segments);
                }

                ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
                ctx.fillStyle = options?.color || 'black';

                // Размещаем метку над областью интегрирования
                const midX = (a + b) / 2;
                try {
                    const midY = func.evaluate(midX);
                    const screenMidPoint = coordinateSystem.toScreenCoordinates(new Point(midX, midY));

                    ctx.fillText(
                        `∫(${a.toFixed(1)},${b.toFixed(1)}) = ${integralValue.toFixed(3)}`,
                        screenMidPoint.x - 40,
                        screenMidPoint.y - 15
                    );
                } catch (error) {
                    // Если не удалось вычислить значение в средней точке, размещаем метку в другом месте
                    const origin = coordinateSystem.getOrigin();
                    ctx.fillText(
                        `∫(${a.toFixed(1)},${b.toFixed(1)}) = ${integralValue.toFixed(3)}`,
                        origin.x + 10,
                        origin.y - 20
                    );
                }
            } catch (error) {
                console.error('Error calculating integral for label:', error);
            }
        }

        ctx.restore();
    }
}