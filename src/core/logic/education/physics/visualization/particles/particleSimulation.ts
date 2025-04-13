import { Particle } from '../../particles/particle.ts';
import { Electron } from '../../particles/leptons/electron.ts';
import { Proton } from '../../particles/hadrons/baryons/proton.ts';
import { Neutron } from '../../particles/hadrons/baryons/neutron.ts';
import { Photon } from '../../particles/bosons/photon.ts';
import { Lepton } from '../../particles/leptons/lepton.ts';
import { Boson } from '../../particles/bosons/boson.ts';
import { Gluon } from '../../particles/bosons/gluon.ts';
import { Hadron } from '../../particles/hadrons/hadron.ts';
import { AtomCore } from '../../particles/atomCore.ts';
import { Atom } from '../../particles/atom.ts';
import { Molecule } from '../../particles/molecule.ts';
import {UpQuark} from "../../particles/quarks/upQuark.ts";
import {DownQuark} from "../../particles/quarks/downQuark.ts";
import {Quark} from "../../particles/quarks/quark.ts";
import {StrangeQuark} from "../../particles/quarks/strangeQuark.ts";
import {AntiStrangeQuark} from "../../particles/quarks/antiStrangeQuark.ts";
import {AntiDownQuark} from "../../particles/quarks/antiDownQuark.ts";
import {AntiUpQuark} from "../../particles/quarks/antiUpQuark.ts";
import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Tau} from "../../particles/leptons/tau.ts";
import {AntiTau} from "../../particles/leptons/antiTau.ts";
import {CharmQuark} from "../../particles/quarks/charmQuark.ts";
import {BottomQuark} from "../../particles/quarks/bottomQuark.ts";
import {TopQuark} from "../../particles/quarks/topQuark.ts";
import {ZBoson} from "../../particles/bosons/zBozon.ts";
import {HiggsBoson} from "../../particles/bosons/higgsBoson.ts";
import {WBoson} from "../../particles/bosons/wBoson.ts";
import {Hydrogen} from "../../particles/izotopes/hydrogen/hydrogen.ts";
import {AntiBottomQuark} from "../../particles/quarks/antiBottomQuark.ts";

// Типы фундаментальных взаимодействий
enum InteractionType {
    ELECTROMAGNETIC = 'electromagnetic',
    STRONG = 'strong',
    WEAK = 'weak',
    GRAVITATIONAL = 'gravitational'
}

type AnyParticle = Particle|Atom|Molecule;

// Конфигурация симуляции
interface SimulationConfig {
    initialParticleCount: number,
    canvasWidth: number;
    canvasHeight: number;
    gravitationalConstant: number;
    electromagneticConstant: number;
    strongForceConstant: number;
    weakForceConstant: number;
    boundaryBehavior: 'wrap' | 'bounce' | 'absorb';
    quantumEffectsEnabled: boolean;
    temperatureKelvin: number;
    timeScale: number;
    particleLimit: number;
    energyConservation: boolean;
    visualizationMode: 'standard' | 'quantum' | 'field';
    showForceFields: boolean;
    showParticleTrails: boolean;
    trailLength: number;
    showLabels: boolean;
}

// Структура для хранения статистики симуляции
interface SimulationStats {
    totalParticles: number;
    totalEnergy: number;
    totalMomentum: Vector2D;
    particleTypeCount: Map<string, number>;
    interactionCount: Map<InteractionType, number>;
    particleCreationEvents: number;
    particleDestructionEvents: number;
    averageTemperature: number;
    stabilityIndex: number;
    quantumEvents: number;
}

// Класс для представления точки в пространстве-времени
interface SpacetimeEvent {
    position: Vector2D;
    time: number;
    type: string;
    particles: (AnyParticle)[];
    energy: number;
}

// Главный класс симуляции частиц
export class ParticleSimulation {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: (AnyParticle)[] = [];
    private config: SimulationConfig;
    private stats: SimulationStats;
    private running: boolean = false;
    private time: number = 0;
    private lastFrameTime: number = 0;
    private spatialGrid: Map<string, AnyParticle[]> = new Map();
    private gridCellSize: number = 50;
    private eventHistory: SpacetimeEvent[] = [];
    private fieldVisualizationData: number[][] = [];
    private particleTrails: Map<AnyParticle, Vector2D[]> = new Map();
    private interactionMatrix: Map<string, Map<string, (p1: AnyParticle, p2: AnyParticle) => void>> = new Map();
    private decayProbabilities: Map<string, number> = new Map();
    private particlesToAdd: (AnyParticle)[] = [];
    private particlesToRemove: Set<AnyParticle> = new Set();
    private requestAnimationId: number | null = null;
    private lastUpdateTime: number = performance.now();

    constructor(canvasId: string, windowSize: {x: number, y: number} =
                {x: window.innerWidth, y: window.innerHeight},
                initParticleCount: number = 10, config?: Partial<SimulationConfig>) {
        // Получаем элемент canvas и контекст для рисования
        const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvasElement) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        this.canvas = canvasElement;
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context from canvas');
        }
        this.ctx = context;

        // Устанавливаем размеры канваса
        this.canvas.width = windowSize.x;
        this.canvas.height = windowSize.y;

        // Инициализируем конфигурацию симуляции по умолчанию
        this.config = {
            initialParticleCount: initParticleCount,
            canvasWidth: windowSize.x,
            canvasHeight: windowSize.y,
            gravitationalConstant: 6.674e-11,
            electromagneticConstant: 8.99e9,
            strongForceConstant: 1e2,
            weakForceConstant: 1e-6,
            boundaryBehavior: 'bounce',
            quantumEffectsEnabled: true,
            temperatureKelvin: 293, // комнатная температура в Кельвинах
            timeScale: 1.0,
            particleLimit: 500,
            energyConservation: true,
            visualizationMode: 'standard',
            showForceFields: false,
            showParticleTrails: true,
            trailLength: 20,
            showLabels: true,
            ...config
        };

        // Инициализируем статистику
        this.stats = {
            totalParticles: 0,
            totalEnergy: 0,
            totalMomentum: new Vector2D(0, 0),
            particleTypeCount: new Map(),
            interactionCount: new Map(),
            particleCreationEvents: 0,
            particleDestructionEvents: 0,
            averageTemperature: this.config.temperatureKelvin,
            stabilityIndex: 1.0,
            quantumEvents: 0
        };

        // Инициализируем матрицу взаимодействий между типами частиц
        this.initializeInteractionMatrix();

        // Инициализируем вероятности распада частиц
        this.initializeDecayProbabilities();

        // Инициализируем визуализацию полей
        this.initializeFieldVisualization();

        // Установка обработчиков событий
        this.setupEventListeners();
    }

    /**
     * Инициализация матрицы взаимодействий между типами частиц
     */
    private initializeInteractionMatrix(): void {
        // Электромагнитные взаимодействия
        this.registerInteraction('Electron', 'Proton', this.handleElectromagneticInteraction.bind(this));
        this.registerInteraction('Electron', 'Electron', this.handleElectromagneticInteraction.bind(this));
        this.registerInteraction('Proton', 'Proton', this.handleElectromagneticInteraction.bind(this));

        // Сильные взаимодействия
        this.registerInteraction('Quark', 'Quark', this.handleStrongInteraction.bind(this));
        this.registerInteraction('Quark', 'Gluon', this.handleStrongInteraction.bind(this));
        this.registerInteraction('Gluon', 'Gluon', this.handleStrongInteraction.bind(this));

        // Слабые взаимодействия
        this.registerInteraction('Lepton', 'Quark', this.handleWeakInteraction.bind(this));
        this.registerInteraction('Quark', 'Quark', this.handleWeakInteraction.bind(this));

        // Гравитационные взаимодействия (применяются ко всем частицам)
        this.registerInteraction('Particle', 'Particle', this.handleGravitationalInteraction.bind(this));

        // Анигиляции частица-античастица
        this.registerInteraction('Electron', 'Positron', this.handleAnnihilation.bind(this));
        this.registerInteraction('Proton', 'AntiProton', this.handleAnnihilation.bind(this));
        this.registerInteraction('Neutron', 'AntiNeutron', this.handleAnnihilation.bind(this));
        this.registerInteraction('Quark', 'AntiQuark', this.handleAnnihilation.bind(this));

        // Формирование составных частиц
        this.registerInteraction('Proton', 'Neutron', this.handleNuclearBinding.bind(this));
        this.registerInteraction('Electron', 'AtomCore', this.handleAtomForming.bind(this));
        this.registerInteraction('Atom', 'Atom', this.handleMoleculeForming.bind(this));
    }

    /**
     * Регистрация функции-обработчика взаимодействия между типами частиц
     */
    private registerInteraction(
        typeA: string,
        typeB: string,
        handler: (p1: AnyParticle, p2: AnyParticle) => void
    ): void {
        if (!this.interactionMatrix.has(typeA)) {
            this.interactionMatrix.set(typeA, new Map());
        }

        const typeAInteractions = this.interactionMatrix.get(typeA);
        if (typeAInteractions) {
            typeAInteractions.set(typeB, handler);
        }

        // Регистрируем взаимодействие и в обратном порядке, если типы разные
        if (typeA !== typeB) {
            if (!this.interactionMatrix.has(typeB)) {
                this.interactionMatrix.set(typeB, new Map());
            }

            const typeBInteractions = this.interactionMatrix.get(typeB);
            if (typeBInteractions) {
                typeBInteractions.set(typeA, handler);
            }
        }
    }

    /**
     * Инициализация вероятностей спонтанного распада частиц
     */
    private initializeDecayProbabilities(): void {
        this.decayProbabilities.set('Neutron', 0.0001); // Нейтрон распадается медленно
        this.decayProbabilities.set('Muon', 0.01); // Мюон распадается быстрее
        this.decayProbabilities.set('Tau', 0.1); // Тау-лептон распадается очень быстро
        this.decayProbabilities.set('Quark', 0.001); // Свободные кварки нестабильны
        this.decayProbabilities.set('Higgs', 0.05); // Бозон Хиггса очень нестабилен
    }

    /**
     * Инициализация данных для визуализации полей
     */
    private initializeFieldVisualization(): void {
        const gridSize = 50; // Размер сетки для визуализации поля
        this.fieldVisualizationData = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    }

    /**
     * Установка обработчиков событий для взаимодействия с канвасом
     */
    private setupEventListeners(): void {
        // Обработчик клика мыши для добавления частиц
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            // this.createRandomParticle(new Vector2D(x, y));
            this.createProton(new Vector2D(x, y))
        });

        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            // this.createMolecule(new Vector2D(x, y));
            this.createElectron(new Vector2D(x, y));
        });

        // Обработчик перетаскивания для добавления множества частиц
        let isDragging = false;
        this.canvas.addEventListener('mousedown', () => {
            isDragging = true;
        });

        this.canvas.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                // Добавляем частицы с меньшей вероятностью при перетаскивании
                if (Math.random() < 0.1) {
                    this.createRandomParticle(new Vector2D(x, y));
                }
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    private createAtom(position: Vector2D) {
        if (this.particles.length >= this.config.particleLimit) {
            return; // Достигнут лимит частиц
        }
        const hydrogen = new Hydrogen(position);
        this.particlesToAdd.push(hydrogen);
        this.stats.particleCreationEvents++;

        // Обновление счетчика типов частиц
        const type = hydrogen.constructor.name;
        this.stats.particleTypeCount.set(
            type,
            (this.stats.particleTypeCount.get(type) || 0) + 1
        );
    }

    private createProton(position: Vector2D) {
        if (this.particles.length >= this.config.particleLimit) {
            return; // Достигнут лимит частиц
        }
        const proton = new Proton(position);
        this.particlesToAdd.push(proton);
        this.stats.particleCreationEvents++;

        // Обновление счетчика типов частиц
        const type = proton.constructor.name;
        this.stats.particleTypeCount.set(
            type,
            (this.stats.particleTypeCount.get(type) || 0) + 1
        );
    }

    private createElectron(position: Vector2D) {
        if (this.particles.length >= this.config.particleLimit) {
            return; // Достигнут лимит частиц
        }
        const electron = new Electron(position);
        this.particlesToAdd.push(electron);
        this.stats.particleCreationEvents++;

        // Обновление счетчика типов частиц
        const type = electron.constructor.name;
        this.stats.particleTypeCount.set(
            type,
            (this.stats.particleTypeCount.get(type) || 0) + 1
        );
    }

    private createMolecule(position: Vector2D) {
        if (this.particles.length >= this.config.particleLimit) {
            return; // Достигнут лимит частиц
        }
        // const initialVelocity = new Vector2D((Math.random() - 0.5) * 2,(Math.random() - 0.5) * 2)

        const newParticle = Molecule.createWater(position);
        this.particlesToAdd.push(newParticle);
        this.stats.particleCreationEvents++;

        // Обновление счетчика типов частиц
        const type = newParticle.constructor.name;
        this.stats.particleTypeCount.set(
            type,
            (this.stats.particleTypeCount.get(type) || 0) + 1
        );
    }

    /**
     * Создание случайной частицы в заданной позиции
     */
    private createRandomParticle(position: Vector2D): void {
        if (this.particles.length >= this.config.particleLimit) {
            return; // Достигнут лимит частиц
        }

        const particleTypes = [
            'Electron', 'Proton', 'Neutron', 'Photon',
            'Quark', 'Gluon', 'Higgs'
        ];

        const randomType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        let newParticle: AnyParticle | null = null;

        switch (randomType) {
            case 'Electron':
                newParticle = new Electron(position);
                break;
            case 'Proton':
                newParticle = new Proton(position);
                break;
            case 'Neutron':
                newParticle = new Neutron(position);
                break;
            case 'Photon':
                newParticle = new Photon(position);
                // Задаем случайное направление для фотона
                const randomAngle = Math.random() * Math.PI * 2;
                const speed = 5; // Фотоны быстрые!
                newParticle.setVelocity(new Vector2D(Math.cos(randomAngle) * speed,Math.sin(randomAngle) * speed));
                break;
            case 'Quark':
                newParticle = Math.random() < 0.5 ? new UpQuark(position) : new DownQuark(position);
                break;
            case 'Gluon':
                newParticle = new Gluon(position);
                break;
            case 'Higgs':
                // Предполагаем, что есть класс HiggsBoson
                newParticle = new HiggsBoson(position);
                break;
        }

        if (newParticle) {
            // Добавление некоторой случайной начальной скорости

            const initialVelocity = new Vector2D((Math.random() - 0.5) * 2,(Math.random() - 0.5) * 2)

            if (randomType !== 'Photon') { // Для фотона уже задали скорость
                newParticle.setVelocity(initialVelocity);
            }

            this.particlesToAdd.push(newParticle);
            this.stats.particleCreationEvents++;

            // Обновление счетчика типов частиц
            const type = newParticle.constructor.name;
            this.stats.particleTypeCount.set(
                type,
                (this.stats.particleTypeCount.get(type) || 0) + 1
            );
        }
    }

    /**
     * Изменение размера канваса при изменении размера окна
     */
    private resizeCanvas(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.config.canvasWidth = this.canvas.width;
        this.config.canvasHeight = this.canvas.height;
    }

    /**
     * Запуск симуляции
     */
    public start(): void {
        if (this.running) return;

        this.running = true;
        this.lastFrameTime = performance.now();
        this.animationLoop();
    }

    /**
     * Остановка симуляции
     */
    public stop(): void {
        this.running = false;
        if (this.requestAnimationId !== null) {
            cancelAnimationFrame(this.requestAnimationId);
            this.requestAnimationId = null;
        }
    }

    /**
     * Пауза/продолжение симуляции
     */
    public togglePause(): void {
        if (this.running) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Очистка симуляции (удаление всех частиц)
     */
    public clear(): void {
        this.particles = [];
        this.particleTrails.clear();
        this.stats = {
            totalParticles: 0,
            totalEnergy: 0,
            totalMomentum: new Vector2D(0, 0),
            particleTypeCount: new Map(),
            interactionCount: new Map(),
            particleCreationEvents: 0,
            particleDestructionEvents: 0,
            averageTemperature: this.config.temperatureKelvin,
            stabilityIndex: 1.0,
            quantumEvents: 0
        };
        this.time = 0;
        this.eventHistory = [];
        this.redraw();
    }

    /**
     * Добавление частицы в симуляцию
     */
    public addParticle(particle: AnyParticle): void {
        this.particlesToAdd.push(particle);

        // Обновление счетчика типов частиц
        const type = particle.constructor.name;
        this.stats.particleTypeCount.set(
            type,
            (this.stats.particleTypeCount.get(type) || 0) + 1
        );

        this.stats.particleCreationEvents++;
    }

    /**
     * Удаление частицы из симуляции
     */
    public removeParticle(particle: AnyParticle): void {
        this.particlesToRemove.add(particle);

        // Обновление счетчика типов частиц
        const type = particle.constructor.name;
        const currentCount = this.stats.particleTypeCount.get(type) || 0;
        if (currentCount > 0) {
            this.stats.particleTypeCount.set(type, currentCount - 1);
        }

        this.stats.particleDestructionEvents++;
    }

    /**
     * Основной цикл анимации
     */
    private animationLoop(): void {
        if (!this.running) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // в секундах
        this.lastFrameTime = currentTime;

        // Масштабируем deltaTime в соответствии с настройкой timeScale
        const scaledDeltaTime = deltaTime * this.config.timeScale;

        // Обновляем время симуляции
        this.time += scaledDeltaTime;

        // Обновляем состояние всех частиц
        this.update(scaledDeltaTime);

        // Отрисовываем текущее состояние
        this.redraw();

        // Обновляем статистику
        this.updateStats();

        // Запрашиваем следующий кадр анимации
        this.requestAnimationId = requestAnimationFrame(this.animationLoop.bind(this));
    }

    /**
     * Обновление состояния всех частиц и обработка их взаимодействий
     */
    private update(deltaTime: number): void {
        // Обновляем пространственную сетку для оптимизации поиска столкновений
        this.updateSpatialGrid();

        // Обрабатываем взаимодействия между частицами
        this.handleInteractions(deltaTime);

        // Обрабатываем распады частиц
        this.handleDecays(deltaTime);

        // Обновляем состояние каждой частицы
        for (const particle of this.particles) {
            // Применяем квантовые эффекты, если они включены
            if (this.config.quantumEffectsEnabled) {
                this.applyQuantumEffects(particle, deltaTime);
            }

            // Обновляем состояние частицы
            particle.update(deltaTime);

            // Обрабатываем столкновения со стенками
            this.handleBoundaryCollisions(particle);

            // Обновляем след частицы, если включена визуализация следов
            if (this.config.showParticleTrails) {
                this.updateParticleTrail(particle);
            }
        }

        // Применяем отложенные изменения (добавление/удаление частиц)
        this.applyPendingChanges();
    }

    /**
     * Обновление пространственной сетки для оптимизации обнаружения взаимодействий
     */
    private updateSpatialGrid(): void {
        // Очищаем текущую сетку
        this.spatialGrid.clear();

        // Распределяем частицы по ячейкам сетки
        for (const particle of this.particles) {
            const pos = particle.getPosition();
            const cellX = Math.floor(pos.x / this.gridCellSize);
            const cellY = Math.floor(pos.y / this.gridCellSize);
            const cellKey = `${cellX},${cellY}`;

            if (!this.spatialGrid.has(cellKey)) {
                this.spatialGrid.set(cellKey, []);
            }

            const cell = this.spatialGrid.get(cellKey);
            if (cell) {
                cell.push(particle);
            }
        }
    }

    /**
     * Обработка взаимодействий между частицами
     */
    private handleInteractions(deltaTime: number): void {
        // Для каждой ячейки в пространственной сетке
        for (const [cellKey, cellParticles] of this.spatialGrid.entries()) {
            // Проверяем взаимодействия между частицами в одной ячейке
            this.checkParticleInteractions(cellParticles, deltaTime);

            // Получаем соседние ячейки
            const [cellX, cellY] = cellKey.split(',').map(Number);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue; // Пропускаем текущую ячейку

                    const neighborKey = `${cellX + dx},${cellY + dy}`;
                    const neighborCell = this.spatialGrid.get(neighborKey);

                    if (neighborCell) {
                        // Проверяем взаимодействия между частицами текущей ячейки и соседней
                        this.checkParticleInteractionsWithNeighbors(cellParticles, neighborCell, deltaTime);
                    }
                }
            }
        }
    }

    /**
     * Проверка взаимодействий между частицами в одной ячейке
     */
    private checkParticleInteractions(particles: AnyParticle[], deltaTime: number): void {
        const n = particles.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const p1 = particles[i];
                const p2 = particles[j];

                // Проверяем, есть ли обработчик для взаимодействия между типами этих частиц
                this.applyInteraction(p1, p2, deltaTime);
            }
        }
    }

    /**
     * Проверка взаимодействий между частицами текущей ячейки и соседней
     */
    private checkParticleInteractionsWithNeighbors(
        particles: AnyParticle[],
        neighbors: AnyParticle[],
        deltaTime: number
    ): void {
        for (const p1 of particles) {
            for (const p2 of neighbors) {
                // Применяем взаимодействие между частицами
                this.applyInteraction(p1, p2, deltaTime);
            }
        }
    }

    /**
     * Применение взаимодействия между двумя частицами
     */
    private applyInteraction(p1: AnyParticle, p2: AnyParticle, deltaTime: number): void {
        // Проверяем расстояние между частицами
        const pos1 = p1.getPosition();
        const pos2 = p2.getPosition();
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distanceSquared = dx * dx + dy * dy;

        // Проверяем столкновение
        const collisionRadius = (p1 as any).radius + (p2 as any).radius;
        if (distanceSquared <= collisionRadius * collisionRadius) {
            // Обрабатываем столкновение
            this.handleCollision(p1, p2, deltaTime);
        }

        // Применяем дальнодействующие силы
        this.applyForces(p1, p2, distanceSquared, dx, dy, deltaTime);

        // Проверяем наличие специального обработчика для этой пары типов частиц
        const type1 = this.getParticleTypeName(p1);
        const type2 = this.getParticleTypeName(p2);

        const interactions = this.interactionMatrix.get(type1);
        if (interactions) {
            const handler = interactions.get(type2);
            if (handler) {
                handler(p1, p2);

                // Обновляем счетчик взаимодействий по типу
                const interactionType = this.determineInteractionType(p1, p2);
                this.stats.interactionCount.set(
                    interactionType,
                    (this.stats.interactionCount.get(interactionType) || 0) + 1
                );
            }
        }
    }

    /**
     * Получение имени типа частицы для использования в матрице взаимодействий
     */
    private getParticleTypeName(particle: AnyParticle): string {
        const constructorName = particle.constructor.name;

        // Проверяем, является ли частица подклассом Lepton, Quark и т.д.
        if (particle instanceof Lepton) return 'Lepton';
        if (particle instanceof Quark) return 'Quark';
        if (particle instanceof Boson) return 'Boson';
        if (particle instanceof Hadron) return 'Hadron';

        // Возвращаем конкретный тип частицы
        return constructorName;
    }

    /**
     * Определение типа взаимодействия между частицами
     */
    private determineInteractionType(p1: AnyParticle, p2: AnyParticle): InteractionType {
        // Проверяем электрический заряд для электромагнитного взаимодействия
        if (p1.charge !== 0 && p2.charge !== 0) {
            return InteractionType.ELECTROMAGNETIC;
        }

        // Проверяем на сильное взаимодействие (для кварков и глюонов)
        if ((p1 instanceof Quark || p1 instanceof Gluon) &&
            (p2 instanceof Quark || p2 instanceof Gluon)) {
            return InteractionType.STRONG;
        }

        // Проверяем на слабое взаимодействие (для лептонов и кварков)
        if ((p1 instanceof Lepton && p2 instanceof Quark) ||
            (p1 instanceof Quark && p2 instanceof Lepton)) {
            return InteractionType.WEAK;
        }

        // По умолчанию все частицы взаимодействуют гравитационно
        return InteractionType.GRAVITATIONAL;
    }

    /**
     * Обработка столкновения двух частиц
     */
    private handleCollision(p1: AnyParticle, p2: AnyParticle, deltaTime: number): void {
        // Проверяем возможность аннигиляции частицы с античастицей
        if (p1 instanceof Lepton && p2 instanceof Lepton) {
            const lepton1 = p1 as Lepton;
            const lepton2 = p2 as Lepton;

            if (lepton1.isAntiParticleOf && lepton1.isAntiParticleOf(lepton2)) {
                this.handleAnnihilation(lepton1, lepton2);
                return;
            }
        }

        // Обрабатываем упругое столкновение
        const pos1 = p1.getPosition();
        const pos2 = p2.getPosition();
        const vel1 = p1.getVelocity();
        const vel2 = p2.getVelocity();
        const mass1 = p1.mass
        const mass2 = p2.mass

        // Нормализованный вектор от p1 к p2
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / distance;
        const ny = dy / distance;

        // Скорости вдоль нормали до столкновения
        const v1n = vel1.x * nx + vel1.y * ny;
        const v2n = vel2.x * nx + vel2.y * ny;

        // Относительная скорость вдоль нормали
        const relativeVelocity = v1n - v2n;

        // Если частицы расходятся, не рассматриваем столкновение
        if (relativeVelocity > 0) return;

        // Скорости после упругого столкновения (закон сохранения импульса и энергии)
        // Можно добавить коэффициент упругости (0-1)
        const elasticity = 0.9;

// Величина импульса для обмена
        const impulse = (2 * elasticity * (v1n - v2n)) / (mass1 + mass2);

        // Новые скорости вдоль нормали
        const v1nAfter = v1n - impulse * mass2;
        const v2nAfter = v2n + impulse * mass1;

        // Обновляем скорости частиц

        p1.setVelocity(new Vector2D(vel1.x - nx * (v1n - v1nAfter),vel1.y - ny * (v1n - v1nAfter)));


        p2.setVelocity(new Vector2D(vel2.x - nx * (v2n - v2nAfter),vel2.y - ny * (v2n - v2nAfter)));

        // Разрешаем наложение частиц, немного отодвигая их друг от друга
        const overlap = (p1 as any).radius + (p2 as any).radius - distance;
        if (overlap > 0) {
            const moveX = nx * overlap * 0.5;
            const moveY = ny * overlap * 0.5;


            p1.setPosition(new Vector2D(pos1.x - moveX,pos1.y - moveY));


            p2.setPosition(new Vector2D(pos2.x + moveX,pos2.y + moveY));
        }

        // Возможное создание новых частиц при высокоэнергетическом столкновении
        this.handleHighEnergyCollision(p1, p2, distance);
    }

    /**
     * Обработка высокоэнергетических столкновений с возможным рождением новых частиц
     */
    private handleHighEnergyCollision(p1: AnyParticle, p2: AnyParticle, distance: number): void {
        const vel1 = p1.getVelocity();
        const vel2 = p2.getVelocity();
        const speed1 = Math.sqrt(vel1.x * vel1.x + vel1.y * vel1.y);
        const speed2 = Math.sqrt(vel2.x * vel2.x + vel2.y * vel2.y);

        // Суммарная кинетическая энергия
        const kineticEnergy = 0.5 * p1.mass * speed1 * speed1 + 0.5 * p2.mass * speed2 * speed2;

        // Порог энергии для рождения новых частиц
        const energyThreshold = 100;

        if (kineticEnergy > energyThreshold && Math.random() < 0.2) {
            // Позиция столкновения - средняя точка между частицами
            const pos1 = p1.getPosition();
            const pos2 = p2.getPosition();
            const collisionPos = new Vector2D((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2);

            // Создаем фотоны как продукты реакции
            const photonCount = Math.floor(Math.random() * 3) + 1; // 1-3 фотона

            for (let i = 0; i < photonCount; i++) {
                const photon = new Photon(collisionPos);

                // Задаем случайное направление для фотона
                const randomAngle = Math.random() * Math.PI * 2;
                const photonSpeed = 10; // Фотоны двигаются быстро


                photon.setVelocity(new Vector2D(Math.cos(randomAngle) * photonSpeed,Math.sin(randomAngle) * photonSpeed));

                this.particlesToAdd.push(photon);
            }

            // Регистрируем событие пространства-времени
            this.recordSpacetimeEvent({
                position: collisionPos,
                time: this.time,
                type: 'particle_creation',
                particles: [p1, p2],
                energy: kineticEnergy
            });

            // Обновляем статистику
            this.stats.particleCreationEvents += photonCount;
            const photonType = 'Photon';
            this.stats.particleTypeCount.set(
                photonType,
                (this.stats.particleTypeCount.get(photonType) || 0) + photonCount
            );
        }
    }

    /**
     * Применение фундаментальных сил между частицами
     */
    private applyForces(
        p1: AnyParticle,
        p2: AnyParticle,
        distanceSquared: number,
        dx: number,
        dy: number,
        deltaTime: number
    ): void {
        const distance = Math.sqrt(distanceSquared);

        if (distance < 0.0001) return; // Избегаем деления на очень маленькие числа

        // Единичный вектор направления силы
        const nx = dx / distance;
        const ny = dy / distance;

        // Вычисляем гравитационную силу (действует на все частицы)
        const gravitationalForce = this.calculateGravitationalForce(p1, p2, distance);

        // Вычисляем электромагнитную силу
        const electromagneticForce = this.calculateElectromagneticForce(p1, p2, distance);

        // Вычисляем сильную ядерную силу (для кварков и адронов)
        const strongForce = this.calculateStrongForce(p1, p2, distance);

        // Вычисляем слабую ядерную силу
        const weakForce = this.calculateWeakForce(p1, p2, distance);

        // Суммарная сила
        const totalForceX = (gravitationalForce + electromagneticForce + strongForce + weakForce) * nx;
        const totalForceY = (gravitationalForce + electromagneticForce + strongForce + weakForce) * ny;

        // Применяем силу к обеим частицам (в противоположных направлениях)
        const acc1 = {
            x: totalForceX / p1.mass,
            y: totalForceY / p1.mass
        };

        const acc2 = {
            x: -totalForceX / p2.mass,
            y: -totalForceY / p2.mass
        };

        const vel1 = p1.getVelocity();
        const vel2 = p2.getVelocity();

        // Обновляем скорости частиц на основе ускорений

        p1.setVelocity(new Vector2D(vel1.x + acc1.x * deltaTime,vel1.y + acc1.y * deltaTime));


        p2.setVelocity(new Vector2D(vel2.x + acc2.x * deltaTime,vel2.y + acc2.y * deltaTime));
    }

    /**
     * Вычисление гравитационной силы между двумя частицами
     */
    private calculateGravitationalForce(p1: AnyParticle, p2: AnyParticle, distance: number): number {
        const mass1 = p1.mass;
        const mass2 = p2.mass;

        // Закон всемирного тяготения (F = G * m1 * m2 / r^2)
        // Используем масштабирование для визуализации
        const force = this.config.gravitationalConstant * mass1 * mass2 / (distance * distance);

        // Сила всегда притягивающая (отрицательная)
        return -force;
    }

    /**
     * Вычисление электромагнитной силы между двумя частицами
     */
    private calculateElectromagneticForce(p1: AnyParticle, p2: AnyParticle, distance: number): number {
        const charge1 = p1.charge;
        const charge2 = p2.charge;

        // Если хотя бы одна частица не имеет заряда, нет электромагнитного взаимодействия
        if (charge1 === 0 || charge2 === 0) return 0;

        // Закон Кулона (F = k * q1 * q2 / r^2)
        const force = this.config.electromagneticConstant * charge1 * charge2 / (distance * distance);

        // Сила может быть притягивающей (отрицательная) или отталкивающей (положительная)
        // в зависимости от знаков зарядов
        return force;
    }

    /**
     * Вычисление сильной ядерной силы между двумя частицами
     */
    private calculateStrongForce(p1: AnyParticle, p2: AnyParticle, distance: number): number {
        // Сильное взаимодействие действует только на кварки и глюоны
        const isP1Subject = p1 instanceof Quark || p1 instanceof Gluon || p1 instanceof Hadron;
        const isP2Subject = p2 instanceof Quark || p2 instanceof Gluon || p2 instanceof Hadron;

        if (!isP1Subject || !isP2Subject) return 0;

        // Сильное взаимодействие имеет короткий радиус действия (примерно размер ядра)
        const strongRangeThreshold = 5;
        if (distance > strongRangeThreshold) return 0;

        // Моделируем силу как комбинацию экспоненциального уменьшения с расстоянием
        // и линейного роста на больших расстояниях (конфайнмент)
        const exponentialPart = Math.exp(-distance / 2);
        const linearPart = distance > 3 ? (distance - 3) * 0.5 : 0;

        const force = this.config.strongForceConstant * (exponentialPart + linearPart);

        // Сила всегда притягивающая для сильного взаимодействия
        return -force;
    }

    /**
     * Вычисление слабой ядерной силы между двумя частицами
     */
    private calculateWeakForce(p1: AnyParticle, p2: AnyParticle, distance: number): number {
        // Слабое взаимодействие действует на лептоны и кварки
        const isP1Subject = p1 instanceof Lepton || p1 instanceof Quark;
        const isP2Subject = p2 instanceof Lepton || p2 instanceof Quark;

        if (!isP1Subject || !isP2Subject) return 0;

        // Слабое взаимодействие имеет очень короткий радиус действия
        const weakRangeThreshold = 2;
        if (distance > weakRangeThreshold) return 0;

        // Моделируем как экспоненциально убывающую силу
        const force = this.config.weakForceConstant * Math.exp(-distance * 2);

        // Слабая сила обычно приводит к распадам, но здесь моделируем как притягивающую
        return -force;
    }

    /**
     * Обработка электромагнитного взаимодействия между частицами
     */
    private handleElectromagneticInteraction(p1: AnyParticle, p2: AnyParticle): void {
        // Базовое взаимодействие уже реализовано в расчете сил
        // Здесь можно добавить дополнительные эффекты

        // Например, испускание фотона с некоторой вероятностью
        if (p1.charge !== 0 && p2.charge !== 0 && Math.random() < 0.01) {
            const pos1 = p1.getPosition();
            const pos2 = p2.getPosition();

            // Создаем фотон в промежуточной точке

            const photonPos = new Vector2D((pos1.x + pos2.x) / 2,(pos1.y + pos2.y) / 2)

            const photon = new Photon(photonPos);

            // Задаем случайное направление
            const randomAngle = Math.random() * Math.PI * 2;

            photon.setVelocity(new Vector2D(Math.cos(randomAngle) * 8,Math.sin(randomAngle) * 8));

            this.particlesToAdd.push(photon);

            // Обновляем статистику
            this.stats.interactionCount.set(
                InteractionType.ELECTROMAGNETIC,
                (this.stats.interactionCount.get(InteractionType.ELECTROMAGNETIC) || 0) + 1
            );
        }
    }

    /**
     * Обработка сильного взаимодействия между частицами
     */
    private handleStrongInteraction(p1: AnyParticle, p2: AnyParticle): void {
        // Сильное взаимодействие между кварками может привести к образованию адронов
        if (p1 instanceof Quark && p2 instanceof Quark && Math.random() < 0.1) {
            const quark1 = p1 as Quark;
            const quark2 = p2 as Quark;

            // Проверяем, можно ли сформировать адрон
            if (this.canFormHadron(quark1, quark2)) {
                const pos1 = quark1.getPosition();
                const pos2 = quark2.getPosition();

                // Позиция нового адрона
                const hadronPos = new Vector2D((pos1.x + pos2.x) / 2,(pos1.y + pos2.y) / 2);

                // Создаем новый адрон
                const hadron = new Neutron(hadronPos);

                // Устанавливаем скорость как среднюю между кварками
                const vel1 = quark1.getVelocity();
                const vel2 = quark2.getVelocity();

                hadron.setVelocity(new Vector2D((vel1.x + vel2.x) / 2,(vel1.y + vel2.y) / 2));

                // Добавляем адрон и удаляем кварки
                this.particlesToAdd.push(hadron);
                this.removeParticle(quark1);
                this.removeParticle(quark2);

                // Обновляем статистику
                this.stats.interactionCount.set(
                    InteractionType.STRONG,
                    (this.stats.interactionCount.get(InteractionType.STRONG) || 0) + 1
                );
            }
        }
    }

    /**
     * Проверка возможности формирования адрона из кварков
     */
    private canFormHadron(quark1: Quark, quark2: Quark): boolean {
        // Простая проверка: можно сформировать мезон из кварка и антикварка
        return (quark1.isAntiParticle() && quark1.isAntiParticle()) || //баг
            // Или два кварка разного типа могут начать формировать барион
            (quark1.getQuarkType() !== quark2.getQuarkType());
    }

    /**
     * Обработка слабого взаимодействия между частицами
     */
    private handleWeakInteraction(p1: AnyParticle, p2: AnyParticle): void {
        // Слабое взаимодействие может вызывать распады частиц
        // Например, превращение нейтрона в протон
        if (p1 instanceof Neutron && Math.random() < 0.05) {
            const neutron = p1 as Neutron;
            const pos = neutron.getPosition();
            const vel = neutron.getVelocity();

            // Создаем протон на месте нейтрона
            const proton = new Proton(pos);
            proton.setVelocity(vel);

            // Создаем электрон и антинейтрино (продукты распада)
            const electron = new Electron(pos);

            electron.setVelocity(new Vector2D(vel.x + (Math.random() - 0.5) * 2,vel.y + (Math.random() - 0.5) * 2));

            // Добавляем новые частицы и удаляем нейтрон
            this.particlesToAdd.push(proton);
            this.particlesToAdd.push(electron);
            this.removeParticle(neutron);

            // Обновляем статистику
            this.stats.interactionCount.set(
                InteractionType.WEAK,
                (this.stats.interactionCount.get(InteractionType.WEAK) || 0) + 1
            );
        }
    }

    /**
     * Обработка гравитационного взаимодействия между частицами
     */
    private handleGravitationalInteraction(p1: AnyParticle, p2: AnyParticle): void {
        // Базовое взаимодействие уже реализовано в расчете сил
        // Здесь можно добавить дополнительные эффекты

        // Например, проверка на возможное формирование "черной дыры" при очень высокой массе
        const massThreshold = 1000;
        if (p1.mass + p2.mass > massThreshold && Math.random() < 0.001) {
            // Логика формирования черной дыры
            // (упрощенно, для полной физической точности потребуется гораздо более сложная модель)
            console.log("Black hole formation possibility detected");

            // В этой модели просто отметим событие в истории симуляции
            this.recordSpacetimeEvent({
                position: new Vector2D((p1.getPosition().x + p2.getPosition().x) / 2, (p1.getPosition().y + p2.getPosition().y) / 2),
                time: this.time,
                type: 'gravitational_singularity',
                particles: [p1, p2],
                energy: p1.mass + p2.mass
            });
        }
    }

    /**
     * Обработка аннигиляции частицы и античастицы
     */
    private handleAnnihilation(p1: AnyParticle, p2: AnyParticle): void {
        // Вычисляем общую энергию аннигилирующих частиц
        const totalEnergy = p1.mass + p2.mass
        const pos1 = p1.getPosition();
        const pos2 = p2.getPosition();

        // Средняя позиция для испускания фотонов

        const emissionPos = new Vector2D((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2);

        // Число фотонов зависит от энергии аннигиляции
        const numPhotons = Math.max(2, Math.min(10, Math.floor(totalEnergy / 10)));

        // Создаем фотоны, летящие в разных направлениях
        for (let i = 0; i < numPhotons; i++) {
            const angle = (i / numPhotons) * Math.PI * 2;
            const photon = new Photon(emissionPos);


            photon.setVelocity(new Vector2D(Math.cos(angle) * 10, Math.sin(angle) * 10));

            this.particlesToAdd.push(photon);
        }

        // Удаляем аннигилировавшие частицы
        this.removeParticle(p1);
        this.removeParticle(p2);

        // Записываем событие аннигиляции
        this.recordSpacetimeEvent({
            position: emissionPos,
            time: this.time,
            type: 'annihilation',
            particles: [p1, p2],
            energy: totalEnergy
        });

        // Обновляем статистику
        this.stats.particleDestructionEvents += 2;
        this.stats.particleCreationEvents += numPhotons;
    }

    /**
     * Обработка формирования ядра атома из протонов и нейтронов
     */
    private handleNuclearBinding(p1: AnyParticle, p2: AnyParticle): void {
        // Проверяем, что обе частицы являются протонами или нейтронами
        const isNucleon1 = p1 instanceof Proton || p1 instanceof Neutron;
        const isNucleon2 = p2 instanceof Proton || p2 instanceof Neutron;

        if (!isNucleon1 || !isNucleon2) return;

        // Проверяем расстояние между нуклонами (должно быть достаточно малым)
        const pos1 = p1.getPosition();
        const pos2 = p2.getPosition();
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) return; // Слишком далеко для формирования ядра

        // С некоторой вероятностью формируем ядро
        if (Math.random() < 0.2) {
            // Определяем заряд ядра (сумма зарядов протонов)
            let nucleusCharge = 0;
            if (p1 instanceof Proton) nucleusCharge += 1;
            if (p2 instanceof Proton) nucleusCharge += 1;

            // Вычисляем массу ядра
            const nucleusMass = p1.mass + p2.mass;

            // Создаем ядро атома
            const nucleusPos = new Vector2D((pos1.x + pos2.x) / 2,(pos1.y + pos2.y) / 2);

            const atomCore = new AtomCore(nucleusPos, [p1, p2], []);

            // Устанавливаем скорость как среднюю между нуклонами
            const vel1 = p1.getVelocity();
            const vel2 = p2.getVelocity();

            atomCore.setVelocity(new Vector2D((vel1.x + vel2.x) / 2,(vel1.y + vel2.y) / 2));

            // Добавляем ядро и удаляем нуклоны
            this.particlesToAdd.push(atomCore);
            this.removeParticle(p1);
            this.removeParticle(p2);
        }
    }

    /**
     * Обработка формирования атома из ядра и электрона
     */
    private handleAtomForming(p1: AnyParticle, p2: AnyParticle): void {
        let electron: Electron | null = null;
        let atomCore: AtomCore | null = null;

        // Определяем, какая частица электрон, а какая - ядро
        if (p1 instanceof Electron && p2 instanceof AtomCore) {
            electron = p1 as Electron;
            atomCore = p2 as AtomCore;
        } else if (p1 instanceof AtomCore && p2 instanceof Electron) {
            electron = p2 as Electron;
            atomCore = p1 as AtomCore;
        } else {
            return; // Нет подходящей пары для формирования атома
        }

        // Проверяем расстояние между ядром и электроном
        const electronPos = electron.getPosition();
        const corePos = atomCore.getPosition();
        const dx = electronPos.x - corePos.x;
        const dy = electronPos.y - corePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Радиус, в котором электрон может связаться с ядром
        const bindingRadius = 30 + atomCore.charge * 5; // Зависит от заряда ядра

        if (distance > bindingRadius) return; // Слишком далеко

        // Проверяем энергию электрона относительно ядра
        const electronVel = electron.getVelocity();
        const coreVel = atomCore.getVelocity();
        const relVelX = electronVel.x - coreVel.x;
        const relVelY = electronVel.y - coreVel.y;
        const relativeEnergySquared = relVelX * relVelX + relVelY * relVelY;

        // Если электрон движется слишком быстро относительно ядра, не формируем атом
        if (relativeEnergySquared > 25) return;

        // С некоторой вероятностью формируем атом
        if (Math.random() < 0.3) {
            // Создаем атом

            const atomPos = new Vector2D((electronPos.x + corePos.x * atomCore.getMass()) / (1 + atomCore.getMass()),
                (electronPos.y + corePos.y * atomCore.getMass()) / (1 + atomCore.getMass()));

            const atom = new Atom(atomPos, "test", atomCore.protons.length, atomCore.neutrons.length, 1);

            // Устанавливаем скорость, в основном определяемую ядром из-за большей массы

            atom.setVelocity(new Vector2D((electronVel.x + coreVel.x * atomCore.getMass()) / (1 + atomCore.getMass()),
                (electronVel.y + coreVel.y * atomCore.getMass()) / (1 + atomCore.getMass())));

            // Добавляем атом и удаляем ядро и электрон
            this.particlesToAdd.push(atom);
            this.removeParticle(electron);
            this.removeParticle(atomCore);
        }
    }

    /**
     * Обработка формирования молекулы из атомов
     */
    private handleMoleculeForming(p1: AnyParticle, p2: AnyParticle): void {
        // Проверяем, что обе частицы - атомы
        if (!(p1 instanceof Atom) || !(p2 instanceof Atom)) return;

        const atom1 = p1 as Atom;
        const atom2 = p2 as Atom;

        // Проверяем расстояние между атомами
        const pos1 = atom1.getPosition();
        const pos2 = atom2.getPosition();
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Определяем радиус взаимодействия на основе размеров атомов
        const interactionRadius = 20 + atom1.charge * 3 + atom2.charge * 3;

        if (distance > interactionRadius) return; // Слишком далеко

        // Проверяем относительную энергию
        const vel1 = atom1.getVelocity();
        const vel2 = atom2.getVelocity();
        const relVelX = vel2.x - vel1.x;
        const relVelY = vel2.y - vel1.y;
        const relativeEnergySquared = relVelX * relVelX + relVelY * relVelY;

        // Если атомы движутся слишком быстро относительно друг друга, не формируем молекулу
        if (relativeEnergySquared > 10) return;

        // С некоторой вероятностью формируем молекулу
        if (Math.random() < 0.2) {
            const totalMass = atom1.mass + atom2.mass;

            const moleculePos = new Vector2D((pos1.x * atom1.mass + pos2.x * atom2.mass) / totalMass,(pos1.y * atom1.mass + pos2.y * atom2.mass) / totalMass)

            // Создаем молекулу из двух атомов
            const molecule = new Molecule("molecule", moleculePos, [atom1, atom2]);

            // Устанавливаем скорость на основе законов сохранения импульса

            molecule.setVelocity(new Vector2D((vel1.x * atom1.mass + vel2.x * atom2.mass) / totalMass,(vel1.y * atom1.mass + vel2.y * atom2.mass) / totalMass));

            // Добавляем молекулу и удаляем атомы
            this.particlesToAdd.push(molecule);
            this.removeParticle(atom1);
            this.removeParticle(atom2);
        }
    }

    /**
     * Обработка распадов нестабильных частиц
     */
    private handleDecays(deltaTime: number): void {
        for (const particle of this.particles) {
            const particleType = particle.constructor.name;
            const decayProbability = this.decayProbabilities.get(particleType);

            // Если частица имеет вероятность распада
            if (decayProbability && Math.random() < decayProbability * deltaTime) {
                this.handleParticleDecay(particle);
            }
        }
    }

    /**
     * Обработка распада конкретной частицы
     */
    private handleParticleDecay(particle: AnyParticle): void {
        if (particle instanceof Neutron) {
            // Распад нейтрона: n -> p + e- + v̅e
            this.handleNeutronDecay(particle as Neutron);
        } else if (particle instanceof Quark) {
            // Распад кварка через слабое взаимодействие
            this.handleQuarkDecay(particle as Quark);
        } else if (particle.constructor.name === 'Higgs') {
            // Распад бозона Хиггса
            this.handleHiggsDecay(particle);
        }

        // Записываем событие распада
        this.recordSpacetimeEvent({
            position: particle.getPosition(),
            time: this.time,
            type: 'decay',
            particles: [particle],
            energy: particle.mass
        });
    }

    /**
     * Обработка распада нейтрона
     */
    private handleNeutronDecay(neutron: Neutron): void {
        const pos = neutron.getPosition();
        const vel = neutron.getVelocity();

        // Создаем протон как основной продукт распада
        const proton = new Proton(pos);

        proton.setVelocity(new Vector2D(vel.x + (Math.random() - 0.5) * 0.2,vel.y + (Math.random() - 0.5) * 0.2));

        // Создаем электрон
        const electron = new Electron(pos);
        // Электрон получает некоторую часть энергии распада
        const electronSpeed = 2 + Math.random() * 3;
        const electronAngle = Math.random() * Math.PI * 2;

        electron.setVelocity(new Vector2D(vel.x + Math.cos(electronAngle) * electronSpeed,vel.y + Math.sin(electronAngle) * electronSpeed));

        // Добавляем новые частицы и удаляем нейтрон
        this.particlesToAdd.push(proton);
        this.particlesToAdd.push(electron);
        this.removeParticle(neutron);

        // Обновляем статистику
        this.stats.quantumEvents++;
    }

    /**
     * Обработка распада кварка
     */
    private handleQuarkDecay(quark: Quark): void {
        const pos = quark.getPosition();
        const vel = quark.getVelocity();

        // Определяем, какой тип кварка распадается и во что
        const quarkType = quark.getQuarkType();
        // let newQuarkType = 'down';

        let newQuark;
        if (quarkType === 'up') {
            newQuark = new UpQuark(pos);
            // newQuarkType = 'down'; // u -> d + W+
        } else if (quarkType === 'down') {
            newQuark = new DownQuark(pos);
            // newQuarkType = 'up'; // d -> u + W-
        } else if (quarkType === 'strange') {
            newQuark = new StrangeQuark(pos);
            // newQuarkType = 'up'; // s -> u + W-
        } else if (quarkType === 'charm') {
            newQuark = new AntiStrangeQuark(pos);
            // newQuarkType = 'strange'; // c -> s + W+
        } else if (quarkType === 'bottom') {
            newQuark = new AntiDownQuark(pos);
            // newQuarkType = 'charm'; // b -> c + W-
        } else if (quarkType === 'top') {
            newQuark = new AntiUpQuark(pos);
            // newQuarkType = 'bottom'; // t -> b + W+
        }

        // Создаем новый кварк
        newQuark.setVelocity(new Vector2D(vel.x + (Math.random() - 0.5) * 0.5, vel.y + (Math.random() - 0.5) * 0.5));

        // Создаем W-бозон (или виртуальную частицу, представляющую его)
        const wBoson = new WBoson(pos, quarkType.startsWith('u') ? 1 : -1);
        const bosonSpeed = 3 + Math.random() * 2;
        const bosonAngle = Math.random() * Math.PI * 2;

        wBoson.setVelocity(new Vector2D(vel.x + Math.cos(bosonAngle) * bosonSpeed,vel.y + Math.sin(bosonAngle) * bosonSpeed));

        // Добавляем новые частицы и удаляем исходный кварк
        this.particlesToAdd.push(newQuark);
        this.particlesToAdd.push(wBoson);
        this.removeParticle(quark);

        // Обновляем статистику
        this.stats.quantumEvents++;
    }

    /**
     * Обработка распада бозона Хиггса
     */
    private handleHiggsDecay(higgs: AnyParticle): void {
        const pos = higgs.getPosition();
        const vel = higgs.getVelocity();

        // Хиггс может распадаться по разным каналам
        const decayChannels = [
            'bbbar', // b + anti-b
            'WW',    // W+ + W-
            'ZZ',    // Z + Z
            'tautau', // tau + anti-tau
            'gammagamma' // фотон + фотон
        ];

        // Выбираем случайный канал распада
        const channel = decayChannels[Math.floor(Math.random() * decayChannels.length)];

        switch (channel) {
            case 'bbbar':
                // Создаем b-кварк и анти-b-кварк
                const bQuark = new BottomQuark(pos);

                const bBarQuark = new AntiBottomQuark(new Vector2D(pos.x + 1,pos.y + 1));
                bBarQuark.createAntiParticle();

                // Задаем скорости в противоположных направлениях
                const bAngle = Math.random() * Math.PI * 2;
                const bSpeed = 4 + Math.random() * 2;


                bQuark.setVelocity(new Vector2D(vel.x + Math.cos(bAngle) * bSpeed,vel.y + Math.sin(bAngle) * bSpeed));


                bBarQuark.setVelocity(new Vector2D(vel.x - Math.cos(bAngle) * bSpeed,vel.y - Math.sin(bAngle) * bSpeed));

                this.particlesToAdd.push(bQuark);
                this.particlesToAdd.push(bBarQuark);
                break;

            case 'WW':
                // Создаем W+ и W- бозоны
                const wPlus = new WBoson(pos, 1);

                const wMinus = new WBoson(new Vector2D(pos.x + 1,pos.y + 1), -1);

                const wAngle = Math.random() * Math.PI * 2;
                const wSpeed = 3 + Math.random() * 2;


                wPlus.setVelocity(new Vector2D(vel.x + Math.cos(wAngle) * wSpeed,vel.y + Math.sin(wAngle) * wSpeed));


                wMinus.setVelocity(new Vector2D(vel.x - Math.cos(wAngle) * wSpeed,vel.y - Math.sin(wAngle) * wSpeed));

                this.particlesToAdd.push(wPlus);
                this.particlesToAdd.push(wMinus);
                break;

            case 'ZZ':
                // Создаем два Z-бозона
                const z1 = new ZBoson(pos);
                const z2 = new ZBoson(new Vector2D(pos.x + 1, pos.y + 1));

                const zAngle = Math.random() * Math.PI * 2;
                const zSpeed = 3 + Math.random() * 2;


                z1.setVelocity(new Vector2D(vel.x + Math.cos(zAngle) * zSpeed,vel.y + Math.sin(zAngle) * zSpeed));


                z2.setVelocity(new Vector2D(vel.x - Math.cos(zAngle) * zSpeed,vel.y - Math.sin(zAngle) * zSpeed));

                this.particlesToAdd.push(z1);
                this.particlesToAdd.push(z2);
                break;

            case 'gammagamma':
                // Создаем два фотона
                const photon1 = new Photon(pos);

                const photon2 = new Photon(new Vector2D(pos.x + 1,pos.y + 1));

                const photonAngle = Math.random() * Math.PI * 2;
                const photonSpeed = 10; // Фотоны быстрые!


                photon1.setVelocity(new Vector2D(Math.cos(photonAngle) * photonSpeed,Math.sin(photonAngle) * photonSpeed));

                photon2.setVelocity(new Vector2D(-Math.cos(photonAngle) * photonSpeed,-Math.sin(photonAngle) * photonSpeed));

                this.particlesToAdd.push(photon1);
                this.particlesToAdd.push(photon2);
                break;

            case 'tautau':
                // Создаем тау-лептон и анти-тау-лептон
                const tau = new Tau(pos);

                const antiTau = new AntiTau(new Vector2D(pos.x + 1,pos.y + 1));

                const tauAngle = Math.random() * Math.PI * 2;
                const tauSpeed = 3 + Math.random() * 2;

                tau.setVelocity(new Vector2D(vel.x + Math.cos(tauAngle) * tauSpeed,vel.y + Math.sin(tauAngle) * tauSpeed));

                antiTau.setVelocity(new Vector2D(vel.x - Math.cos(tauAngle) * tauSpeed,vel.y - Math.sin(tauAngle) * tauSpeed));

                this.particlesToAdd.push(tau);
                this.particlesToAdd.push(antiTau);
                break;
        }

        // Удаляем бозон Хиггса
        this.removeParticle(higgs);

        // Обновляем статистику
        this.stats.quantumEvents++;
    }

    /**
     * Применение квантовых эффектов к частице
     */
    private applyQuantumEffects(particle: AnyParticle, deltaTime: number): void {
        // Квантовая неопределенность: добавляем случайное смещение к позиции
        if (Math.random() < 0.05 * deltaTime) {
            const pos = particle.getPosition();
            const quantumJitter = 2 / Math.max(1, particle.mass); // Более легкие частицы испытывают большую неопределенность


            particle.setPosition(new Vector2D(pos.x + (Math.random() - 0.5) * quantumJitter,pos.y + (Math.random() - 0.5) * quantumJitter));

            this.stats.quantumEvents++;
        }

        // Квантовое туннелирование: возможность пройти через потенциальный барьер
        if (Math.random() < 0.01 * deltaTime / Math.max(1, particle.mass)) {
            // Реализация туннелирования - например, при столкновении со стеной
            // В данном контексте просто отметим событие
            this.stats.quantumEvents++;
        }

        // Квантовая запутанность: возможность связать две частицы
        if (Math.random() < 0.005 * deltaTime) {
            // Найдем ближайшую подходящую частицу для запутывания
            const nearestParticle = this.findNearestParticleForEntanglement(particle);

            if (nearestParticle) {
                // Реализация запутанности - например, синхронизация свойств
                // В данном контексте просто отметим событие
                this.stats.quantumEvents++;
            }
        }
    }

    /**
     * Поиск ближайшей частицы для квантовой запутанности
     */
    private findNearestParticleForEntanglement(particle: AnyParticle): AnyParticle | null {
        const pos = particle.getPosition();
        let nearestParticle: Particle | null = null;
        let minDistanceSquared = Infinity;

        for (const otherParticle of this.particles) {
            if (otherParticle === particle) continue;

            // Некоторые частицы могут запутываться только с определенными типами
            if (!this.canEntangle(particle, otherParticle)) continue;

            const otherPos = otherParticle.getPosition();
            const dx = otherPos.x - pos.x;
            const dy = otherPos.y - pos.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < minDistanceSquared && distanceSquared < 100) {
                minDistanceSquared = distanceSquared;
                nearestParticle = otherParticle;
            }
        }

        return nearestParticle;
    }

    /**
     * Проверка возможности квантовой запутанности между частицами
     */
    private canEntangle(p1: AnyParticle, p2: AnyParticle): boolean {
        // Примеры правил запутанности:
        // 1. Фотоны могут запутываться с фотонами
        if (p1 instanceof Photon && p2 instanceof Photon) return true;

        // 2. Электроны могут запутываться с электронами
        if (p1 instanceof Electron && p2 instanceof Electron) return true;

        // 3. Кварки могут запутываться с кварками того же типа
        if (p1 instanceof Quark && p2 instanceof Quark) {
            return (p1 as Quark).getQuarkType() === (p2 as Quark).getQuarkType();
        }

        return false;
    }

    /**
     * Обработка столкновений частиц с границами симуляции
     */
    private handleBoundaryCollisions(particle: AnyParticle): void {
        const pos = particle.getPosition();
        const vel = particle.getVelocity();
        const radius = (particle as any).radius || 5; // Используем радиус частицы, если он есть

        let newPos = pos;
        let newVel = vel;
        let collision = false;

        // Проверяем столкновения с границами в зависимости от настроек
        switch (this.config.boundaryBehavior) {
            case 'wrap':
                // Частица появляется с другой стороны
                if (pos.x < -radius) {
                    newPos.x = this.config.canvasWidth + radius;
                    collision = true;
                } else if (pos.x > this.config.canvasWidth + radius) {
                    newPos.x = -radius;
                    collision = true;
                }

                if (pos.y < -radius) {
                    newPos.y = this.config.canvasHeight + radius;
                    collision = true;
                } else if (pos.y > this.config.canvasHeight + radius) {
                    newPos.y = -radius;
                    collision = true;
                }
                break;

            case 'bounce':
                // Частица отскакивает от границ
                if (pos.x - radius < 0) {
                    newPos.x = radius;
                    newVel.x = Math.abs(vel.x);
                    collision = true;
                } else if (pos.x + radius > this.config.canvasWidth) {
                    newPos.x = this.config.canvasWidth - radius;
                    newVel.x = -Math.abs(vel.x);
                    collision = true;
                }

                if (pos.y - radius < 0) {
                    newPos.y = radius;
                    newVel.y = Math.abs(vel.y);
                    collision = true;
                } else if (pos.y + radius > this.config.canvasHeight) {
                    newPos.y = this.config.canvasHeight - radius;
                    newVel.y = -Math.abs(vel.y);
                    collision = true;
                }
                break;

            case 'absorb':
                // Частица удаляется при выходе за границы
                if (pos.x < -radius || pos.x > this.config.canvasWidth + radius ||
                    pos.y < -radius || pos.y > this.config.canvasHeight + radius) {
                    this.removeParticle(particle)
                    collision = true;
                }
                break;
        }

        // Применяем новую позицию и скорость, если произошло столкновение
        if (collision) {
            particle.setPosition(newPos);
            particle.setVelocity(newVel);
        }
    }

    /**
     * Обновление следа частицы
     */
    private updateParticleTrail(particle: AnyParticle): void {
        const pos = particle.getPosition();

        if (!this.particleTrails.has(particle)) {
            this.particleTrails.set(particle, []);
        }

        const trail = this.particleTrails.get(particle);
        if (trail) {
            trail.push(pos);

            // Ограничиваем длину следа
            while (trail.length > this.config.trailLength) {
                trail.shift();
            }
        }
    }

    /**
     * Применение отложенных изменений (добавление/удаление частиц)
     */
    private applyPendingChanges(): void {
        // Добавляем новые частицы
        for (const particle of this.particlesToAdd) {
            this.particles.push(particle);

            // Инициализируем след для новой частицы
            if (this.config.showParticleTrails) {
                this.particleTrails.set(particle, [particle.getPosition()]);
            }
        }

        // Удаляем частицы, помеченные для удаления
        if (this.particlesToRemove.size > 0) {
            this.particles = this.particles.filter(particle => !this.particlesToRemove.has(particle));

            // Удаляем следы для удаленных частиц
            for (const particle of this.particlesToRemove) {
                this.particleTrails.delete(particle);
            }
        }

        // Обновляем статистику
        this.stats.totalParticles = this.particles.length;

        // Очищаем списки отложенных изменений
        this.particlesToAdd = [];
        this.particlesToRemove.clear();
    }

    /**
     * Запись события пространства-времени
     */
    private recordSpacetimeEvent(event: SpacetimeEvent): void {
        this.eventHistory.push(event);

        // Ограничиваем размер истории событий
        while (this.eventHistory.length > 1000) {
            this.eventHistory.shift();
        }
    }

    /**
     * Обновление статистики симуляции
     */
    private updateStats(): void {
        // Обновляем общую энергию системы
        let totalEnergy = 0;
        let totalMomentumX = 0;
        let totalMomentumY = 0;

        for (const particle of this.particles) {
            const vel = particle.getVelocity();
            const mass = particle.mass;
            const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

            // Кинетическая энергия
            const kineticEnergy = 0.5 * mass * speed * speed;

            // Для релятивистских частиц (например, фотонов) можно добавить E = mc²
            let restEnergy = 0;
            if (particle instanceof Photon) {
                // Для фотонов энергия E = hf, где h - постоянная Планка, f - частота
                // В этой симуляции используем E = c * p, где p - импульс
                restEnergy = speed * Math.sqrt(vel.x * vel.x + vel.y * vel.y);
            } else {
                // Для массивных частиц используем E = mc²
                restEnergy = mass * 9e16; // c² приблизительно равно 9·10¹⁶ м²/с²
            }

            totalEnergy += kineticEnergy + restEnergy;

            // Импульс
            totalMomentumX += mass * vel.x;
            totalMomentumY += mass * vel.y;
        }

        this.stats.totalEnergy = totalEnergy;

        this.stats.totalMomentum = new Vector2D(totalMomentumX, totalMomentumY);

        // Оценка средней температуры системы (пропорциональна средней кинетической энергии частиц)
        if (this.particles.length > 0) {
            const avgKineticEnergy = totalEnergy / this.particles.length;
            this.stats.averageTemperature = avgKineticEnergy * 100; // Произвольный коэффициент для визуализации
        }

        // Оценка стабильности системы (чем меньше флуктуации энергии, тем выше стабильность)
        // В реальной симуляции можно использовать более сложные метрики
        const energyFluctuation = Math.abs(totalEnergy - this.stats.totalEnergy) / Math.max(1, totalEnergy);
        this.stats.stabilityIndex = 1.0 / (1.0 + energyFluctuation);
    }

    /**
     * Обновление данных для визуализации полей
     */
    private updateFieldVisualization(): void {
        // Обнуляем текущие данные полей
        const gridSize = this.fieldVisualizationData.length;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                this.fieldVisualizationData[i][j] = 0;
            }
        }

        // Для каждой частицы вычисляем ее вклад в поле в каждой точке сетки
        for (const particle of this.particles) {
            const pos = particle.getPosition();
            const charge = particle.charge;

            // Пропускаем нейтральные частицы
            if (charge === 0) continue;

            // Преобразуем координаты в индексы сетки
            const cellWidth = this.config.canvasWidth / gridSize;
            const cellHeight = this.config.canvasHeight / gridSize;

            // Для оптимизации вычисляем только ближайшие ячейки
            const cellX = Math.floor(pos.x / cellWidth);
            const cellY = Math.floor(pos.y / cellHeight);
            const radius = 5; // Радиус влияния в ячейках

            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const i = cellX + dx;
                    const j = cellY + dy;

                    // Проверяем, что индексы в пределах сетки
                    if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
                        // Центр ячейки
                        const cellCenterX = (i + 0.5) * cellWidth;
                        const cellCenterY = (j + 0.5) * cellHeight;

                        // Расстояние от частицы до центра ячейки
                        const distX = cellCenterX - pos.x;
                        const distY = cellCenterY - pos.y;
                        const distanceSquared = distX * distX + distY * distY;

                        if (distanceSquared > 0) {
                            // Вклад в поле обратно пропорционален квадрату расстояния
                            const fieldContribution = charge / distanceSquared;
                            this.fieldVisualizationData[i][j] += fieldContribution;
                        }
                    }
                }
            }
        }
    }

    /**
     * Отрисовка текущего состояния симуляции
     */
    private redraw(): void {
        // Очищаем канвас
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Если включена визуализация полей, отрисовываем их
        if (this.config.showForceFields) {
            this.updateFieldVisualization();
            this.drawFields();
        }

        // Отрисовываем следы частиц, если они включены
        if (this.config.showParticleTrails) {
            this.drawParticleTrails();
        }

        // Отрисовываем частицы
        this.drawParticles();

        // Отрисовываем статистику
        this.drawStats();
    }

    /**
     * Отрисовка силовых полей
     */
    private drawFields(): void {
        const gridSize = this.fieldVisualizationData.length;
        const cellWidth = this.config.canvasWidth / gridSize;
        const cellHeight = this.config.canvasHeight / gridSize;

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const fieldStrength = this.fieldVisualizationData[i][j];

                // Пропускаем ячейки с очень слабым полем
                if (Math.abs(fieldStrength) < 0.1) continue;

                // Определяем цвет на основе знака и силы поля
                let r, g, b, a;
                if (fieldStrength > 0) {
                    // Положительное поле - красный цвет
                    r = Math.min(255, Math.floor(fieldStrength * 50));
                    g = 0;
                    b = 0;
                } else {
                    // Отрицательное поле - синий цвет
                    r = 0;
                    g = 0;
                    b = Math.min(255, Math.floor(-fieldStrength * 50));
                }
                a = Math.min(0.5, Math.abs(fieldStrength) * 0.2);

                const x = i * cellWidth;
                const y = j * cellHeight;

                // Рисуем ячейку с полупрозрачным цветом
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                this.ctx.fillRect(x, y, cellWidth, cellHeight);
            }
        }
    }

    /**
     * Отрисовка следов частиц
     */
    private drawParticleTrails(): void {
        for (const [particle, trail] of this.particleTrails.entries()) {
            if (trail.length < 2) continue;

            this.ctx.beginPath();
            this.ctx.moveTo(trail[0].x, trail[0].y);

            for (let i = 1; i < trail.length; i++) {
                this.ctx.lineTo(trail[i].x, trail[i].y);
            }

            // Устанавливаем стиль линии в зависимости от типа частицы
            const particleType = particle.constructor.name;
            let strokeStyle = 'rgba(255, 255, 255, 0.3)'; // По умолчанию бледно-белый

            if (particle instanceof Electron) {
                strokeStyle = 'rgba(0, 0, 255, 0.3)'; // Синий для электронов
            } else if (particle instanceof Proton) {
                strokeStyle = 'rgba(255, 0, 0, 0.3)'; // Красный для протонов
            } else if (particle instanceof Neutron) {
                strokeStyle = 'rgba(128, 128, 128, 0.3)'; // Серый для нейтронов
            } else if (particle instanceof Photon) {
                strokeStyle = 'rgba(255, 255, 0, 0.3)'; // Желтый для фотонов
            } else if (particle instanceof Quark) {
                strokeStyle = 'rgba(0, 255, 0, 0.3)'; // Зеленый для кварков
            }

            this.ctx.strokeStyle = this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    /**
     * Отрисовка частиц
     */
    private drawParticles(): void {
        for (const particle of this.particles) {
            const pos = particle.getPosition();
            const radius = (particle as any).radius || 5; // Используем радиус частицы, если он есть

            // Задаем стиль в зависимости от типа частицы
            let fillStyle = 'white';
            let strokeStyle = 'black';
            let drawMethod = 'circle';

            if (particle instanceof Electron) {
                fillStyle = 'blue';
                strokeStyle = 'lightblue';
            } else if (particle instanceof Proton) {
                fillStyle = 'red';
                strokeStyle = 'salmon';
            } else if (particle instanceof Neutron) {
                fillStyle = 'gray';
                strokeStyle = 'darkgray';
            } else if (particle instanceof Photon) {
                fillStyle = 'yellow';
                strokeStyle = 'gold';
                drawMethod = 'wave';
            } else if (particle instanceof Quark) {
                const quark = particle as Quark;
                const quarkType = quark.getQuarkType();

                switch (quarkType) {
                    case 'up':
                        fillStyle = 'lightgreen';
                        break;
                    case 'down':
                        fillStyle = 'darkgreen';
                        break;
                    case 'strange':
                        fillStyle = 'purple';
                        break;
                    case 'charm':
                        fillStyle = 'turquoise';
                        break;
                    case 'bottom':
                        fillStyle = 'navy';
                        break;
                    case 'top':
                        fillStyle = 'maroon';
                        break;
                    default:
                        fillStyle = 'green';
                }

                strokeStyle = quark.isAntiParticle() ? 'white' : 'black';
            } else if (particle instanceof Boson) {
                fillStyle = 'orange';
                strokeStyle = 'darkorange';
                drawMethod = 'square';
            } else if (particle instanceof AtomCore) {
                fillStyle = 'crimson';
                strokeStyle = 'red';
            } else if (particle instanceof Atom) {
                fillStyle = 'royalblue';
                strokeStyle = 'blue';
                drawMethod = 'atom';
            } else if (particle instanceof Molecule) {
                fillStyle = 'teal';
                strokeStyle = 'darkslategray';
                drawMethod = 'molecule';
            } else if (particle instanceof Hadron) {
                fillStyle = 'magenta';
                strokeStyle = 'purple';
            } else if (particle instanceof Lepton) {
                fillStyle = 'deepskyblue';
                strokeStyle = 'dodgerblue';
            }

            particle.draw(this.ctx);

            // Отображаем заряд частицы, если он есть
            const charge = particle.charge;
            if (charge !== 0) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '10px Arial';
                const chargeSign = charge > 0 ? '+' : '-';
                const chargeText = Math.abs(charge) === 1 ? chargeSign : `${chargeSign}${Math.abs(charge)}`;
                this.ctx.fillText(chargeText, pos.x + radius + 2, pos.y - radius - 2);
            } else {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(particle.constructor.name, pos.x + radius + 2, pos.y - radius - 2);
            }
        }
    }

    /**
     * Отрисовка статистики
     */
    private drawStats(): void {
        // if (!this.config.showStats) return;

        const padding = 10;
        const lineHeight = 20;
        let y = padding;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, 250, 160);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'white';

        this.ctx.fillText(`Частиц: ${this.stats.totalParticles}`, padding + 50, y += lineHeight);
        this.ctx.fillText(`Время: ${this.time.toFixed(2)}`, padding + 50, y += lineHeight);
        this.ctx.fillText(`Энергия: ${this.stats.totalEnergy.toExponential(2)}`, padding + 50, y += lineHeight);
        this.ctx.fillText(`Температура: ${this.stats.averageTemperature.toFixed(2)}`, padding + 50, y += lineHeight);
        this.ctx.fillText(`Стабильность: ${(this.stats.stabilityIndex * 100).toFixed(1)}%`, padding + 50, y += lineHeight);
        this.ctx.fillText(`Квантовые события: ${this.stats.quantumEvents}`, padding + 50, y += lineHeight);

        // Отображаем количество взаимодействий по типам
        y += lineHeight / 2; // Дополнительный отступ
        this.ctx.fillText('Взаимодействия:', padding + 50, y += lineHeight);

        // Электромагнитные
        const emCount = this.stats.interactionCount.get(InteractionType.ELECTROMAGNETIC) || 0;
        this.ctx.fillText(`- ЭМ: ${emCount}`, padding + 50, y += lineHeight);

        // Сильные
        const strongCount = this.stats.interactionCount.get(InteractionType.STRONG) || 0;
        this.ctx.fillText(`- Сильные: ${strongCount}`, padding + 50, y += lineHeight);

        // Слабые
        const weakCount = this.stats.interactionCount.get(InteractionType.WEAK) || 0;
        this.ctx.fillText(`- Слабые: ${weakCount}`, padding + 50, y += lineHeight);

        // Гравитационные
        const gravCount = this.stats.interactionCount.get(InteractionType.GRAVITATIONAL) || 0;
        this.ctx.fillText(`- Грав.: ${gravCount}`, padding + 50, y += lineHeight);
    }

    /**
     * Инициализация симуляции
     */
    public init(): void {
        // Инициализируем сетку для визуализации полей
        const gridSize = 50; // 50x50 ячеек
        this.fieldVisualizationData = new Array(gridSize);
        for (let i = 0; i < gridSize; i++) {
            this.fieldVisualizationData[i] = new Array(gridSize).fill(0);
        }

        // Инициализируем вероятности распада частиц
        this.initDecayProbabilities();

        // Создаем начальные частицы
        this.createInitialParticles();

        // Запускаем цикл обновления
        this.lastUpdateTime = performance.now();
        this.updateLoop();
    }

    /**
     * Инициализация вероятностей распада частиц
     */
    private initDecayProbabilities(): void {
        this.decayProbabilities = new Map<string, number>();

        // Устанавливаем вероятности распада в единицу времени
        this.decayProbabilities.set('Neutron', 0.0001); // Нейтроны нестабильны вне ядра
        this.decayProbabilities.set('Higgs', 0.005);    // Бозон Хиггса крайне нестабилен

        // Некоторые кварки тоже нестабильны
        this.decayProbabilities.set('TopQuark', 0.01);
        this.decayProbabilities.set('BottomQuark', 0.001);
        this.decayProbabilities.set('StrangeQuark', 0.0001);
    }

    /**
     * Создание начальных частиц для симуляции
     */
    private createInitialParticles(): void {
        const { width, height } = this.canvas;
        const particleCount = this.config.initialParticleCount;

        for (let i = 0; i < particleCount; i++) {
            // Случайная позиция в пределах канваса

            const position = new Vector2D(Math.random() * width, Math.random() * height);

            // Случайная скорость
            const velocity = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            };

            // Создаем случайную частицу
            const particleType = Math.random();
            let particle: AnyParticle;

            if (particleType < 0.25) {
                // Электрон
                particle = new Electron(position);
            } else if (particleType < 0.5) {
                // Протон
                particle = new Proton(position);
            } else if (particleType < 0.75) {
                // Нейтрон
                particle = new Neutron(position);
            } else if (particleType < 0.9) {
                // Фотон
                particle = new Photon(position);
                // Фотоны быстрее
                velocity.x *= 5;
                velocity.y *= 5;
            } else {
                // Кварк
                const quarkTypes = ['up', 'down', 'strange', 'charm', 'bottom', 'top'];
                const type = quarkTypes[Math.floor(Math.random() * quarkTypes.length)];
                switch (type) {
                    case 'up':
                        particle = new UpQuark(position); //random
                        break;
                    case 'down':
                        particle = new DownQuark(position);
                        break;
                    case 'strange':
                        particle = new StrangeQuark(position);
                        break;
                    case 'charm':
                        particle = new CharmQuark(position);
                        break
                    case 'bottom':
                        particle = new BottomQuark(position);
                        break
                    case 'top':
                        particle = new TopQuark(position);
                        break
                    default:
                        particle = new UpQuark(position);
                }

                // Некоторые кварки могут быть антикварками
                if (Math.random() < 0.5) {
                    (particle as Quark).createAntiParticle();
                }
            }

            // Устанавливаем скорость
            particle.setVelocity(velocity);

            // Добавляем частицу в симуляцию
            this.particles.push(particle);

            // Инициализируем след для частицы, если они включены
            if (this.config.showParticleTrails) {
                this.particleTrails.set(particle, [position]);
            }
        }

        // Обновляем статистику
        this.stats.totalParticles = this.particles.length;
    }

    /**
     * Цикл обновления симуляции
     */
    private updateLoop(): void {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // в секундах
        this.lastUpdateTime = currentTime;

        // Ограничиваем deltaTime, чтобы избежать проблем при приостановке вкладки
        const clampedDeltaTime = Math.min(deltaTime, 0.1);

        // Обновляем симуляцию
        this.update(clampedDeltaTime);

        // Перерисовываем
        this.redraw();

        // Запрашиваем следующий кадр
        requestAnimationFrame(() => this.updateLoop());
    }

    /**
     * Изменение скорости симуляции
     */
    public setSimulationSpeed(speed: number): void {
        this.config.timeScale = Math.max(0.1, Math.min(10, speed));
    }

    /**
     * Включение/выключение отображения следов частиц
     */
    public toggleParticleTrails(enabled: boolean): void {
        this.config.showParticleTrails = enabled;

        // Если включаем следы, инициализируем их для текущих частиц
        if (enabled) {
            for (const particle of this.particles) {
                if (!this.particleTrails.has(particle)) {
                    this.particleTrails.set(particle, [particle.getPosition()]);
                }
            }
        }
    }

    /**
     * Включение/выключение отображения силовых полей
     */
    public toggleForceFields(enabled: boolean): void {
        this.config.showForceFields = enabled;
    }

    /**
     * Включение/выключение отображения статистики
     */
    public toggleStats(enabled: boolean): void {
        // this.config.showStats = enabled;
    }

    /**
     * Установка способа обработки границ симуляции
     */
    public setBoundaryBehavior(behavior: 'wrap' | 'bounce' | 'absorb'): void {
        this.config.boundaryBehavior = behavior;
    }

    /**
     * Получение текущей статистики симуляции
     */
    public getStats(): SimulationStats {
        return {particleTypeCount: undefined, ...this.stats };
    }

    /**
     * Получение истории событий симуляции
     */
    public getEventHistory(): SpacetimeEvent[] {
        return [...this.eventHistory];
    }

    /**
     * Сброс симуляции
     */
    public reset(): void {
        // Очищаем все частицы
        this.particles = [];
        this.particlesToAdd = [];
        this.particlesToRemove.clear();
        this.particleTrails.clear();

        // Сбрасываем статистику
        this.stats = {
            particleTypeCount: new Map<string, number>(),
            totalParticles: 0,
            totalEnergy: 0,
            totalMomentum: new Vector2D(0, 0),
            averageTemperature: 0,
            stabilityIndex: 1.0,
            interactionCount: new Map<InteractionType, number>(),
            quantumEvents: 0,
            particleCreationEvents: 0,
            particleDestructionEvents: 0
        };

        // Сбрасываем историю событий
        this.eventHistory = [];

        // Сбрасываем время
        this.time = 0;

        // Создаем новые начальные частицы
        this.createInitialParticles();
    }
}