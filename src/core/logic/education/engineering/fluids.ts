import {SimulationObject} from "./simulationObject.ts";
import {PhaseState, PhysicalConstants} from "../../../../utils/physics/constants.ts";

interface Vector {
    x: number,
    y: number
}

/**
 * Перечисление типов материалов
 */
export enum MaterialType {
    WATER,
    AIR,
    METAL,
    ROCK
}

export namespace AdvancedFluids {
    /**
     * Интерфейс для материальной частицы с физическими свойствами
     */
    export interface MaterialParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        mass: number;
        temperature: number;
        phase: PhaseState;
        materialType: MaterialType;
        lifetime: number;
        maxLifetime: number;
        energy: number;
        color: string;
    }

    /**
     * Класс для симуляции термодинамической жидкости с фазовыми переходами
     */
    export class ThermodynamicFluidFlow extends SimulationObject {
        private width: number;
        private height: number;
        private particleCount: number;
        private particles: MaterialParticle[] = [];
        private flowRate: number;
        private gravity: number = PhysicalConstants.GRAVITY;
        private obstacles: Obstacle[] = [];
        private ambientTemperature: number = PhysicalConstants.ROOM_TEMPERATURE;
        private thermalGridSize: number = 20; // размер ячейки термальной сетки
        private thermalGrid: number[][] = []; // термальная сетка для расчета теплопроводности воздуха
        private windDirection: Vector = { x: 0, y: 0 }; // направление ветра
        private windStrength: number = 0; // сила ветра
        private atmosphericPressure: number = 101.325; // атмосферное давление (кПа)
        private enableTurbulence: boolean = true; // включение моделирования турбулентности
        private enableSurfaceTension: boolean = true; // включение моделирования поверхностного натяжения
        private enableVaporation: boolean = true; // включение парообразования
        private enableCondensation: boolean = true; // включение конденсации
        private useAdvancedRendering: boolean = true; // использование продвинутого рендеринга

        constructor(x: number, y: number, width: number, height: number, particleCount: number = 400, flowRate: number = 5) {
            super(x, y);
            this.width = width;
            this.height = height;
            this.particleCount = particleCount;
            this.flowRate = flowRate;

            this.initializeThermalGrid();
            this.initializeParticles();
            this.saveInitialState();
        }

        private initializeThermalGrid(): void {
            const cols = Math.ceil(this.width / this.thermalGridSize);
            const rows = Math.ceil(this.height / this.thermalGridSize);

            this.thermalGrid = [];
            for (let i = 0; i < rows; i++) {
                this.thermalGrid[i] = [];
                for (let j = 0; j < cols; j++) {
                    this.thermalGrid[i][j] = this.ambientTemperature;
                }
            }
        }

        private initializeParticles(): void {
            // Создаем частицы воды и воздуха для симуляции
            const waterCount = Math.floor(this.particleCount * 0.7); // 70% воды
            const airCount = this.particleCount - waterCount; // 30% воздуха

            // Инициализация частиц воды
            for (let i = 0; i < waterCount; i++) {
                this.addParticle(MaterialType.WATER);
            }

            // Инициализация частиц воздуха
            for (let i = 0; i < airCount; i++) {
                this.addParticle(MaterialType.AIR, true);
            }
        }

        private addParticle(materialType: MaterialType = MaterialType.WATER, isRandom: boolean = false): void {
            let x, y;

            if (isRandom) {
                // Для воздуха - размещаем случайно в области симуляции
                x = this.position.x + Math.random() * this.width;
                y = this.position.y + Math.random() * this.height;
            } else {
                // Для воды - размещаем в верхней части симуляции
                x = this.position.x + Math.random() * this.width;
                y = this.position.y + Math.random() * this.height * 0.3; // В верхних 30% области
            }

            // Расчет параметров частицы в зависимости от типа материала
            let radius, mass, temperature, phase, vx, vy, color, lifetime, maxLifetime;

            switch (materialType) {
                case MaterialType.WATER:
                    radius = 2 + Math.random() * 2;
                    mass = radius * radius * Math.PI * PhysicalConstants.DENSITY.WATER * 0.01; // масса в граммах
                    temperature = this.ambientTemperature - 5 + Math.random() * 10; // небольшой разброс температур
                    phase = PhaseState.LIQUID;
                    vx = (Math.random() - 0.5) * 10;
                    vy = Math.random() * 10;
                    color = this.getWaterColorByTemperature(temperature, phase);
                    lifetime = Infinity;
                    maxLifetime = Infinity;
                    break;

                case MaterialType.AIR:
                    radius = 1 + Math.random();
                    mass = radius * radius * Math.PI * PhysicalConstants.DENSITY.AIR * 0.01;
                    temperature = this.ambientTemperature - 2 + Math.random() * 4;
                    phase = PhaseState.GAS;
                    vx = (Math.random() - 0.5) * 15;
                    vy = (Math.random() - 0.5) * 15;
                    color = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.05})`;
                    lifetime = 60 + Math.random() * 60; // более короткая жизнь для частиц воздуха
                    maxLifetime = lifetime;
                    break;

                case MaterialType.METAL:
                    radius = 3 + Math.random() * 2;
                    mass = radius * radius * Math.PI * PhysicalConstants.DENSITY.METAL * 0.01;
                    temperature = this.ambientTemperature;
                    phase = PhaseState.SOLID;
                    vx = 0;
                    vy = 0;
                    color = `rgba(180, 180, 180, 0.9)`;
                    lifetime = Infinity;
                    maxLifetime = Infinity;
                    break;

                default:
                    radius = 2;
                    mass = radius * radius * Math.PI * 0.01;
                    temperature = this.ambientTemperature;
                    phase = PhaseState.LIQUID;
                    vx = 0;
                    vy = 0;
                    color = `rgba(0, 100, 255, 0.7)`;
                    lifetime = Infinity;
                    maxLifetime = Infinity;
            }

            // Создаем частицу с вычисленными свойствами
            const energy = this.calculateInternalEnergy(mass, temperature, phase, materialType);

            const particle: MaterialParticle = {
                x,
                y,
                vx,
                vy,
                radius,
                mass,
                temperature,
                phase,
                materialType,
                lifetime,
                maxLifetime,
                energy,
                color
            };

            this.particles.push(particle);
        }

        /**
         * Вычисление внутренней энергии частицы
         */
        private calculateInternalEnergy(mass: number, temperature: number, phase: PhaseState, materialType: MaterialType): number {
            let energy = 0;

            switch (materialType) {
                case MaterialType.WATER:
                    if (phase === PhaseState.SOLID) {
                        // Энергия льда
                        energy = mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE * temperature;
                    } else if (phase === PhaseState.LIQUID) {
                        // Энергия льда до точки плавления + энергия плавления + энергия воды выше точки плавления
                        energy = mass * (
                            PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE * PhysicalConstants.WATER_FREEZING_POINT +
                            PhysicalConstants.LATENT_HEAT.WATER_FREEZING +
                            PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER * (temperature - PhysicalConstants.WATER_FREEZING_POINT)
                        );
                    } else if (phase === PhaseState.GAS) {
                        // Энергия льда до точки плавления + энергия плавления +
                        // энергия воды до точки кипения + энергия парообразования +
                        // энергия пара выше точки кипения
                        energy = mass * (
                            PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE * PhysicalConstants.WATER_FREEZING_POINT +
                            PhysicalConstants.LATENT_HEAT.WATER_FREEZING +
                            PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER * (PhysicalConstants.WATER_BOILING_POINT - PhysicalConstants.WATER_FREEZING_POINT) +
                            PhysicalConstants.LATENT_HEAT.WATER_BOILING +
                            PhysicalConstants.SPECIFIC_HEAT_CAPACITY.STEAM * (temperature - PhysicalConstants.WATER_BOILING_POINT)
                        );
                    }
                    break;

                case MaterialType.AIR:
                    energy = mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR * temperature;
                    break;

                case MaterialType.METAL:
                    energy = mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.METAL * temperature;
                    break;

                case MaterialType.ROCK:
                    energy = mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ROCK * temperature;
                    break;
            }

            return energy;
        }

        /**
         * Вычисление температуры частицы на основе её внутренней энергии
         */
        private calculateTemperatureFromEnergy(particle: MaterialParticle): number {
            const { energy, mass, materialType } = particle;
            let temperature;

            switch (materialType) {
                case MaterialType.WATER:
                    // Энергия для нагрева льда до 0°C
                    const energyToIceMelting = mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE * PhysicalConstants.WATER_FREEZING_POINT;

                    // Энергия для плавления льда
                    const meltingEnergy = mass * PhysicalConstants.LATENT_HEAT.WATER_FREEZING;

                    // Энергия для нагрева воды от 0°C до 100°C
                    const energyToWaterBoiling = mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER *
                        (PhysicalConstants.WATER_BOILING_POINT - PhysicalConstants.WATER_FREEZING_POINT);

                    // Энергия для испарения воды
                    const vaporizationEnergy = mass * PhysicalConstants.LATENT_HEAT.WATER_BOILING;

                    // Определяем фазу и температуру по энергии
                    if (energy < energyToIceMelting) {
                        // Ещё лёд
                        temperature = energy / (mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE);
                        particle.phase = PhaseState.SOLID;
                    } else if (energy < energyToIceMelting + meltingEnergy) {
                        // В процессе плавления
                        temperature = PhysicalConstants.WATER_FREEZING_POINT;
                        particle.phase = PhaseState.LIQUID;
                    } else if (energy < energyToIceMelting + meltingEnergy + energyToWaterBoiling) {
                        // Жидкая вода
                        temperature = PhysicalConstants.WATER_FREEZING_POINT +
                            (energy - energyToIceMelting - meltingEnergy) /
                            (mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER);
                        particle.phase = PhaseState.LIQUID;
                    } else if (energy < energyToIceMelting + meltingEnergy + energyToWaterBoiling + vaporizationEnergy) {
                        // В процессе испарения
                        temperature = PhysicalConstants.WATER_BOILING_POINT;
                        particle.phase = PhaseState.LIQUID;
                    } else {
                        // Пар
                        temperature = PhysicalConstants.WATER_BOILING_POINT +
                            (energy - energyToIceMelting - meltingEnergy - energyToWaterBoiling - vaporizationEnergy) /
                            (mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.STEAM);
                        particle.phase = PhaseState.GAS;
                    }
                    break;

                case MaterialType.AIR:
                    temperature = energy / (mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR);
                    break;

                case MaterialType.METAL:
                    temperature = energy / (mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.METAL);
                    break;

                case MaterialType.ROCK:
                    temperature = energy / (mass * PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ROCK);
                    break;

                default:
                    temperature = particle.temperature; // Сохраняем текущую температуру
            }

            return temperature;
        }

        /**
         * Получить цвет воды в зависимости от температуры и фазового состояния
         */
        private getWaterColorByTemperature(temperature: number, phase: PhaseState): string {
            let r, g, b, a;

            if (phase === PhaseState.SOLID) {
                // Лед - от светло-голубого до белого
                const coldness = Math.max(0, Math.min(1, (PhysicalConstants.WATER_FREEZING_POINT - temperature) / 50));
                r = Math.floor(210 + coldness * 45);
                g = Math.floor(230 + coldness * 25);
                b = 255;
                a = 0.7 + coldness * 0.3;
            } else if (phase === PhaseState.LIQUID) {
                if (temperature < 20) {
                    // Холодная вода - синий
                    r = 0;
                    g = 100 + Math.floor((temperature / 20) * 55);
                    b = 200 + Math.floor((temperature / 20) * 55);
                    a = 0.7;
                } else if (temperature < 80) {
                    // Теплая вода - от синего к голубому
                    const warmth = (temperature - 20) / 60;
                    r = Math.floor(warmth * 50);
                    g = 100 + Math.floor(warmth * 100);
                    b = 255;
                    a = 0.7;
                } else {
                    // Горячая вода - от голубого к бирюзовому
                    const hotness = (temperature - 80) / 20;
                    r = Math.floor(50 + hotness * 150);
                    g = 200;
                    b = 255 - Math.floor(hotness * 50);
                    a = 0.7;
                }
            } else {
                // Пар - от бесцветного к белому
                const hotness = Math.min(1, (temperature - PhysicalConstants.WATER_BOILING_POINT) / 100);
                r = g = b = 255;
                a = 0.1 + hotness * 0.4;
            }

            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        public addObstacle(obstacle: Obstacle): void {
            this.obstacles.push(obstacle);
        }

        protected saveInitialState(): void {
            super.saveInitialState();
            this.initialState = {
                ...this.initialState,
                width: this.width,
                height: this.height,
                particleCount: this.particleCount,
                flowRate: this.flowRate,
                ambientTemperature: this.ambientTemperature,
                gravity: this.gravity
            };
        }

        public reset(): void {
            super.reset();
            this.width = this.initialState.width;
            this.height = this.initialState.height;
            this.particleCount = this.initialState.particleCount;
            this.flowRate = this.initialState.flowRate;
            this.ambientTemperature = this.initialState.ambientTemperature;
            this.gravity = this.initialState.gravity;

            this.particles = [];
            this.initializeThermalGrid();
            this.initializeParticles();
        }

        public update(deltaTime: number): void {
            // Ограничение временного шага для стабильности
            const dt = Math.min(deltaTime, 0.05);

            // 1. Обновление термальной сетки
            this.updateThermalGrid(dt);

            // 2. Обновление частиц
            this.updateParticles(dt);

            // 3. Обработка столкновений между частицами
            this.handleParticleCollisions(dt);

            // 4. Обработка фазовых переходов
            this.handlePhaseTransitions(dt);

            // 5. Обновление частиц воздуха и обработка парообразования/конденсации
            this.updateAirAndVapor(dt);

            // 6. Удаление устаревших частиц и добавление новых
            this.manageParticleLifecycles(dt);
        }

        /**
         * Обновление термальной сетки
         */
        private updateThermalGrid(dt: number): void {
            const cols = Math.ceil(this.width / this.thermalGridSize);
            const rows = Math.ceil(this.height / this.thermalGridSize);

            // Инициализация новой термальной сетки
            const newGrid: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(this.ambientTemperature));

            // Пересчитываем температуру для каждой ячейки сетки
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    // Учет теплопроводности с соседними ячейками
                    let sum = this.thermalGrid[i][j];
                    let count = 1;

                    // Проверяем соседние ячейки для диффузии тепла
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;

                            const ni = i + di;
                            const nj = j + dj;

                            // Проверка границ
                            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                                sum += this.thermalGrid[ni][nj];
                                count++;
                            } else {
                                // За границами симуляции - используем окружающую температуру
                                sum += this.ambientTemperature;
                                count++;
                            }
                        }
                    }

                    // Вычисляем новую температуру с учетом диффузии
                    const airConductivity = PhysicalConstants.THERMAL_CONDUCTIVITY.AIR;
                    const averageTemp = sum / count;
                    newGrid[i][j] = this.thermalGrid[i][j] + (averageTemp - this.thermalGrid[i][j]) * airConductivity * dt;

                    // Добавляем небольшое стремление к окружающей температуре
                    newGrid[i][j] += (this.ambientTemperature - newGrid[i][j]) * 0.01 * dt;
                }
            }

            // Обновляем температуру в сетке от частиц
            for (const particle of this.particles) {
                // Вычисляем позицию частицы в сетке
                const gridX = Math.floor((particle.x - this.position.x) / this.thermalGridSize);
                const gridY = Math.floor((particle.y - this.position.y) / this.thermalGridSize);

                // Проверяем границы
                if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
                    // Вычисляем теплопередачу от частицы в воздух
                    const tempDiff = particle.temperature - newGrid[gridY][gridX];
                    let conductivity;

                    switch (particle.materialType) {
                        case MaterialType.WATER:
                            conductivity = particle.phase === PhaseState.SOLID
                                ? PhysicalConstants.THERMAL_CONDUCTIVITY.ICE
                                : particle.phase === PhaseState.LIQUID
                                    ? PhysicalConstants.THERMAL_CONDUCTIVITY.WATER
                                    : PhysicalConstants.THERMAL_CONDUCTIVITY.STEAM;
                            break;
                        case MaterialType.AIR:
                            conductivity = PhysicalConstants.THERMAL_CONDUCTIVITY.AIR;
                            break;
                        case MaterialType.METAL:
                            conductivity = PhysicalConstants.THERMAL_CONDUCTIVITY.METAL;
                            break;
                        case MaterialType.ROCK:
                            conductivity = PhysicalConstants.THERMAL_CONDUCTIVITY.ROCK;
                            break;
                        default:
                            conductivity = PhysicalConstants.THERMAL_CONDUCTIVITY.AIR;
                    }

                    // Фактор влияния на сетку зависит от массы и размера частицы
                    const influenceFactor = 0.1 * (particle.mass / 0.01) * conductivity;
                    newGrid[gridY][gridX] += tempDiff * influenceFactor * dt;

                    // Обратная теплопередача - от сетки к частице
                    particle.energy += -tempDiff * influenceFactor * dt *
                        (particle.materialType === MaterialType.WATER
                            ? (particle.phase === PhaseState.SOLID
                                ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE
                                : particle.phase === PhaseState.LIQUID
                                    ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER
                                    : PhysicalConstants.SPECIFIC_HEAT_CAPACITY.STEAM)
                            : particle.materialType === MaterialType.AIR
                                ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR
                                : particle.materialType === MaterialType.METAL
                                    ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.METAL
                                    : PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ROCK);

                    // Обновляем температуру частицы
                    particle.temperature = this.calculateTemperatureFromEnergy(particle);
                }
            }

            // Обновляем термальную сетку
            this.thermalGrid = newGrid;
        }

        /**
         * Обновление частиц (позиция, скорость, взаимодействие с окружением)
         */
        private updateParticles(dt: number): void {
            // Применяем физику к каждой частице
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Срок жизни
                if (p.lifetime !== Infinity) {
                    p.lifetime -= dt;
                }

                // Пропускаем обновление позиции для частиц с нулевым оставшимся сроком жизни
                if (p.lifetime <= 0) continue;

                // Обработка в зависимости от фазы и типа материала
                switch (p.phase) {
                    case PhaseState.SOLID:
                        // Твердые тела практически не двигаются, если это не металл с высокой плотностью
                        if (p.materialType === MaterialType.METAL) {
                            p.vy += this.gravity * dt;
                        } else {
                            // Для льда - очень медленное движение
                            p.vy += this.gravity * 0.1 * dt;
                            p.vx *= 0.95; // Сильное трение
                            p.vy *= 0.95;
                        }
                        break;

                    case PhaseState.LIQUID:
                        // Жидкости имеют подвижность
                        p.vy += this.gravity * dt;

                        // Разное сопротивление в зависимости от температуры (вязкость)
                        let viscosityFactor;
                        if (p.temperature < 20) {
                            // Холодная вода более вязкая
                            viscosityFactor = 0.95;
                        } else if (p.temperature < 60) {
                            // Тепловатая вода
                            viscosityFactor = 0.97;
                        } else {
                            // Горячая вода менее вязкая
                            viscosityFactor = 0.99;
                        }

                        p.vx *= viscosityFactor;
                        p.vy *= viscosityFactor;
                        break;

                    case PhaseState.GAS:
                        // Газы имеют плавучесть и подвержены ветру
                        const buoyancy = p.materialType === MaterialType.WATER ? -5 : -2; // Пар имеет большую плавучесть
                        p.vy += (this.gravity + buoyancy) * dt;

                        // Влияние ветра
                        p.vx += this.windDirection.x * this.windStrength * dt;
                        p.vy += this.windDirection.y * this.windStrength * dt;

                        // Небольшое случайное движение для симуляции броуновского движения
                        p.vx += (Math.random() - 0.5) * 5 * dt;
                        p.vy += (Math.random() - 0.5) * 5 * dt;

                        // Сопротивление воздуха
                        p.vx *= 0.99;
                        p.vy *= 0.99;
                        break;
                }

                // Если это частица воздуха, дополнительное влияние тепловых потоков
                if (p.materialType === MaterialType.AIR) {
                    // Получаем индексы в термальной сетке
                    const gridX = Math.floor((p.x - this.position.x) / this.thermalGridSize);
                    const gridY = Math.floor((p.y - this.position.y) / this.thermalGridSize);
                    const cols = Math.ceil(this.width / this.thermalGridSize);
                    const rows = Math.ceil(this.height / this.thermalGridSize);

                    // Проверяем соседние ячейки на температурные градиенты
                    if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
                        // Находим градиент температур в окрестности
                        let gradX = 0;
                        let gradY = 0;

                        // Градиент по X
                        if (gridX > 0 && gridX < cols - 1) {
                            gradX = this.thermalGrid[gridY][gridX + 1] - this.thermalGrid[gridY][gridX - 1];
                        }

                        // Градиент по Y
                        if (gridY > 0 && gridY < rows - 1) {
                            gradY = this.thermalGrid[gridY + 1][gridX] - this.thermalGrid[gridY - 1][gridX];
                        }

                        // Добавляем силу, направленную против градиента температуры (тёплый воздух поднимается)
                        p.vx -= gradX * 0.02 * dt;
                        p.vy -= gradY * 0.05 * dt; // вертикальный градиент влияет сильнее
                    }
                }

                // Обработка столкновений с препятствиями
                for (const obstacle of this.obstacles) {
                    if (obstacle.collidesWith(p.x, p.y, p.radius)) {
                        const normal = obstacle.getNormalAt(p.x, p.y);

                        // Отражение скорости от препятствия с учетом трения
                        const dot = p.vx * normal.x + p.vy * normal.y;
                        p.vx = p.vx - 2 * dot * normal.x;
                        p.vy = p.vy - 2 * dot * normal.y;

                        // Уменьшение скорости из-за трения в зависимости от фазы
                        const frictionFactor = p.phase === PhaseState.SOLID ? 0.6 :
                            p.phase === PhaseState.LIQUID ? 0.8 : 0.9;
                        p.vx *= frictionFactor;
                        p.vy *= frictionFactor;

                        // Теплообмен с препятствием
                        if (obstacle instanceof ThermalObstacle) {
                            const tempDiff = obstacle.getTemperature() - p.temperature;
                            const heatTransferRate = 0.1 * dt;

                            // Выбор удельной теплоемкости в зависимости от материала и фазы
                            let specificHeat;
                            switch (p.materialType) {
                                case MaterialType.WATER:
                                    specificHeat = p.phase === PhaseState.SOLID
                                        ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE
                                        : p.phase === PhaseState.LIQUID
                                            ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER
                                            : PhysicalConstants.SPECIFIC_HEAT_CAPACITY.STEAM;
                                    break;
                                case MaterialType.AIR:
                                    specificHeat = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR;
                                    break;
                                case MaterialType.METAL:
                                    specificHeat = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.METAL;
                                    break;
                                case MaterialType.ROCK:
                                    specificHeat = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ROCK;
                                    break;
                                default:
                                    specificHeat = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR;
                            }

                            // Изменение энергии частицы из-за теплообмена
                            const energyChange = p.mass * specificHeat * tempDiff * heatTransferRate;
                            p.energy += energyChange;
                            p.temperature = this.calculateTemperatureFromEnergy(p);

                            // Обновление цвета для воды
                            if (p.materialType === MaterialType.WATER) {
                                p.color = this.getWaterColorByTemperature(p.temperature, p.phase);
                            }

                            // Передача тепла препятствию
                            obstacle.transferHeat(-energyChange);
                        }
                    }
                }

                // Обновляем позицию частицы
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                // Обработка границ симуляции
                this.handleBoundaries(p, dt);

                // Обновление цвета частицы в зависимости от температуры
                if (p.materialType === MaterialType.WATER) {
                    p.color = this.getWaterColorByTemperature(p.temperature, p.phase);
                } else if (p.materialType === MaterialType.AIR) {
                    // Визуализация температуры воздуха
                    const tempNorm = Math.min(1, Math.max(0, (p.temperature - this.ambientTemperature) / 100));
                    const alpha = Math.min(0.3, 0.05 + tempNorm * 0.25);
                    if (p.temperature > this.ambientTemperature + 30) {
                        // Горячий воздух
                        p.color = `rgba(255, ${Math.floor(255 - tempNorm * 200)}, ${Math.floor(255 - tempNorm * 255)}, ${alpha})`;
                    } else if (p.temperature < this.ambientTemperature - 30) {
                        // Холодный воздух
                        const coldness = Math.min(1, Math.max(0, (this.ambientTemperature - p.temperature) / 100));
                        p.color = `rgba(${Math.floor(255 - coldness * 200)}, ${Math.floor(255 - coldness * 100)}, 255, ${alpha})`;
                    } else {
                        // Нейтральный воздух
                        p.color = `rgba(255, 255, 255, ${alpha})`;
                    }
                }
            }
        }

        /**
         * Обработка границ симуляции для частицы
         */
        private handleBoundaries(p: MaterialParticle, dt: number): void {
            // Обработка боковых границ
            if (p.x - p.radius < this.position.x) {
                p.x = this.position.x + p.radius;
                p.vx = -p.vx * 0.8;
            } else if (p.x + p.radius > this.position.x + this.width) {
                p.x = this.position.x + this.width - p.radius;
                p.vx = -p.vx * 0.8;
            }

            // Обработка верхней и нижней границ
            if (p.y - p.radius < this.position.y) {
                p.y = this.position.y + p.radius;
                p.vy = -p.vy * 0.8;
            } else if (p.y + p.radius > this.position.y + this.height) {
                // Различное поведение в зависимости от материала и фазы
                if (p.materialType === MaterialType.WATER) {
                    if (p.phase === PhaseState.GAS) {
                        // Пар может выходить за пределы симуляции
                        p.lifetime = 0;
                    } else if (p.phase === PhaseState.LIQUID || p.phase === PhaseState.SOLID) {
                        // Жидкость и лед отражаются, с некоторой потерей энергии
                        p.y = this.position.y + this.height - p.radius;
                        p.vy = -p.vy * 0.6;

                        // Небольшая потеря тепла при столкновении
                        p.energy -= p.mass * 0.1;
                        p.temperature = this.calculateTemperatureFromEnergy(p);
                    }
                } else if (p.materialType === MaterialType.AIR) {
                    // Воздух может выходить за пределы и возвращаться сверху
                    if (Math.random() < 0.5) {
                        p.y = this.position.y + p.radius;
                        p.x = this.position.x + Math.random() * this.width;
                        p.vy = Math.random() * 5;
                    } else {
                        p.lifetime = 0; // Удаляем часть воздушных частиц
                    }
                } else {
                    // Твердые материалы просто отражаются
                    p.y = this.position.y + this.height - p.radius;
                    p.vy = -p.vy * 0.5;
                }
            }

            // Ограничение максимальной скорости для стабильности
            const maxSpeed = 200;
            const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (currentSpeed > maxSpeed) {
                p.vx = (p.vx / currentSpeed) * maxSpeed;
                p.vy = (p.vy / currentSpeed) * maxSpeed;
            }
        }

        /**
         * Обработка столкновений между частицами
         */
        private handleParticleCollisions(dt: number): void {
            // Простой алгоритм для обработки столкновений
            // В реальном проекте лучше использовать пространственное хеширование или quadtree
            for (let i = 0; i < this.particles.length; i++) {
                const p1 = this.particles[i];

                // Пропускаем частицы с нулевым или отрицательным сроком жизни
                if (p1.lifetime <= 0) continue;

                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];

                    // Пропускаем частицы с нулевым или отрицательным сроком жизни
                    if (p2.lifetime <= 0) continue;

                    // Расчет расстояния между частицами
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const distanceSquared = dx * dx + dy * dy;
                    const minDistance = p1.radius + p2.radius;

                    // Проверка на столкновение
                    if (distanceSquared < minDistance * minDistance) {
                        const distance = Math.sqrt(distanceSquared);
                        const overlap = (minDistance - distance) * 0.5;

                        // Избегаем деления на ноль
                        if (distance === 0) continue;

                        // Нормализованный вектор направления
                        const nx = dx / distance;
                        const ny = dy / distance;

                        // Разрешение перекрытия
                        p1.x -= overlap * nx;
                        p1.y -= overlap * ny;
                        p2.x += overlap * nx;
                        p2.y += overlap * ny;

                        // Эффект столкновения зависит от фаз частиц
                        this.resolveCollision(p1, p2, nx, ny, dt);

                        // Теплообмен между частицами
                        this.handleHeatExchange(p1, p2, dt);
                    }
                }
            }
        }

        /**
         * Разрешение столкновения между двумя частицами
         */
        private resolveCollision(p1: MaterialParticle, p2: MaterialParticle, nx: number, ny: number, dt: number): void {
            // Не обрабатываем столкновения газов с газами для оптимизации
            if (p1.phase === PhaseState.GAS && p2.phase === PhaseState.GAS) {
                return;
            }

            // Расчет относительной скорости
            const vx = p2.vx - p1.vx;
            const vy = p2.vy - p1.vy;

            // Проекция относительной скорости на нормаль столкновения
            const relativeVelocity = vx * nx + vy * ny;

            // Если частицы удаляются друг от друга, ничего не делаем
            if (relativeVelocity > 0) return;

            // Расчет коэффициента упругости в зависимости от фаз
            let elasticity = 0.8; // По умолчанию

            // Корректировка упругости в зависимости от фаз
            if (p1.phase === PhaseState.SOLID && p2.phase === PhaseState.SOLID) {
                elasticity = 0.8; // Твердые тела - достаточно упругие
            } else if (p1.phase === PhaseState.LIQUID && p2.phase === PhaseState.LIQUID) {
                elasticity = 0.3; // Жидкости - менее упругие
            } else if ((p1.phase === PhaseState.LIQUID && p2.phase === PhaseState.SOLID) ||
                (p1.phase === PhaseState.SOLID && p2.phase === PhaseState.LIQUID)) {
                elasticity = 0.5; // Смешанные столкновения
            } else if (p1.phase === PhaseState.GAS || p2.phase === PhaseState.GAS) {
                elasticity = 0.2; // Газы - очень малая упругость
            }

            // Расчет импульса
            let j = -(1 + elasticity) * relativeVelocity;
            j /= 1/p1.mass + 1/p2.mass;

            // Применение импульса
            const impulseX = j * nx / dt;
            const impulseY = j * ny / dt;

            // Обновление скоростей (обратно пропорционально массам)
            p1.vx -= impulseX / p1.mass;
            p1.vy -= impulseY / p1.mass;
            p2.vx += impulseX / p2.mass;
            p2.vy += impulseY / p2.mass;

            // Дополнительное затухание для жидкостей
            if (p1.phase === PhaseState.LIQUID) {
                p1.vx *= 0.98;
                p1.vy *= 0.98;
            }
            if (p2.phase === PhaseState.LIQUID) {
                p2.vx *= 0.98;
                p2.vy *= 0.98;
            }
        }

        /**
         * Обработка теплообмена между частицами
         */
        private handleHeatExchange(p1: MaterialParticle, p2: MaterialParticle, dt: number): void {
            // Расчет разницы температур
            const tempDiff = p2.temperature - p1.temperature;

            // Определение коэффициента теплообмена в зависимости от материалов
            let conductivity1, conductivity2;

            // Определение теплопроводности для первой частицы
            switch (p1.materialType) {
                case MaterialType.WATER:
                    conductivity1 = p1.phase === PhaseState.SOLID
                        ? PhysicalConstants.THERMAL_CONDUCTIVITY.ICE
                        : p1.phase === PhaseState.LIQUID
                            ? PhysicalConstants.THERMAL_CONDUCTIVITY.WATER
                            : PhysicalConstants.THERMAL_CONDUCTIVITY.STEAM;
                    break;
                case MaterialType.AIR:
                    conductivity1 = PhysicalConstants.THERMAL_CONDUCTIVITY.AIR;
                    break;
                case MaterialType.METAL:
                    conductivity1 = PhysicalConstants.THERMAL_CONDUCTIVITY.METAL;
                    break;
                case MaterialType.ROCK:
                    conductivity1 = PhysicalConstants.THERMAL_CONDUCTIVITY.ROCK;
                    break;
                default:
                    conductivity1 = PhysicalConstants.THERMAL_CONDUCTIVITY.AIR;
            }

            // Определение теплопроводности для второй частицы
            switch (p2.materialType) {
                case MaterialType.WATER:
                    conductivity2 = p2.phase === PhaseState.SOLID
                        ? PhysicalConstants.THERMAL_CONDUCTIVITY.ICE
                        : p2.phase === PhaseState.LIQUID
                            ? PhysicalConstants.THERMAL_CONDUCTIVITY.WATER
                            : PhysicalConstants.THERMAL_CONDUCTIVITY.STEAM;
                    break;
                case MaterialType.AIR:
                    conductivity2 = PhysicalConstants.THERMAL_CONDUCTIVITY.AIR;
                    break;
                case MaterialType.METAL:
                    conductivity2 = PhysicalConstants.THERMAL_CONDUCTIVITY.METAL;
                    break;
                case MaterialType.ROCK:
                    conductivity2 = PhysicalConstants.THERMAL_CONDUCTIVITY.ROCK;
                    break;
                default:
                    conductivity2 = PhysicalConstants.THERMAL_CONDUCTIVITY.AIR;
            }

            // Средняя теплопроводность
            const avgConductivity = (conductivity1 + conductivity2) * 0.5;

            // Коэффициент теплообмена
            const heatExchangeRate = avgConductivity * 0.005 * dt;

            // Ограничиваем скорость теплообмена
            const maxEnergyExchange = Math.abs(tempDiff) * Math.min(p1.mass, p2.mass) * 0.5;

            // Выбор удельной теплоемкости для первой частицы
            let specificHeat1;
            switch (p1.materialType) {
                case MaterialType.WATER:
                    specificHeat1 = p1.phase === PhaseState.SOLID
                        ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE
                        : p1.phase === PhaseState.LIQUID
                            ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER
                            : PhysicalConstants.SPECIFIC_HEAT_CAPACITY.STEAM;
                    break;
                case MaterialType.AIR:
                    specificHeat1 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR;
                    break;
                case MaterialType.METAL:
                    specificHeat1 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.METAL;
                    break;
                case MaterialType.ROCK:
                    specificHeat1 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ROCK;
                    break;
                default:
                    specificHeat1 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR;
            }

            // Выбор удельной теплоемкости для второй частицы
            let specificHeat2;
            switch (p2.materialType) {
                case MaterialType.WATER:
                    specificHeat2 = p2.phase === PhaseState.SOLID
                        ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE
                        : p2.phase === PhaseState.LIQUID
                            ? PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER
                            : PhysicalConstants.SPECIFIC_HEAT_CAPACITY.STEAM;
                    break;
                case MaterialType.AIR:
                    specificHeat2 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR;
                    break;
                case MaterialType.METAL:
                    specificHeat2 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.METAL;
                    break;
                case MaterialType.ROCK:
                    specificHeat2 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ROCK;
                    break;
                default:
                    specificHeat2 = PhysicalConstants.SPECIFIC_HEAT_CAPACITY.AIR;
            }

            // Расчет энергии для передачи
            const energyTransfer = tempDiff * heatExchangeRate * Math.min(p1.mass * specificHeat1, p2.mass * specificHeat2);

            // Обновление энергии частиц
            p1.energy += energyTransfer;
            p2.energy -= energyTransfer;

            // Обновление температуры
            p1.temperature = this.calculateTemperatureFromEnergy(p1);
            p2.temperature = this.calculateTemperatureFromEnergy(p2);

            // Обновление цвета для частиц воды
            if (p1.materialType === MaterialType.WATER) {
                p1.color = this.getWaterColorByTemperature(p1.temperature, p1.phase);
            }
            if (p2.materialType === MaterialType.WATER) {
                p2.color = this.getWaterColorByTemperature(p2.temperature, p2.phase);
            }
        }

        /**
         * Обработка фазовых переходов вещества
         */
        private handlePhaseTransitions(dt: number): void {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Пропускаем обработку для не-водных частиц
                if (p.materialType !== MaterialType.WATER) continue;

                // Пропускаем частицы с нулевым сроком жизни
                if (p.lifetime <= 0) continue;

                const previousPhase = p.phase;

                // Обработка изменения фазы в зависимости от температуры
                if (p.temperature <= PhysicalConstants.WATER_FREEZING_POINT) {
                    // Переход в твердое состояние
                    if (p.phase !== PhaseState.SOLID) {
                        p.phase = PhaseState.SOLID;

                        // Изменение физических свойств
                        p.radius *= 1.1; // Лед немного расширяется
                        p.mass = p.radius * p.radius * Math.PI * PhysicalConstants.DENSITY.ICE * 0.01;

                        // Уменьшение скорости при замерзании
                        p.vx *= 0.2;
                        p.vy *= 0.2;
                    }
                } else if (p.temperature >= PhysicalConstants.WATER_BOILING_POINT) {
                    // Переход в газообразное состояние
                    if (p.phase !== PhaseState.GAS && this.enableVaporation) {
                        // Проверка на испарение - вероятностная
                        const vaporizationProbability =
                            (p.temperature - PhysicalConstants.WATER_BOILING_POINT) / 30 * dt;

                        if (Math.random() < vaporizationProbability) {
                            p.phase = PhaseState.GAS;

                            // Испарение - изменение физических свойств
                            const expansionFactor = 2 + Math.random();
                            p.radius *= expansionFactor;
                            p.mass = p.radius * p.radius * Math.PI * PhysicalConstants.DENSITY.STEAM * 0.01;

                            // Добавление направленной вверх скорости
                            p.vy -= (5 + Math.random() * 10);
                            p.vx += (Math.random() - 0.5) * 10;

                            // Ограниченное время жизни для пара
                            p.lifetime = 10 + Math.random() * 20;
                            p.maxLifetime = p.lifetime;
                        }
                    }
                } else {
                    // Температура в диапазоне для жидкого состояния
                    if (p.phase !== PhaseState.LIQUID) {
                        // Переход в жидкое состояние
                        if (p.phase === PhaseState.SOLID) {
                            // Таяние
                            p.radius /= 1.1; // Обратное изменение размера
                            p.mass = p.radius * p.radius * Math.PI * PhysicalConstants.DENSITY.WATER * 0.01;
                        } else if (p.phase === PhaseState.GAS && this.enableCondensation) {
                            // Конденсация
                            const condensationFactor = 0.5;
                            p.radius *= condensationFactor;
                            p.mass = p.radius * p.radius * Math.PI * PhysicalConstants.DENSITY.WATER * 0.01;
                            p.lifetime = Infinity; // Сброс срока жизни
                            p.maxLifetime = Infinity;
                        }

                        p.phase = PhaseState.LIQUID;
                    }
                }

                // Отображаем изменение цвета при фазовом переходе
                if (previousPhase !== p.phase) {
                    p.color = this.getWaterColorByTemperature(p.temperature, p.phase);
                }
            }
        }

        /**
         * Обновление воздушных частиц и моделирование парообразования/конденсации
         */
        private updateAirAndVapor(dt: number): void {
            // Создание новых частиц воздуха для поддержания их количества
            const minAirParticles = Math.floor(this.particleCount * 0.2);
            const currentAirParticles = this.particles.filter(p =>
                p.materialType === MaterialType.AIR && p.lifetime > 0
            ).length;

            // Добавляем новые частицы воздуха, если их недостаточно
            if (currentAirParticles < minAirParticles && Math.random() < 0.3 * dt) {
                this.addParticle(MaterialType.AIR, true);
            }

            // Проверка испарения для частиц жидкости, которые еще не закипели
            if (this.enableVaporation) {
                for (const p of this.particles) {
                    if (p.materialType === MaterialType.WATER && p.phase === PhaseState.LIQUID && p.lifetime > 0) {
                        // Вероятность испарения от поверхности (выше для горячей воды)
                        const surfaceEvaporationProbability =
                            Math.pow((p.temperature - this.ambientTemperature) / 100, 2) * 0.02 * dt;

                        if (Math.random() < surfaceEvaporationProbability) {
                            // Создаем частицу пара
                            const vaporX = p.x + (Math.random() - 0.5) * p.radius;
                            const vaporY = p.y - p.radius;
                            const vaporRadius = p.radius * (1.5 + Math.random());
                            const vaporMass = vaporRadius * vaporRadius * Math.PI * PhysicalConstants.DENSITY.STEAM * 0.01;

                            // Передача части энергии от жидкости к пару
                            const vaporEnergy = Math.min(
                                p.energy * 0.1,
                                vaporMass * (
                                    PhysicalConstants.SPECIFIC_HEAT_CAPACITY.ICE * PhysicalConstants.WATER_FREEZING_POINT +
                                    PhysicalConstants.LATENT_HEAT.WATER_FREEZING +
                                    PhysicalConstants.SPECIFIC_HEAT_CAPACITY.WATER * (PhysicalConstants.WATER_BOILING_POINT - PhysicalConstants.WATER_FREEZING_POINT) +
                                    PhysicalConstants.LATENT_HEAT.WATER_BOILING +
                                    PhysicalConstants.SPECIFIC_HEAT_CAPACITY.STEAM * 10
                                )
                            );

                            // Уменьшение энергии частицы жидкости
                            p.energy -= vaporEnergy;
                            p.temperature = this.calculateTemperatureFromEnergy(p);
                            p.color = this.getWaterColorByTemperature(p.temperature, p.phase);

                            // Создаем частицу пара
                            const vapor: MaterialParticle = {
                                x: vaporX,
                                y: vaporY,
                                vx: p.vx + (Math.random() - 0.5) * 5,
                                vy: p.vy - 20 - Math.random() * 10,
                                radius: vaporRadius,
                                mass: vaporMass,
                                temperature: PhysicalConstants.WATER_BOILING_POINT + 10,
                                phase: PhaseState.GAS,
                                materialType: MaterialType.WATER,
                                lifetime: 5 + Math.random() * 10,
                                maxLifetime: 5 + Math.random() * 10,
                                energy: vaporEnergy,
                                color: this.getWaterColorByTemperature(PhysicalConstants.WATER_BOILING_POINT + 10, PhaseState.GAS)
                            };

                            this.particles.push(vapor);
                        }
                    }
                }
            }

            // Проверка конденсации для частиц пара
            if (this.enableCondensation) {
                for (const p of this.particles) {
                    if (p.materialType === MaterialType.WATER && p.phase === PhaseState.GAS && p.lifetime > 0) {
                        // Вероятность конденсации (выше для холодного пара)
                        const condensationProbability =
                            Math.pow((PhysicalConstants.WATER_BOILING_POINT - p.temperature) / 50, 2) * 0.03 * dt;

                        if (Math.random() < condensationProbability) {
                            // Изменение фазы
                            p.phase = PhaseState.LIQUID;

                            // Изменение свойств
                            p.radius /= 2;
                            p.mass = p.radius * p.radius * Math.PI * PhysicalConstants.DENSITY.WATER * 0.01;
                            p.lifetime = Infinity;
                            p.maxLifetime = Infinity;

// Обновление цвета
                            p.color = this.getWaterColorByTemperature(p.temperature, p.phase);

                            // Добавление гравитации
                            p.vy += 20; // Капля начинает падать
                        }
                    }
                }
            }
        }

        /**
         * Управление жизненным циклом частиц
         */
        private manageParticleLifecycles(dt: number): void {
            // Удаление мертвых частиц
            this.particles = this.particles.filter(p => p.lifetime > 0);

            // Обновление интенсивности цвета для умирающих частиц
            for (const p of this.particles) {
                if (p.lifetime !== Infinity && p.maxLifetime !== Infinity) {
                    const lifeRatio = p.lifetime / p.maxLifetime;

                    // Обновляем прозрачность цвета
                    const currentColor = p.color;
                    const rgbaMatch = currentColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);

                    if (rgbaMatch) {
                        const r = parseInt(rgbaMatch[1], 10);
                        const g = parseInt(rgbaMatch[2], 10);
                        const b = parseInt(rgbaMatch[3], 10);
                        const updatedAlpha = parseFloat(rgbaMatch[4]) * lifeRatio;

                        p.color = `rgba(${r}, ${g}, ${b}, ${updatedAlpha})`;
                    }
                }
            }

            // Добавление новых частиц воды с определенной скоростью (с учетом flowRate)
            if (this.flowRate > 0) {
                const particlesToAdd = Math.floor(this.flowRate * dt);

                for (let i = 0; i < particlesToAdd; i++) {
                    // Добавляем новые частицы только если общее количество ниже максимального
                    if (this.particles.length < this.particleCount * 1.5) {
                        this.addParticle(MaterialType.WATER);
                    }
                }
            }
        }

        /**
         * Установка параметров симуляции
         */
        public setParameters(params: {
            flowRate?: number,
            gravity?: number,
            ambientTemperature?: number,
            windDirection?: Vector,
            windStrength?: number,
            enableTurbulence?: boolean,
            enableVaporation?: boolean,
            enableCondensation?: boolean,
            enableSurfaceTension?: boolean,
            useAdvancedRendering?: boolean
        }): void {
            if (params.flowRate !== undefined) this.flowRate = params.flowRate;
            if (params.gravity !== undefined) this.gravity = params.gravity;
            if (params.ambientTemperature !== undefined) this.ambientTemperature = params.ambientTemperature;
            if (params.windDirection !== undefined) this.windDirection = params.windDirection;
            if (params.windStrength !== undefined) this.windStrength = params.windStrength;
            if (params.enableTurbulence !== undefined) this.enableTurbulence = params.enableTurbulence;
            if (params.enableVaporation !== undefined) this.enableVaporation = params.enableVaporation;
            if (params.enableCondensation !== undefined) this.enableCondensation = params.enableCondensation;
            if (params.enableSurfaceTension !== undefined) this.enableSurfaceTension = params.enableSurfaceTension;
            if (params.useAdvancedRendering !== undefined) this.useAdvancedRendering = params.useAdvancedRendering;
        }

        /**
         * Добавление источника тепла в симуляцию
         */
        public addHeatSource(x: number, y: number, radius: number, temperature: number): void {
            const obstacle = new ThermalObstacle(x, y, radius, temperature);
            this.obstacles.push(obstacle);
        }

        /**
         * Добавить ветер в определенном направлении
         */
        public addWind(direction: Vector, strength: number): void {
            this.windDirection = {
                x: direction.x / Math.sqrt(direction.x * direction.x + direction.y * direction.y),
                y: direction.y / Math.sqrt(direction.x * direction.x + direction.y * direction.y)
            };
            this.windStrength = strength;
        }

        /**
         * Рендеринг симуляции
         */
        public render(ctx: CanvasRenderingContext2D): void {
            // Очистка канваса
            ctx.clearRect(this.position.x, this.position.y, this.width, this.height);

            // Рисуем границы симуляции
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

            // Визуализация термальной сетки, если включен продвинутый рендеринг
            if (this.useAdvancedRendering) {
                this.renderThermalGrid(ctx);
            }

            // Рисуем препятствия
            for (const obstacle of this.obstacles) {
                obstacle.render(ctx);
            }

            // Сортируем частицы по слоям для лучшего визуального эффекта
            // Сначала рисуем газы, затем жидкости, затем твердые тела
            const sortedParticles = [...this.particles].sort((a, b) => {
                if (a.phase === b.phase) {
                    return a.y - b.y; // Сортируем по глубине в рамках одной фазы
                }
                return a.phase - b.phase; // Сортируем по фазам
            });

            // Рисуем частицы
            for (const particle of sortedParticles) {
                // Пропускаем частицы с нулевым сроком жизни
                if (particle.lifetime <= 0) continue;

                ctx.fillStyle = particle.color;

                // Разное отображение в зависимости от фазы и типа материала
                if (this.useAdvancedRendering) {
                    this.renderAdvancedParticle(ctx, particle);
                } else {
                    // Простой рендеринг - круги
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Отображение индикатора направления ветра
            if (this.windStrength > 0) {
                this.renderWindIndicator(ctx);
            }
        }

        /**
         * Продвинутый рендеринг частицы
         */
        private renderAdvancedParticle(ctx: CanvasRenderingContext2D, p: MaterialParticle): void {
            switch (p.phase) {
                case PhaseState.SOLID:
                    // Для твердых тел - многоугольники с небольшими нерегулярностями
                    ctx.beginPath();
                    const sides = 6; // Гексагон для льда
                    ctx.moveTo(
                        p.x + p.radius * Math.cos(0),
                        p.y + p.radius * Math.sin(0)
                    );

                    for (let i = 1; i <= sides; i++) {
                        const angle = (i / sides) * Math.PI * 2;
                        const jitter = 0.15; // Небольшие нерегулярности для кристаллической структуры
                        const r = p.radius * (1 + (Math.random() - 0.5) * jitter);

                        ctx.lineTo(
                            p.x + r * Math.cos(angle),
                            p.y + r * Math.sin(angle)
                        );
                    }

                    ctx.closePath();
                    ctx.fill();

                    // Добавляем блики для льда
                    if (p.materialType === MaterialType.WATER) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.beginPath();
                        ctx.arc(
                            p.x - p.radius * 0.3,
                            p.y - p.radius * 0.3,
                            p.radius * 0.2,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                    break;

                case PhaseState.LIQUID:
                    // Для жидкостей - плавные капли с визуальными эффектами
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Добавляем блики для воды
                    if (p.materialType === MaterialType.WATER) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.beginPath();
                        ctx.arc(
                            p.x - p.radius * 0.3,
                            p.y - p.radius * 0.3,
                            p.radius * 0.3,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                    break;

                case PhaseState.GAS:
                    // Для газов - размытые облака
                    const gradient = ctx.createRadialGradient(
                        p.x, p.y, 0,
                        p.x, p.y, p.radius
                    );

                    // Извлекаем цвет из строки RGBA
                    const colorMatch = p.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                    if (colorMatch) {
                        const r = parseInt(colorMatch[1], 10);
                        const g = parseInt(colorMatch[2], 10);
                        const b = parseInt(colorMatch[3], 10);
                        const a = parseFloat(colorMatch[4]);

                        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
                        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Запасной вариант, если не удалось извлечь цвет
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
            }
        }

        /**
         * Рендеринг термальной сетки
         */
        private renderThermalGrid(ctx: CanvasRenderingContext2D): void {
            const cols = Math.ceil(this.width / this.thermalGridSize);
            const rows = Math.ceil(this.height / this.thermalGridSize);

            // Настройка прозрачности для термальной сетки
            ctx.globalAlpha = 0.1;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const temp = this.thermalGrid[i][j];
                    let color;

                    if (temp < this.ambientTemperature - 10) {
                        // Холодная зона - синий
                        const coldness = Math.min(1, (this.ambientTemperature - temp) / 50);
                        color = `rgb(${Math.floor(255 * (1 - coldness))}, ${Math.floor(255 * (1 - coldness))}, 255)`;
                    } else if (temp > this.ambientTemperature + 10) {
                        // Горячая зона - красный
                        const hotness = Math.min(1, (temp - this.ambientTemperature) / 50);
                        color = `rgb(255, ${Math.floor(255 * (1 - hotness))}, ${Math.floor(255 * (1 - hotness))})`;
                    } else {
                        // Нейтральная зона - прозрачный
                        continue;
                    }

                    ctx.fillStyle = color;
                    ctx.fillRect(
                        this.position.x + j * this.thermalGridSize,
                        this.position.y + i * this.thermalGridSize,
                        this.thermalGridSize,
                        this.thermalGridSize
                    );
                }
            }

            // Восстанавливаем прозрачность
            ctx.globalAlpha = 1.0;
        }

        /**
         * Рендеринг индикатора ветра
         */
        private renderWindIndicator(ctx: CanvasRenderingContext2D): void {
            const startX = this.position.x + 20;
            const startY = this.position.y + 20;
            const length = 30 * (this.windStrength / 10);

            ctx.strokeStyle = 'rgba(150, 150, 200, 0.7)';
            ctx.lineWidth = 2;

            // Стрелка
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + length * this.windDirection.x, startY + length * this.windDirection.y);
            ctx.stroke();

            // Наконечник стрелки
            const headSize = 6;
            const angle = Math.atan2(this.windDirection.y, this.windDirection.x);

            ctx.beginPath();
            ctx.moveTo(startX + length * this.windDirection.x, startY + length * this.windDirection.y);
            ctx.lineTo(
                startX + length * this.windDirection.x - headSize * Math.cos(angle - Math.PI / 6),
                startY + length * this.windDirection.y - headSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                startX + length * this.windDirection.x - headSize * Math.cos(angle + Math.PI / 6),
                startY + length * this.windDirection.y - headSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = 'rgba(150, 150, 200, 0.7)';
            ctx.fill();
        }

        /**
         * Проверка, находится ли точка внутри области симуляции
         */
        public isPointInside(x: number, y: number): boolean {
            return x >= this.position.x && x <= this.position.x + this.width &&
                y >= this.position.y && y <= this.position.y + this.height;
        }

        /**
         * Получение информации о состоянии симуляции
         */
        public getStats(): any {
            const waterParticles = this.particles.filter(p => p.materialType === MaterialType.WATER);
            const airParticles = this.particles.filter(p => p.materialType === MaterialType.AIR);

            const iceCnt = waterParticles.filter(p => p.phase === PhaseState.SOLID).length;
            const liquidCnt = waterParticles.filter(p => p.phase === PhaseState.LIQUID).length;
            const vaporCnt = waterParticles.filter(p => p.phase === PhaseState.GAS).length;

            const avgTemp = this.particles.reduce((sum, p) => sum + p.temperature, 0) / this.particles.length;

            return {
                particleCount: this.particles.length,
                waterParticles: waterParticles.length,
                airParticles: airParticles.length,
                iceCount: iceCnt,
                liquidCount: liquidCnt,
                vaporCount: vaporCnt,
                averageTemperature: avgTemp,
                ambientTemperature: this.ambientTemperature,
                flowRate: this.flowRate,
                gravity: this.gravity
            };
        }

        /**
         * Добавление или удаление частиц вручную
         */
        public addParticlesAt(x: number, y: number, count: number, materialType: MaterialType, initialTemperature?: number): void {
            for (let i = 0; i < count; i++) {
                const radius = materialType === MaterialType.WATER ?
                    (2 + Math.random() * 2) :
                    (1 + Math.random());

                const mass = radius * radius * Math.PI *
                    (materialType === MaterialType.WATER ?
                        PhysicalConstants.DENSITY.WATER :
                        materialType === MaterialType.AIR ?
                            PhysicalConstants.DENSITY.AIR :
                            materialType === MaterialType.METAL ?
                                PhysicalConstants.DENSITY.METAL :
                                PhysicalConstants.DENSITY.ROCK) * 0.01;

                const temperature = initialTemperature !== undefined ?
                    initialTemperature : this.ambientTemperature;

                // Определение фазы на основе температуры
                let phase: PhaseState;
                if (materialType === MaterialType.WATER) {
                    if (temperature <= PhysicalConstants.WATER_FREEZING_POINT) {
                        phase = PhaseState.SOLID;
                    } else if (temperature >= PhysicalConstants.WATER_BOILING_POINT) {
                        phase = PhaseState.GAS;
                    } else {
                        phase = PhaseState.LIQUID;
                    }
                } else if (materialType === MaterialType.AIR) {
                    phase = PhaseState.GAS;
                } else {
                    phase = PhaseState.SOLID;
                }

                // Расчет энергии
                const energy = this.calculateInternalEnergy(mass, temperature, phase, materialType);

                // Определение цвета
                let color: string;
                if (materialType === MaterialType.WATER) {
                    color = this.getWaterColorByTemperature(temperature, phase);
                } else if (materialType === MaterialType.AIR) {
                    color = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.05})`;
                } else if (materialType === MaterialType.METAL) {
                    color = `rgba(180, 180, 180, 0.9)`;
                } else {
                    color = `rgba(150, 120, 100, 0.9)`;
                }

                // Определение времени жизни
                const lifetime = materialType === MaterialType.AIR ||
                (materialType === MaterialType.WATER && phase === PhaseState.GAS) ?
                    60 + Math.random() * 60 : Infinity;

                // Создание частицы
                const particle: MaterialParticle = {
                    x: x + (Math.random() - 0.5) * 10,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    radius,
                    mass,
                    temperature,
                    phase,
                    materialType,
                    lifetime,
                    maxLifetime: lifetime,
                    energy,
                    color
                };

                this.particles.push(particle);
            }
        }
    }

    /**
     * Базовый класс для препятствий в симуляции
     */
    export abstract class Obstacle extends SimulationObject {
        protected radius: number;

        constructor(x: number, y: number, radius: number) {
            super(x, y);
            this.radius = radius;
        }

        public abstract collidesWith(x: number, y: number, particleRadius: number): boolean;
        public abstract getNormalAt(x: number, y: number): Vector;
    }

    /**
     * Препятствие с термальными свойствами
     */
    export class ThermalObstacle extends Obstacle {
        private temperature: number;
        private heatCapacity: number;
        private color: string;

        constructor(x: number, y: number, radius: number, initialTemperature: number = PhysicalConstants.ROOM_TEMPERATURE, heatCapacity: number = 100) {
            super(x, y, radius);
            this.temperature = initialTemperature;
            this.heatCapacity = heatCapacity;
            this.updateColor();
        }

        private updateColor(): void {
            // Цвет зависит от температуры
            if (this.temperature < PhysicalConstants.WATER_FREEZING_POINT) {
                // Холодное - синее
                const coldness = Math.min(1, (PhysicalConstants.WATER_FREEZING_POINT - this.temperature) / 100);
                this.color = `rgba(${Math.floor(100 * (1 - coldness))}, ${Math.floor(150 * (1 - coldness))}, 255, 0.7)`;
            } else if (this.temperature < PhysicalConstants.ROOM_TEMPERATURE + 20) {
                // Нейтральное - серое
                this.color = `rgba(150, 150, 150, 0.7)`;
            } else {
                // Горячее - красное
                const hotness = Math.min(1, (this.temperature - PhysicalConstants.ROOM_TEMPERATURE) / 100);
                this.color = `rgba(255, ${Math.floor(150 * (1 - hotness))}, ${Math.floor(100 * (1 - hotness))}, 0.7)`;
            }
        }

        public getTemperature(): number {
            return this.temperature;
        }

        public setTemperature(temperature: number): void {
            this.temperature = temperature;
            this.updateColor();
        }

        public transferHeat(energy: number): void {
            // Изменение температуры в зависимости от переданной энергии
            this.temperature += energy / this.heatCapacity;
            this.updateColor();
        }

        public update(deltaTime: number): void {
            // Медленный возврат к комнатной температуре, если нет внешних источников тепла
            const tempDiff = PhysicalConstants.ROOM_TEMPERATURE - this.temperature;
            this.temperature += tempDiff * 0.01 * deltaTime;
            this.updateColor();
        }

        public render(ctx: CanvasRenderingContext2D): void {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Рисуем индикатор температуры
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(this.temperature) + '°C', this.position.x, this.position.y + 4);
        }

        public collidesWith(x: number, y: number, particleRadius: number): boolean {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance < this.radius + particleRadius;
        }

        public getNormalAt(x: number, y: number): Vector {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Избегаем деления на ноль
            if (distance === 0) {
                return { x: 0, y: -1 };
            }

            return {
                x: dx / distance,
                y: dy / distance
            };
        }

        public isPointInside(x: number, y: number): boolean {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            const distanceSquared = dx * dx + dy * dy;

            return distanceSquared <= this.radius * this.radius;
        }
    }
}

/**
 * Класс для управления симуляцией и пользовательским взаимодействием
 */
export class FluidsSimulationManager {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private simulation: AdvancedFluids.ThermodynamicFluidFlow;
    private lastTime: number = 0;
    private isRunning: boolean = false;
    private uiElements: Map<string, HTMLElement> = new Map();

    constructor(canvasId: string, width: number, height: number) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = this.canvas.height = width;
        this.ctx = this.canvas.getContext('2d')!;

        // Создаем симуляцию
        this.simulation = new AdvancedFluids.ThermodynamicFluidFlow(0, 0, width, height);

        // Настройка обработчиков событий
        this.setupEventListeners();

        // Настройка пользовательского интерфейса
        this.setupUI();
    }

    private setupEventListeners(): void {
        // Обработка кликов мыши для добавления воды или тепловых источников
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Получаем режим взаимодействия из UI
            const interactionMode = (this.uiElements.get('interactionSelect') as HTMLSelectElement).value;

            switch (interactionMode) {
                case 'addWater':
                    this.simulation.addParticlesAt(x, y, 10, MaterialType.WATER);
                    break;
                case 'addIce':
                    this.simulation.addParticlesAt(x, y, 10, MaterialType.WATER, -10);
                    break;
                case 'addSteam':
                    this.simulation.addParticlesAt(x, y, 10, MaterialType.WATER, 110);
                    break;
                case 'addHeatSource':
                    this.simulation.addHeatSource(x, y, 20, 150);
                    break;
                case 'addColdSource':
                    this.simulation.addHeatSource(x, y, 20, -20);
                    break;
            }
        });

        // Обработка изменений параметров симуляции через UI
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Добавляем ветер в направлении от центра экрана к точке клика
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;

            const dx = x - centerX;
            const dy = y - centerY;

            // Нормализация вектора
            const length = Math.sqrt(dx * dx + dy * dy);

            this.simulation.addWind(
                { x: dx / length, y: dy / length },
                5 // Сила ветра
            );
        });
    }

    private setupUI(): void {
        // Создаем контейнер для UI
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '10px';
        uiContainer.style.left = '10px';
        uiContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        uiContainer.style.padding = '10px';
        uiContainer.style.borderRadius = '5px';

        // Создаем кнопки и элементы управления
        const startStopButton = document.createElement('button');
        startStopButton.textContent = 'Start';
        startStopButton.onclick = () => this.toggleSimulation();
        uiContainer.appendChild(startStopButton);
        this.uiElements.set('startStopButton', startStopButton);

        uiContainer.appendChild(document.createElement('br'));

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.onclick = () => this.resetSimulation();
        uiContainer.appendChild(resetButton);

        uiContainer.appendChild(document.createElement('br'));

        // Выбор режима взаимодействия
        const interactionLabel = document.createElement('label');
        interactionLabel.textContent = 'Interaction: ';
        uiContainer.appendChild(interactionLabel);

        const interactionSelect = document.createElement('select');
        const options = [
            { value: 'addWater', text: 'Add Water' },
            { value: 'addIce', text: 'Add Ice' },
            { value: 'addSteam', text: 'Add Steam' },
            { value: 'addHeatSource', text: 'Add Heat Source' },
            { value: 'addColdSource', text: 'Add Cold Source' }
        ];

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            interactionSelect.appendChild(optionElement);
        });

        uiContainer.appendChild(interactionSelect);
        this.uiElements.set('interactionSelect', interactionSelect);

        uiContainer.appendChild(document.createElement('br'));

        // Слайдер для окружающей температуры
        const tempLabel = document.createElement('label');
        tempLabel.textContent = 'Ambient Temperature: ';
        uiContainer.appendChild(tempLabel);

        const tempSlider = document.createElement('input');
        tempSlider.type = 'range';
        tempSlider.min = '-20';
        tempSlider.max = '40';
        tempSlider.value = '20';
        tempSlider.oninput = () => {
            this.simulation.setParameters({
                ambientTemperature: parseInt(tempSlider.value)
            });
            tempValue.textContent = tempSlider.value + '°C';
        };

        uiContainer.appendChild(tempSlider);

        const tempValue = document.createElement('span');
        tempValue.textContent = '20°C';
        tempValue.style.marginLeft = '10px';
        uiContainer.appendChild(tempValue);

        uiContainer.appendChild(document.createElement('br'));

        // Слайдер для силы гравитации
        const gravityLabel = document.createElement('label');
        gravityLabel.textContent = 'Gravity: ';
        uiContainer.appendChild(gravityLabel);

        const gravitySlider = document.createElement('input');
        gravitySlider.type = 'range';
        gravitySlider.min = '0';
        gravitySlider.max = '20';
        gravitySlider.value = '9.8';
        gravitySlider.oninput = () => {
            this.simulation.setParameters({
                gravity: parseFloat(gravitySlider.value)
            });
            gravityValue.textContent = gravitySlider.value;
        };

        uiContainer.appendChild(gravitySlider);

        const gravityValue = document.createElement('span');
        gravityValue.textContent = '9.8';
        gravityValue.style.marginLeft = '10px';
        uiContainer.appendChild(gravityValue);

        uiContainer.appendChild(document.createElement('br'));

        // Переключатель для продвинутого рендеринга
        const renderingLabel = document.createElement('label');
        renderingLabel.textContent = 'Advanced Rendering: ';
        uiContainer.appendChild(renderingLabel);

        const renderingCheckbox = document.createElement('input');
        renderingCheckbox.type = 'checkbox';
        renderingCheckbox.checked = true;
        renderingCheckbox.onchange = () => {
            this.simulation.setParameters({
                useAdvancedRendering: renderingCheckbox.checked
            });
        };

        uiContainer.appendChild(renderingCheckbox);

        uiContainer.appendChild(document.createElement('br'));

        // Переключатель для испарения и конденсации
        const evaporationLabel = document.createElement('label');
        evaporationLabel.textContent = 'Enable Evaporation: ';
        uiContainer.appendChild(evaporationLabel);

        const evaporationCheckbox = document.createElement('input');
        evaporationCheckbox.type = 'checkbox';
        evaporationCheckbox.checked = true;
        evaporationCheckbox.onchange = () => {
            this.simulation.setParameters({
                enableVaporation: evaporationCheckbox.checked
            });
        };

        uiContainer.appendChild(evaporationCheckbox);

        uiContainer.appendChild(document.createElement('br'));

        const condensationLabel = document.createElement('label');
        condensationLabel.textContent = 'Enable Condensation: ';
        uiContainer.appendChild(condensationLabel);

        const condensationCheckbox = document.createElement('input');
        condensationCheckbox.type = 'checkbox';
        condensationCheckbox.checked = true;
        condensationCheckbox.onchange = () => {
            this.simulation.setParameters({
                enableCondensation: condensationCheckbox.checked
            });
        };

        uiContainer.appendChild(condensationCheckbox);

        uiContainer.appendChild(document.createElement('br'));

        // Слайдер для скорости потока
        const flowLabel = document.createElement('label');
        flowLabel.textContent = 'Flow Rate: ';
        uiContainer.appendChild(flowLabel);

        const flowSlider = document.createElement('input');
        flowSlider.type = 'range';
        flowSlider.min = '0';
        flowSlider.max = '50';
        flowSlider.value = '0';
        flowSlider.oninput = () => {
            this.simulation.setParameters({
                flowRate: parseInt(flowSlider.value)
            });
            flowValue.textContent = flowSlider.value;
        };

        uiContainer.appendChild(flowSlider);

        const flowValue = document.createElement('span');
        flowValue.textContent = '0';
        flowValue.style.marginLeft = '10px';
        uiContainer.appendChild(flowValue);

        // Добавляем контейнер для отображения статистики
        const statsContainer = document.createElement('div');
        statsContainer.style.marginTop = '20px';
        statsContainer.style.fontSize = '12px';
        uiContainer.appendChild(statsContainer);
        this.uiElements.set('statsContainer', statsContainer);

        // Добавляем UI контейнер к документу
        document.body.appendChild(uiContainer);
    }

    /**
     * Запуск/остановка симуляции
     */
    private toggleSimulation(): void {
        this.isRunning = !this.isRunning;

        const button = this.uiElements.get('startStopButton') as HTMLButtonElement;
        button.textContent = this.isRunning ? 'Stop' : 'Start';

        if (this.isRunning) {
            this.lastTime = performance.now();
            requestAnimationFrame(this.animationLoop.bind(this));
        }
    }

    /**
     * Сброс симуляции
     */
    private resetSimulation(): void {
        // Создаем новую симуляцию с теми же размерами
        this.simulation = new AdvancedFluids.ThermodynamicFluidFlow(
            0, 0, this.canvas.width, this.canvas.height
        );

        // Сбрасываем UI элементы к исходным значениям
        (this.uiElements.get('startStopButton') as HTMLButtonElement).textContent = 'Start';
        this.isRunning = false;

        // Очищаем канвас
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Основной цикл анимации
     */
    private animationLoop(timestamp: number): void {
        if (!this.isRunning) return;

        // Расчет прошедшего времени
        const deltaTime = (timestamp - this.lastTime) / 1000; // в секундах
        this.lastTime = timestamp;

        // Ограничим максимальный deltaTime для стабильности (избегаем "скачков" при низком FPS)
        const dt = Math.min(deltaTime, 0.05);

        // Обновление симуляции
        this.simulation.update(dt);

        // Очистка канваса
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рендеринг симуляции
        this.simulation.render(this.ctx);

        // Обновление статистики
        this.updateStats();

        // Запрашиваем следующий кадр анимации
        requestAnimationFrame(this.animationLoop.bind(this));
    }

    /**
     * Обновление отображаемой статистики
     */
    private updateStats(): void {
        const stats = this.simulation.getStats();
        const statsContainer = this.uiElements.get('statsContainer') as HTMLDivElement;

        statsContainer.innerHTML = `
      <strong>Statistics:</strong><br>
      Total Particles: ${stats.particleCount}<br>
      Water: ${stats.waterParticles} (Ice: ${stats.iceCount}, Liquid: ${stats.liquidCount}, Vapor: ${stats.vaporCount})<br>
      Air: ${stats.airParticles}<br>
      Avg Temp: ${stats.averageTemperature.toFixed(1)}°C<br>
      FPS: ${(1 / ((performance.now() - this.lastTime) / 1000)).toFixed(1)}
    `;
    }

    /**
     * Добавление пресетов симуляции
     */
    public addPresetScenario(scenario: string): void {
        switch (scenario) {
            case 'rain':
                // Создаем облака и дождь
                for (let i = 0; i < 50; i++) {
                    this.simulation.addParticlesAt(
                        Math.random() * this.canvas.width,
                        50 + Math.random() * 50,
                        1,
                        MaterialType.WATER,
                        10
                    );
                }

                // Холодная земля для возможного превращения в снег
                this.simulation.addHeatSource(this.canvas.width / 2, this.canvas.height - 20, 40, 0);
                break;

            case 'boilingPot':
                // Создаем большой резервуар с водой
                for (let i = 0; i < 200; i++) {
                    this.simulation.addParticlesAt(
                        this.canvas.width / 2 + (Math.random() - 0.5) * 100,
                        this.canvas.height - 100 + Math.random() * 50,
                        1,
                        MaterialType.WATER,
                        20
                    );
                }

                // Добавляем источник тепла снизу
                this.simulation.addHeatSource(this.canvas.width / 2, this.canvas.height - 10, 30, 120);
                break;

            case 'convection':
                // Создаем воздушные частицы
                for (let i = 0; i < 200; i++) {
                    this.simulation.addParticlesAt(
                        Math.random() * this.canvas.width,
                        Math.random() * this.canvas.height,
                        1,
                        MaterialType.AIR,
                        20
                    );
                }

                // Добавляем горячий и холодный источники
                this.simulation.addHeatSource(this.canvas.width / 4, this.canvas.height - 50, 30, 100);
                this.simulation.addHeatSource(3 * this.canvas.width / 4, 50, 30, -10);
                break;
        }
    }
}

/**
 * Инициализация симуляции при загрузке страницы
 */
window.onload = () => {
    // Создаем канвас
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
    document.body.appendChild(canvas);

    // Создаем и запускаем симуляцию
    const simulationManager = new FluidsSimulationManager(canvas, canvas.width, canvas.height);

    // Добавляем кнопки для пресетов
    const presetContainer = document.createElement('div');
    presetContainer.style.position = 'absolute';
    presetContainer.style.top = '10px';
    presetContainer.style.right = '10px';
    presetContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    presetContainer.style.padding = '10px';
    presetContainer.style.borderRadius = '5px';

    const presetTitle = document.createElement('div');
    presetTitle.textContent = 'Presets:';
    presetTitle.style.fontWeight = 'bold';
    presetTitle.style.marginBottom = '5px';
    presetContainer.appendChild(presetTitle);

    const presets = [
        { name: 'Rain', value: 'rain' },
        { name: 'Boiling Pot', value: 'boilingPot' },
        { name: 'Convection', value: 'convection' }
    ];

    presets.forEach(preset => {
        const button = document.createElement('button');
        button.textContent = preset.name;
        button.style.display = 'block';
        button.style.margin = '5px 0';
        button.style.width = '100%';
        button.onclick = () => simulationManager.addPresetScenario(preset.value);
        presetContainer.appendChild(button);
    });

    document.body.appendChild(presetContainer);

    // Добавляем инструкции
    const instructionsContainer = document.createElement('div');
    instructionsContainer.style.position = 'absolute';
    instructionsContainer.style.bottom = '10px';
    instructionsContainer.style.right = '10px';
    instructionsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    instructionsContainer.style.padding = '10px';
    instructionsContainer.style.borderRadius = '5px';
    instructionsContainer.style.fontSize = '12px';
    instructionsContainer.style.maxWidth = '300px';

    instructionsContainer.innerHTML = `
    <strong>Instructions:</strong><br>
    - Left click to add particles or heat sources<br>
    - Right click to create wind (from center to click point)<br>
    - Use the controls panel to adjust simulation parameters<br>
    - Try the presets for interesting scenarios!
  `;

    document.body.appendChild(instructionsContainer);
};