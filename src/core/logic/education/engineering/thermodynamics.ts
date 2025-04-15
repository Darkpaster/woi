import {SimulationObject} from "./simulationObject.ts";

export namespace Thermodynamics {
    /**
     * Класс для симуляции теплопередачи в материале
     */
    export class HeatTransfer extends SimulationObject {
        private width: number;
        private height: number;
        private cellSize: number;
        private grid: number[][] = [];
        private heatSources: HeatSource[] = [];
        private thermalConductivity: number;

        constructor(x: number, y: number, width: number, height: number, cellSize: number = 10, conductivity: number = 0.5) {
            super(x, y);
            this.width = width;
            this.height = height;
            this.cellSize = cellSize;
            this.thermalConductivity = conductivity;

            this.initializeGrid();
            this.saveInitialState();
        }

        private initializeGrid(): void {
            const cols = Math.floor(this.width / this.cellSize);
            const rows = Math.floor(this.height / this.cellSize);

            // Инициализация сетки с комнатной температурой (20°C)
            this.grid = [];
            for (let i = 0; i < rows; i++) {
                this.grid[i] = [];
                for (let j = 0; j < cols; j++) {
                    this.grid[i][j] = 20;
                }
            }
        }

        public addHeatSource(source: HeatSource): void {
            this.heatSources.push(source);
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                width: this.width,
                height: this.height,
                cellSize: this.cellSize,
                thermalConductivity: this.thermalConductivity
            };
        }

        public reset(): void {
            super.reset();
            this.width = this.initialState.width;
            this.height = this.initialState.height;
            this.cellSize = this.initialState.cellSize;
            this.thermalConductivity = this.initialState.thermalConductivity;

            this.initializeGrid();
        }

        public update(deltaTime: number): void {
            const cols = Math.floor(this.width / this.cellSize);
            const rows = Math.floor(this.height / this.cellSize);

            // Создаем копию сетки для расчета нового состояния
            const newGrid: number[][] = [];
            for (let i = 0; i < rows; i++) {
                newGrid[i] = [...this.grid[i]];
            }

            // Применяем источники тепла
            for (const source of this.heatSources) {
                const sourceGridX = Math.floor((source.getPosition().x - this.position.x) / this.cellSize);
                const sourceGridY = Math.floor((source.getPosition().y - this.position.y) / this.cellSize);
                const radius = Math.ceil(source.getRadius() / this.cellSize);

                for (let i = Math.max(0, sourceGridY - radius); i < Math.min(rows, sourceGridY + radius + 1); i++) {
                    for (let j = Math.max(0, sourceGridX - radius); j < Math.min(cols, sourceGridX + radius + 1); j++) {
                        const dx = j - sourceGridX;
                        const dy = i - sourceGridY;
                        const distanceSquared = dx * dx + dy * dy;

                        if (distanceSquared <= radius * radius) {
                            const intensity = 1 - Math.sqrt(distanceSquared) / radius;
                            newGrid[i][j] += source.getTemperature() * intensity * deltaTime;
                        }
                    }
                }
            }

            // Теплопроводность - распространение тепла между ячейками
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    let sum = 0;
                    let count = 0;

                    // Проверяем соседние ячейки
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;

                            const ni = i + di;
                            const nj = j + dj;

                            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                                sum += this.grid[ni][nj];
                                count++;
                            }
                        }
                    }

                    if (count > 0) {
                        const averageNeighborTemp = sum / count;
                        const diffusion = (averageNeighborTemp - this.grid[i][j]) * this.thermalConductivity * deltaTime;
                        newGrid[i][j] += diffusion;
                    }
                }
            }

            // Теплообмен с окружающей средой (охлаждение)
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const coolingRate = 0.1 * deltaTime;
                    newGrid[i][j] = newGrid[i][j] - coolingRate * (newGrid[i][j] - 20);
                }
            }

            this.grid = newGrid;
        }

        public render(ctx: CanvasRenderingContext2D): void {
            const cols = Math.floor(this.width / this.cellSize);
            const rows = Math.floor(this.height / this.cellSize);

            // Рисуем тепловую карту
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const temp = this.grid[i][j];

                    // Преобразуем температуру в цвет
                    const r = Math.min(255, Math.max(0, Math.floor((temp - 20) * 8)));
                    const g = Math.min(255, Math.max(0, Math.floor(255 - Math.abs(temp - 50) * 5)));
                    const b = Math.min(255, Math.max(0, Math.floor((80 - temp) * 8)));

                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(
                        this.position.x + j * this.cellSize,
                        this.position.y + i * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }

            // Рисуем сетку
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 0.5;

            for (let i = 0; i <= rows; i++) {
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y + i * this.cellSize);
                ctx.lineTo(this.position.x + this.width, this.position.y + i * this.cellSize);
                ctx.stroke();
            }

            for (let j = 0; j <= cols; j++) {
                ctx.beginPath();
                ctx.moveTo(this.position.x + j * this.cellSize, this.position.y);
                ctx.lineTo(this.position.x + j * this.cellSize, this.position.y + this.height);
                ctx.stroke();
            }

            // Рисуем границу
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

            // Рисуем источники тепла
            for (const source of this.heatSources) {
                source.render(ctx);
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

        public getTemperatureAt(x: number, y: number): number {
            const gridX = Math.floor((x - this.position.x) / this.cellSize);
            const gridY = Math.floor((y - this.position.y) / this.cellSize);

            const cols = Math.floor(this.width / this.cellSize);
            const rows = Math.floor(this.height / this.cellSize);

            if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
                return this.grid[gridY][gridX];
            }

            return 20; // Комнатная температура, если точка за пределами сетки
        }

        public setThermalConductivity(conductivity: number): void {
            this.thermalConductivity = conductivity;
        }

        public getThermalConductivity(): number {
            return this.thermalConductivity;
        }
    }

    /**
     * Класс для источника тепла
     */
    export class HeatSource extends SimulationObject {
        private temperature: number;
        private radius: number;

        constructor(x: number, y: number, temperature: number = 100, radius: number = 20) {
            super(x, y);
            this.temperature = temperature;
            this.radius = radius;

            this.saveInitialState();
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                temperature: this.temperature,
                radius: this.radius
            };
        }

        public reset(): void {
            super.reset();
            this.temperature = this.initialState.temperature;
            this.radius = this.initialState.radius;
        }

        public update(deltaTime: number): void {
            // Источник тепла не меняется со временем
        }

        public render(ctx: CanvasRenderingContext2D): void {
            // Рисуем источник тепла
            const gradient = ctx.createRadialGradient(
                this.position.x, this.position.y, 0,
                this.position.x, this.position.y, this.radius
            );

            gradient.addColorStop(0, `rgba(255, 128, 0, 0.9)`);
            gradient.addColorStop(0.7, `rgba(255, 0, 0, 0.5)`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);

            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Рисуем текст температуры
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.fillText(`${this.temperature.toFixed(0)}°C`, this.position.x - 12, this.position.y + 4);
        }

        public isPointInside(x: number, y: number): boolean {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            return (dx * dx + dy * dy) <= (this.radius * this.radius);
        }

        public getTemperature(): number {
            return this.temperature;
        }

        public setTemperature(temperature: number): void {
            this.temperature = temperature;
        }

        public getRadius(): number {
            return this.radius;
        }

        public setRadius(radius: number): void {
            this.radius = radius;
        }
    }
}
