export interface Vector2D {
    x: number;
    y: number;
}

export class Vector {
    /**
     * Сложение двух векторов
     */
    static add(v1: Vector2D, v2: Vector2D): Vector2D {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y
        };
    }

    /**
     * Вычитание векторов (v1 - v2)
     */
    static subtract(v1: Vector2D, v2: Vector2D): Vector2D {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y
        };
    }

    /**
     * Умножение вектора на скаляр
     */
    static multiply(v: Vector2D, scalar: number): Vector2D {
        return {
            x: v.x * scalar,
            y: v.y * scalar
        };
    }

    /**
     * Деление вектора на скаляр
     */
    static divide(v: Vector2D, scalar: number): Vector2D {
        if (scalar === 0) {
            throw new Error("Деление на ноль");
        }
        return {
            x: v.x / scalar,
            y: v.y / scalar
        };
    }

    /**
     * Вычисление длины (модуля) вектора
     */
    static magnitude(v: Vector2D): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    /**
     * Нормализация вектора (получение единичного вектора)
     */
    static normalize(v: Vector2D): Vector2D {
        const mag = this.magnitude(v);
        if (mag === 0) {
            return { x: 0, y: 0 };
        }
        return this.divide(v, mag);
    }

    /**
     * Скалярное произведение двух векторов
     */
    static dot(v1: Vector2D, v2: Vector2D): number {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * Вычисление расстояния между двумя точками
     */
    static distance(v1: Vector2D, v2: Vector2D): number {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Вращение вектора на заданный угол (в радианах)
     */
    static rotate(v: Vector2D, angle: number): Vector2D {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos
        };
    }

    /**
     * Угол между двумя векторами (в радианах)
     */
    static angle(v1: Vector2D, v2: Vector2D): number {
        const dot = this.dot(v1, v2);
        const mag1 = this.magnitude(v1);
        const mag2 = this.magnitude(v2);

        if (mag1 === 0 || mag2 === 0) {
            return 0;
        }

        const cosAngle = dot / (mag1 * mag2);

        // Обработка погрешностей вычислений
        if (cosAngle > 1) return 0;
        if (cosAngle < -1) return Math.PI;

        return Math.acos(cosAngle);
    }

    /**
     * Ограничение максимальной длины вектора
     */
    static limit(v: Vector2D, max: number): Vector2D {
        const mag = this.magnitude(v);
        if (mag > max) {
            return this.multiply(this.normalize(v), max);
        }
        return { ...v };
    }

    /**
     * Отражение вектора относительно нормали поверхности
     */
    static reflect(v: Vector2D, normal: Vector2D): Vector2D {
        const normalizedNormal = this.normalize(normal);
        const dot = this.dot(v, normalizedNormal);
        return this.subtract(v, this.multiply(normalizedNormal, 2 * dot));
    }

    /**
     * Линейная интерполяция между двумя векторами
     */
    static lerp(v1: Vector2D, v2: Vector2D, t: number): Vector2D {
        // Ограничение t в диапазоне [0, 1]
        const clampedT = Math.max(0, Math.min(1, t));
        return {
            x: v1.x + (v2.x - v1.x) * clampedT,
            y: v1.y + (v2.y - v1.y) * clampedT
        };
    }

    /**
     * Создание случайного вектора
     */
    static random(magnitude: number = 1): Vector2D {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(angle) * magnitude,
            y: Math.sin(angle) * magnitude
        };
    }

    /**
     * Создание случайного вектора в заданном диапазоне
     */
    static randomRange(minX: number, maxX: number, minY: number, maxY: number): Vector2D {
        return {
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY)
        };
    }

    /**
     * Проверка равенства векторов с учетом погрешности
     */
    static equals(v1: Vector2D, v2: Vector2D, epsilon: number = 0.0001): boolean {
        return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon;
    }

    /**
     * Получение перпендикулярного вектора (повернутого на 90 градусов)
     */
    static perpendicular(v: Vector2D): Vector2D {
        return {
            x: -v.y,
            y: v.x
        };
    }
}