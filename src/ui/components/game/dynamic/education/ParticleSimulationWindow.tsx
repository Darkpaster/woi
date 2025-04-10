import {useEffect} from "react";
import {ParticleSimulation} from "../../../../../core/logic/education/physics/particles/particleSimulation.ts";


export const ParticleSimulationWindow = () => {
    useEffect(() => {
        // HTML должен содержать: <canvas id="particleCanvas"></canvas>
        // const simulation = new ParticleSimulation('particleCanvas');
        const simulation = new ParticleSimulation("particleCanvas", 100);
        try {
            // simulation.start();
            simulation.init();
            simulation.start();

            // Добавляем кнопки управления (опционально)
            const stopButton = document.getElementById('stopButton');
            const startButton = document.getElementById('startButton');

            if (stopButton) {
                stopButton.addEventListener('click', () => simulation.stop());
            }

            if (startButton) {
                startButton.addEventListener('click', () => simulation.start());
            }
        } catch (error) {
            console.error('Ошибка инициализации симуляции:', error);
        }

        return () => {
            simulation.stop();
        }
    }, []);
    return (
        <div className={"ui-div"}>
            <h1>Симуляция элементарных частиц</h1>
            <canvas id="particleCanvas"></canvas>
            <div className="controls">
                <button id="startButton">Запустить</button>
                <button id="stopButton">Остановить</button>
            </div>
        </div>
    )
}