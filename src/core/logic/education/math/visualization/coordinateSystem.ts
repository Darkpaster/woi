import {Point} from "../../../../../utils/math/2d.ts";

/**
 * Класс для преобразования координат между математическими и экранными
 */
export class CoordinateSystem {
    private origin: Point;
    private scale: number;

    constructor(origin: Point = new Point(0, 0), scale: number = 1) {
        this.origin = origin;
        this.scale = scale;
    }

    toScreenCoordinates(mathPoint: Point): Point {
        return new Point(
            this.origin.x + mathPoint.x * this.scale,
            this.origin.y - mathPoint.y * this.scale // Инвертируем Y для экранных координат
        );
    }

    toMathCoordinates(screenPoint: Point): Point {
        return new Point(
            (screenPoint.x - this.origin.x) / this.scale,
            (this.origin.y - screenPoint.y) / this.scale // Инвертируем Y для математических координат
        );
    }

    setOrigin(origin: Point): void {
        this.origin = origin;
    }

    setScale(scale: number): void {
        this.scale = scale;
    }

    getOrigin(): Point {
        return this.origin.clone();
    }

    getScale(): number {
        return this.scale;
    }
}