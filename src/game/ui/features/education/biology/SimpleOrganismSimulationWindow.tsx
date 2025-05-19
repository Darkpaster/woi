import {memo, RefObject, useCallback, useEffect, useRef, useState} from 'react';
import "./styles.scss";
import {LifeSimulation} from "../../../../core/logic/education/biology/classification/simulation.ts";
import {CellType} from "../../../../core/logic/education/biology/classification/cell.ts";

// Оптимизированный компонент для отображения канваса
const SimulationCanvas = memo(({ width, height, simulationRef }: {width: number, height: number, simulationRef: RefObject<LifeSimulation>}) => {
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const animationFrameRef = useRef(null);
    const lastTimeRef = useRef(0);

    // Функция анимации - оптимизирована для производительности
    const animate = useCallback((timestamp) => {
        if (!canvasRef.current || !simulationRef.current) return;

        // Целевой FPS - 20 кадров в секунду (интервал 50 мс)
        const targetFPS = 20;
        const frameInterval = 1000 / targetFPS;

        // Проверяем, прошло ли достаточно времени с последнего кадра
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const elapsed = timestamp - lastTimeRef.current;

        if (elapsed > frameInterval) {
            // Обновляем lastTime с учетом дискретных шагов для равномерности
            // Не используем прямое присвоение timestamp, чтобы избежать пропусков кадров
            lastTimeRef.current = timestamp - (elapsed % frameInterval);

            // Получаем контекст рисования
            const ctx = canvasRef.current.getContext('2d', { alpha: false });

            // Вычисляем dt в секундах и ограничиваем его
            const dt = Math.min(elapsed / 1000, 0.1);

            // Обновляем и отрисовываем симуляцию
            simulationRef.current.update(dt);
            simulationRef.current.draw(ctx);
        }

        // Планируем следующий кадр
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [simulationRef]);

    // Настраиваем анимационный цикл
    useEffect(() => {
        if (!canvasRef.current) return;

        // Оптимизация: задаем размеры канваса только один раз при монтировании
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        (canvasRef.current as HTMLCanvasElement).addEventListener("click", (event) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            simulationRef.current?.addCells(CellType.EUKARYOTE_ANIMAL, 1, x, y);
        })

        // Запускаем анимационный цикл
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [width, height, animate]);

    return (
        <canvas
            ref={canvasRef}
            id="simulation-canvas"
            className="simulation-canvas"
        />
    );
});

// Оптимизированный компонент слайдера
const SimulationSlider = memo(({ id, label, min, max, defaultValue, onChange }:
                               {id: number, label: string, min: number, max: number, defaultValue: number, onChange: () => void}) => {
    const [value, setValue] = useState(defaultValue);

    const handleChange = useCallback((e) => {
        const newValue = parseFloat(e.target.value);
        setValue(newValue);
        onChange(newValue);
    }, [onChange]);

    return (
        <div className="slider-control">
            <label htmlFor={id}>{label}</label>
            <input
                type="range"
                id={id}
                min={min}
                max={max}
                value={value}
                onChange={handleChange}
            />
            <span className="slider-value">{value}{id === 'temperature' ? '°C' : '%'}</span>
        </div>
    );
});

const SimpleOrganismSimulationWindow = () => {
    const simulationRef = useRef<LifeSimulation|null>(null);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth - 20,
        height: window.innerHeight - 100
    });

    // Обработчик изменения размера окна с дебаунсом
    useEffect(() => {
        let resizeTimer;

        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setDimensions({
                    width: window.innerWidth - 20,
                    height: window.innerHeight - 100
                });

                // Обновляем размеры в симуляции, если она существует
                if (simulationRef.current) {
                    simulationRef.current.width = window.innerWidth - 20;
                    simulationRef.current.height = window.innerHeight - 100;
                }
            }, 200); // Задержка в 200 мс для дебаунса
        };

        window.addEventListener('resize', handleResize);

        // Инициализация симуляции
        simulationRef.current = new LifeSimulation(dimensions.width, dimensions.height);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    // Мемоизированные обработчики событий для кнопок
    const handleAddFood = useCallback(() => {
        simulationRef.current?.addFood(10);
    }, []);

    const handleAddBacteria = useCallback(() => {
        simulationRef.current?.addCells(CellType.PROKARYOTE, 5);
    }, []);

    const handleAddPlants = useCallback(() => {
        simulationRef.current?.addCells(CellType.EUKARYOTE_PLANT, 3);
    }, []);

    const handleAddAnimals = useCallback(() => {
        simulationRef.current?.addCells(CellType.EUKARYOTE_ANIMAL, 3);
    }, []);

    // Мемоизированные обработчики для слайдеров
    const handleTemperatureChange = useCallback((value) => {
        simulationRef.current?.adjustEnvironment('temperature', value);
    }, []);

    const handleLightChange = useCallback((value) => {
        simulationRef.current?.adjustEnvironment('light', value);
    }, []);

    const handleMoistureChange = useCallback((value) => {
        simulationRef.current?.adjustEnvironment('moisture', value);
    }, []);

    return (
        <div className="simulation-container">
            <h1>Cell Evolution Simulation</h1>

            <SimulationCanvas
                width={dimensions.width}
                height={dimensions.height}
                simulationRef={simulationRef}
            />

            <div className="controls-panel">
                <h3>Simulation Controls</h3>

                <div className="button-group">
                    <button onClick={handleAddFood}>Add Food</button>
                    <button onClick={handleAddBacteria}>Add Bacteria</button>
                    <button onClick={handleAddPlants}>Add Plant Cells</button>
                    <button onClick={handleAddAnimals}>Add Animal Cells</button>
                </div>

                <hr />

                <div className="slider-group">
                    <SimulationSlider
                        id="temperature"
                        label="Temperature"
                        min={-10}
                        max={40}
                        defaultValue={25}
                        onChange={handleTemperatureChange}
                    />

                    <SimulationSlider
                        id="light"
                        label="Light"
                        min={0}
                        max={100}
                        defaultValue={50}
                        onChange={handleLightChange}
                    />

                    <SimulationSlider
                        id="moisture"
                        label="Moisture"
                        min={0}
                        max={100}
                        defaultValue={60}
                        onChange={handleMoistureChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default SimpleOrganismSimulationWindow;