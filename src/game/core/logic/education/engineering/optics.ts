import {Vector2D} from "../../../../../utils/math/2d.ts";
import {SimulationObject} from "./simulationObject.ts";

export namespace Optics {
    /**
     * Класс для симуляции оптической системы
     */
    export class OpticalSystem extends SimulationObject {
        private width: number;
        private height: number;
        private opticalElements: OpticalElement[] = [];
        private rays: LightRay[] = [];

        constructor(x: number, y: number, width: number, height: number) {
            super(x, y);
            this.width = width;
            this.height = height;

            this.saveInitialState();
        }

        public addOpticalElement(element: OpticalElement): void {
            this.opticalElements.push(element);
        }

        public addLightRay(ray: LightRay): void {
            this.rays.push(ray);
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                width: this.width,
                height: this.height
            };
        }

        public reset(): void {
            super.reset();
            this.width = this.initialState.width;
            this.height = this.initialState.height;

            for (const ray of this.rays) {
                ray.reset();
            }
        }

        public update(deltaTime: number): void {
            // Обновляем все лучи
            for (const ray of this.rays) {
                // Сначала сбрасываем путь луча до его исходного начала
                ray.resetPath();

                // Распространяем луч сквозь оптическую систему
                this.propagateRay(ray);
            }
        }

        private propagateRay(ray: LightRay): void {
            // Начальная точка луча
            let currentPoint = ray.getStartPosition();
            let currentDirection = ray.getDirection();
            let intensity = 1.0;
            let pathLength = 0;
            const maxPathLength = 2000; // Максимальная длина пути

            ray.addPathPoint(currentPoint);

            // Рекурсивно распространяем луч, пока он не выйдет за пределы системы или не будет поглощен
            while (
                currentPoint.x >= this.position.x &&
                currentPoint.x <= this.position.x + this.width &&
                currentPoint.y >= this.position.y &&
                currentPoint.y <= this.position.y + this.height &&
                intensity > 0.01 &&
                pathLength < maxPathLength
                ) {
                // Находим ближайшее пересечение луча с оптическими элементами
                let nearestIntersection: {
                    element: OpticalElement;
                    point: Vector2D;
                    distance: number;
                } | null = null;

                for (const element of this.opticalElements) {
                    const intersection = element.getIntersection(currentPoint, currentDirection);

                    if (intersection && (!nearestIntersection || intersection.distance < nearestIntersection.distance)) {
                        nearestIntersection = {
                            element,
                            point: intersection.point,
                            distance: intersection.distance
                        };
                    }
                }

                if (!nearestIntersection) {
                    // Если нет пересечений, продолжаем луч в том же направлении до границы
                    const tX = currentDirection.x !== 0 ?
                        ((currentDirection.x > 0 ? this.position.x + this.width : this.position.x) - currentPoint.x) / currentDirection.x :
                        Infinity;

                    const tY = currentDirection.y !== 0 ?
                        ((currentDirection.y > 0 ? this.position.y + this.height : this.position.y) - currentPoint.y) / currentDirection.y :
                        Infinity;

                    const t = Math.min(tX, tY);

                    const endPoint = new Vector2D(currentPoint.x + currentDirection.x * t,currentPoint.y + currentDirection.y * t);

                    ray.addPathPoint(endPoint);
                    break;
                } else {
                    // Добавляем точку пересечения в путь
                    ray.addPathPoint(nearestIntersection.point);

                    // Обновляем текущее положение
                    currentPoint = nearestIntersection.point;

// Применяем эффект оптического элемента
                    const interaction = nearestIntersection.element.interact(currentPoint, currentDirection, ray.getWavelength());

                    // Обновляем направление и интенсивность
                    currentDirection = interaction.newDirection;
                    intensity *= interaction.intensityFactor;

                    // Увеличиваем длину пути
                    pathLength += nearestIntersection.distance;
                }
            }
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Рисуем границу оптической системы
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

            // Рисуем все оптические элементы
            for (const element of this.opticalElements) {
                element.render(ctx);
            }

            // Рисуем все лучи
            for (const ray of this.rays) {
                ray.render(ctx);
            }
        }

        public isPointInside(x: number, y: number): boolean {
            return (
                x >= this.position.x &&
                x <= this.position.x + this.width &&
                y >= this.position.y &&
                y <= this.position.y + this.height
            );
        }
    }

    /**
     * Класс для представления луча света
     */
    export class LightRay extends SimulationObject {
        private direction: Vector2D;
        private wavelength: number; // в нм
        private initialDirection: Vector2D;
        private pathPoints: Vector2D[] = [];

        /**
         * @param x Начальная x-координата
         * @param y Начальная y-координата
         * @param angle Угол направления в радианах
         * @param wavelength Длина волны в нм (400-700 для видимого света)
         */
        constructor(x: number, y: number, angle: number = 0, wavelength: number = 550) {
            super(x, y);

            this.direction = new Vector2D(Math.cos(angle),Math.sin(angle));
            this.initialDirection = this.direction;
            this.wavelength = wavelength;

            this.pathPoints.push(new Vector2D(x, y));
            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                direction: { ...this.direction },
                wavelength: this.wavelength
            };
        }

        public reset(): void {
            super.reset();
            this.direction = { ...this.initialState.direction };
            this.wavelength = this.initialState.wavelength;
            this.resetPath();
        }

        public resetPath(): void {
            this.pathPoints = [this.getPosition()];
        }

        public update(deltaTime: number): void {
            // Лучи обновляются в OpticalSystem
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Преобразуем длину волны в цвет (упрощённо)
            let color: string;

            if (this.wavelength < 450) {
                color = 'rgb(75, 0, 130)'; // Фиолетовый
            } else if (this.wavelength < 490) {
                color = 'rgb(0, 0, 255)'; // Синий
            } else if (this.wavelength < 560) {
                color = 'rgb(0, 255, 0)'; // Зеленый
            } else if (this.wavelength < 590) {
                color = 'rgb(255, 255, 0)'; // Желтый
            } else if (this.wavelength < 630) {
                color = 'rgb(255, 127, 0)'; // Оранжевый
            } else {
                color = 'rgb(255, 0, 0)'; // Красный
            }

            // Рисуем путь луча
            if (this.pathPoints.length > 1) {
                ctx.beginPath();
                ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);

                for (let i = 1; i < this.pathPoints.length; i++) {
                    ctx.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
                }

                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        public isPointInside(x: number, y: number): boolean {
            return false; // Лучи не могут быть выбраны
        }

        public addPathPoint(point: Vector2D): void {
            this.pathPoints.push(point);
        }

        public getPathPoints(): Vector2D[] {
            return [...this.pathPoints];
        }

        public getStartPosition(): Vector2D {
            return this.getPosition();
        }

        public getDirection(): Vector2D {
            return { ...this.direction };
        }

        public setDirection(direction: Vector2D): void {
            const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

            if (magnitude > 0) {
                this.direction = new Vector2D(direction.x / magnitude,direction.y / magnitude);
            }
        }

        public getWavelength(): number {
            return this.wavelength;
        }

        public setWavelength(wavelength: number): void {
            this.wavelength = wavelength;
        }
    }

    /**
     * Интерфейс для результата взаимодействия оптического элемента с лучом
     */
    interface OpticalInteraction {
        newDirection: Vector2D;
        intensityFactor: number;
    }

    /**
     * Интерфейс для результата пересечения луча с оптическим элементом
     */
    interface OpticalIntersection {
        point: Vector2D;
        distance: number;
    }

    /**
     * Абстрактный класс для оптических элементов
     */
    export abstract class OpticalElement extends SimulationObject {
        protected refractiveIndex: number;

        constructor(x: number, y: number, refractiveIndex: number = 1.5) {
            super(x, y);
            this.refractiveIndex = refractiveIndex;

            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                refractiveIndex: this.refractiveIndex
            };
        }

        public reset(): void {
            super.reset();
            this.refractiveIndex = this.initialState.refractiveIndex;
        }

        public getRefractiveIndex(): number {
            return this.refractiveIndex;
        }

        public setRefractiveIndex(index: number): void {
            this.refractiveIndex = index;
        }

        public abstract getIntersection(rayOrigin: Vector2D, rayDirection: Vector2D): OpticalIntersection | null;
        public abstract interact(intersectionPoint: Vector2D, incidentDirection: Vector2D, wavelength: number): OpticalInteraction;
    }

    /**
     * Класс для линзы
     */
    export class Lens extends OpticalElement {
        private width: number;
        private height: number;
        private focalLength: number;

        constructor(x: number, y: number, width: number, height: number, focalLength: number, refractiveIndex: number = 1.5) {
            super(x, y, refractiveIndex);
            this.width = width;
            this.height = height;
            this.focalLength = focalLength;

            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                width: this.width,
                height: this.height,
                focalLength: this.focalLength
            };
        }

        public reset(): void {
            super.reset();
            this.width = this.initialState.width;
            this.height = this.initialState.height;
            this.focalLength = this.initialState.focalLength;
        }

        public getIntersection(rayOrigin: Vector2D, rayDirection: Vector2D): OpticalIntersection | null {
            // Упрощенная модель: линза как прямоугольник
            // Рассчитываем пересечение луча с прямыми линиями

            // Параметры для четырех сторон прямоугольника
            const left = this.position.x - this.width / 2;
            const right = this.position.x + this.width / 2;
            const top = this.position.y - this.height / 2;
            const bottom = this.position.y + this.height / 2;

            let nearestIntersection: OpticalIntersection | null = null;

            // Проверяем пересечение с левой стороной
            if (rayDirection.x > 0) {
                const t = (left - rayOrigin.x) / rayDirection.x;
                if (t > 0) {
                    const y = rayOrigin.y + rayDirection.y * t;
                    if (y >= top && y <= bottom) {
                        const distance = t;

                        const point = new Vector2D(left,y);

                        if (!nearestIntersection || distance < nearestIntersection.distance) {
                            nearestIntersection = { point, distance };
                        }
                    }
                }
            }

            // Проверяем пересечение с правой стороной
            if (rayDirection.x < 0) {
                const t = (right - rayOrigin.x) / rayDirection.x;
                if (t > 0) {
                    const y = rayOrigin.y + rayDirection.y * t;
                    if (y >= top && y <= bottom) {
                        const distance = t;
                        const point = new Vector2D(right, y);

                        if (!nearestIntersection || distance < nearestIntersection.distance) {
                            nearestIntersection = { point, distance };
                        }
                    }
                }
            }

            // Проверяем пересечение с верхней стороной
            if (rayDirection.y > 0) {
                const t = (top - rayOrigin.y) / rayDirection.y;
                if (t > 0) {
                    const x = rayOrigin.x + rayDirection.x * t;
                    if (x >= left && x <= right) {
                        const distance = t;
                        const point = new Vector2D(y, top);

                        if (!nearestIntersection || distance < nearestIntersection.distance) {
                            nearestIntersection = { point, distance };
                        }
                    }
                }
            }

            // Проверяем пересечение с нижней стороной
            if (rayDirection.y < 0) {
                const t = (bottom - rayOrigin.y) / rayDirection.y;
                if (t > 0) {
                    const x = rayOrigin.x + rayDirection.x * t;
                    if (x >= left && x <= right) {
                        const distance = t;
                        const point = new Vector2D(x, bottom);

                        if (!nearestIntersection || distance < nearestIntersection.distance) {
                            nearestIntersection = { point, distance };
                        }
                    }
                }
            }

            return nearestIntersection;
        }

        public interact(intersectionPoint: Vector2D, incidentDirection: Vector2D, wavelength: number): OpticalInteraction {
            // Вычисляем нормаль к поверхности в точке пересечения
            const normal = this.getNormalAt(intersectionPoint);

            // Определяем, входящий или выходящий луч
            const center = {
                x: this.position.x,
                y: this.position.y
            };

            const dotProduct = (incidentDirection.x * normal.x + incidentDirection.y * normal.y);
            const isEntering = dotProduct < 0;

            // Рассчитываем направление с учетом преломления линзы
            // Используем упрощенную модель для линзы, основанную на фокусном расстоянии

            let newDirection: Vector2D;

            // Если луч проходит близко к центру линзы, применяем преломление
            const distanceFromCenter = Math.sqrt(
                Math.pow(intersectionPoint.x - center.x, 2) +
                Math.pow(intersectionPoint.y - center.y, 2)
            );

            const relativeDistance = distanceFromCenter / Math.min(this.width, this.height) * 2;

            if (relativeDistance < 0.9) {
                // Применяем эффект линзы: направление луча смещается к/от фокуса
                const focalPoint = {
                    x: center.x + this.focalLength * (this.focalLength > 0 ? 1 : -1),
                    y: center.y
                };

                const toFocus = {
                    x: focalPoint.x - intersectionPoint.x,
                    y: focalPoint.y - intersectionPoint.y
                };

                // Нормализуем вектор к фокусу
                const focusDistance = Math.sqrt(toFocus.x * toFocus.x + toFocus.y * toFocus.y);

                if (focusDistance > 0) {
                    toFocus.x /= focusDistance;
                    toFocus.y /= focusDistance;
                }

                // Вес определяет, насколько сильно луч отклоняется в направлении фокуса
                const weight = (1 - relativeDistance) * 0.5;

                // Линзы с отрицательным фокусным расстоянием отклоняют лучи от оси
                const directionModifier = this.focalLength > 0 ? weight : -weight;


                newDirection = new Vector2D(incidentDirection.x + toFocus.x * directionModifier,incidentDirection.y + toFocus.y * directionModifier);
            } else {
                // Если луч проходит близко к краю, просто немного преломляем
                // Применяем закон Снеллиуса
                const n1 = isEntering ? 1.0 : this.refractiveIndex; // Показатель преломления среды, из которой выходит луч
                const n2 = isEntering ? this.refractiveIndex : 1.0; // Показатель преломления среды, в которую входит луч

                const ratio = n1 / n2;
                const cosI = -(normal.x * incidentDirection.x + normal.y * incidentDirection.y);
                const sinT2 = ratio * ratio * (1.0 - cosI * cosI);

                if (sinT2 > 1.0) {
                    // Полное внутреннее отражение

                    newDirection = new Vector2D(incidentDirection.x + 2.0 * cosI * normal.x,incidentDirection.y + 2.0 * cosI * normal.y);
                } else {
                    const cosT = Math.sqrt(1.0 - sinT2);

                    newDirection = new Vector2D(ratio * incidentDirection.x + (ratio * cosI - cosT) * normal.x,ratio * incidentDirection.y + (ratio * cosI - cosT) * normal.y);
                }
            }

            // Нормализуем новое направление
            const magnitude = Math.sqrt(newDirection.x * newDirection.x + newDirection.y * newDirection.y);

            if (magnitude > 0) {
                newDirection.x /= magnitude;
                newDirection.y /= magnitude;
            }

            // Возвращаем результат взаимодействия
            return {
                newDirection,
                intensityFactor: 0.95 // Небольшое уменьшение интенсивности из-за отражения и поглощения
            };
        }

        private getNormalAt(point: Vector2D): Vector2D {
            // Определяем, к какой стороне прямоугольника ближе точка
            const left = this.position.x - this.width / 2;
            const right = this.position.x + this.width / 2;
            const top = this.position.y - this.height / 2;
            const bottom = this.position.y + this.height / 2;

            // Расстояния до каждой стороны
            const distLeft = Math.abs(point.x - left);
            const distRight = Math.abs(point.x - right);
            const distTop = Math.abs(point.y - top);
            const distBottom = Math.abs(point.y - bottom);

            // Находим минимальное расстояние
            const minDist = Math.min(distLeft, distRight, distTop, distBottom);

            // Возвращаем нормаль в зависимости от ближайшей стороны
            if (minDist === distLeft) {
                return new Vector2D(-1, 0); // Нормаль влево
            } else if (minDist === distRight) {
                return new Vector2D(1, 0); // Нормаль вправо
            } else if (minDist === distTop) {
                return new Vector2D(0, -1); // Нормаль вверх
            } else {
                return new Vector2D(0, 1); // Нормаль вниз
            }
        }

        public render(ctx: CanvasRenderingContext2D): void {
            const left = this.position.x - this.width / 2;
            const top = this.position.y - this.height / 2;

            // Рисуем линзу
            ctx.beginPath();

            if (this.focalLength > 0) {
                // Выпуклая (собирающая) линза
                const curveAmount = Math.min(this.width, this.height) * 0.2;

                ctx.moveTo(left, top);
                ctx.lineTo(left, top + this.height);
                ctx.quadraticCurveTo(left - curveAmount, top + this.height / 2, left, top);

                ctx.moveTo(left + this.width, top);
                ctx.lineTo(left + this.width, top + this.height);
                ctx.quadraticCurveTo(left + this.width + curveAmount, top + this.height / 2, left + this.width, top);
            } else {
                // Вогнутая (рассеивающая) линза
                const curveAmount = Math.min(this.width, this.height) * 0.2;

                ctx.moveTo(left, top);
                ctx.lineTo(left, top + this.height);
                ctx.quadraticCurveTo(left + curveAmount, top + this.height / 2, left, top);

                ctx.moveTo(left + this.width, top);
                ctx.lineTo(left + this.width, top + this.height);
                ctx.quadraticCurveTo(left + this.width - curveAmount, top + this.height / 2, left + this.width, top);
            }

            ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем прямоугольник
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(left, top, this.width, this.height);

            // Отображаем фокусное расстояние
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.fillText(`f = ${this.focalLength}`, this.position.x - 15, this.position.y - this.height / 2 - 5);
        }

        public isPointInside(x: number, y: number): boolean {
            const left = this.position.x - this.width / 2;
            const right = this.position.x + this.width / 2;
            const top = this.position.y - this.height / 2;
            const bottom = this.position.y + this.height / 2;

            return (
                x >= left &&
                x <= right &&
                y >= top &&
                y <= bottom
            );
        }

        public setFocalLength(length: number): void {
            this.focalLength = length;
        }

        public getFocalLength(): number {
            return this.focalLength;
        }
    }

    /**
     * Класс для зеркала
     */
    export class Mirror extends OpticalElement {
        private length: number;
        private angle: number;

        constructor(x: number, y: number, length: number, angle: number = 0) {
            super(x, y);
            this.length = length;
            this.angle = angle;

            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                length: this.length,
                angle: this.angle
            };
        }

        public reset(): void {
            super.reset();
            this.length = this.initialState.length;
            this.angle = this.initialState.angle;
        }

        public getIntersection(rayOrigin: Vector2D, rayDirection: Vector2D): OpticalIntersection | null {
            // Вычисляем начальную и конечную точки зеркала
            const startX = this.position.x - (this.length / 2) * Math.cos(this.angle);
            const startY = this.position.y - (this.length / 2) * Math.sin(this.angle);
            const endX = this.position.x + (this.length / 2) * Math.cos(this.angle);
            const endY = this.position.y + (this.length / 2) * Math.sin(this.angle);

            // Вектор направления зеркала
            const mirrorDirX = endX - startX;
            const mirrorDirY = endY - startY;

            // Проверяем пересечение луча с линией зеркала
            const det = rayDirection.x * mirrorDirY - rayDirection.y * mirrorDirX;

            if (Math.abs(det) < 1e-6) {
                // Луч параллелен зеркалу, нет пересечения
                return null;
            }

            const t1 = ((startX - rayOrigin.x) * mirrorDirY - (startY - rayOrigin.y) * mirrorDirX) / det;
            const t2 = ((startX - rayOrigin.x) * rayDirection.y - (startY - rayOrigin.y) * rayDirection.x) / det;

            if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
                // Есть пересечение
                const intersectionX = rayOrigin.x + rayDirection.x * t1;
                const intersectionY = rayOrigin.y + rayDirection.y * t1;

                return {
                    point: { x: intersectionX, y: intersectionY },
                    distance: t1
                };
            }

            return null;
        }

        public interact(intersectionPoint: Vector2D, incidentDirection: Vector2D, wavelength: number): OpticalInteraction {
            // Вычисляем нормаль к зеркалу
            const normal = {
                x: Math.sin(this.angle),
                y: -Math.cos(this.angle)
            };

            // Вычисляем направление отраженного луча по закону отражения
            const dot = incidentDirection.x * normal.x + incidentDirection.y * normal.y;

            const reflectedDirection = new Vector2D(incidentDirection.x - 2 * dot * normal.x,incidentDirection.y - 2 * dot * normal.y);

            // Отражение уменьшает интенсивность, зависит от длины волны (упрощенно)
            let reflectivity = 0.9; // Базовая отражающая способность

            // Добавляем небольшую зависимость от длины волны
            if (wavelength < 450) {
                reflectivity *= 0.95; // Фиолетовый отражается немного хуже
            } else if (wavelength > 650) {
                reflectivity *= 0.97; // Красный отражается немного лучше
            }

            return {
                newDirection: reflectedDirection,
                intensityFactor: reflectivity
            };
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Вычисляем начальную и конечную точки зеркала
            const startX = this.position.x - (this.length / 2) * Math.cos(this.angle);
            const startY = this.position.y - (this.length / 2) * Math.sin(this.angle);
            const endX = this.position.x + (this.length / 2) * Math.cos(this.angle);
            const endY = this.position.y + (this.length / 2) * Math.sin(this.angle);

            // Рисуем зеркало
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'rgba(220, 220, 220, 0.8)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Добавляем блики для эффекта зеркала
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        public isPointInside(x: number, y: number): boolean {
            // Вычисляем начальную и конечную точки зеркала
            const startX = this.position.x - (this.length / 2) * Math.cos(this.angle);
            const startY = this.position.y - (this.length / 2) * Math.sin(this.angle);
            const endX = this.position.x + (this.length / 2) * Math.cos(this.angle);
            const endY = this.position.y + (this.length / 2) * Math.sin(this.angle);

            // Проверяем, находится ли точка рядом с линией зеркала
            const lineVector = {
                x: endX - startX,
                y: endY - startY
            };

            const pointVector = {
                x: x - startX,
                y: y - startY
            };

            const lineLength = Math.sqrt(lineVector.x * lineVector.x + lineVector.y * lineVector.y);

            if (lineLength === 0) return false;

            // Проекция вектора точки на вектор линии
            const proj = (pointVector.x * lineVector.x + pointVector.y * lineVector.y) / lineLength;

            // Если проекция отрицательна или больше длины линии, точка за пределами отрезка
            if (proj < 0 || proj > lineLength) return false;

            // Вычисляем ближайшую точку на линии
            const nearestPoint = {
                x: startX + (proj / lineLength) * lineVector.x,
                y: startY + (proj / lineLength) * lineVector.y
            };

            // Расстояние от точки до линии
            const distance = Math.sqrt(
                Math.pow(x - nearestPoint.x, 2) +
                Math.pow(y - nearestPoint.y, 2)
            );

            return distance <= 5; // 5 пикселей допуска
        }

        public setAngle(angle: number): void {
            this.angle = angle;
        }

        public getAngle(): number {
            return this.angle;
        }

        public setLength(length: number): void {
            this.length = length;
        }

        public getLength(): number {
            return this.length;
        }
    }
}