import {useEffect} from "react";
import {ParticleSimulation} from "../../../../core/logic/education/physics/visualization/particles/particleSimulation.ts";


export const ParticleSimulationWindow = () => {
    useEffect(() => {
        const simulation = new ParticleSimulation("particle-canvas", { x: window.innerWidth - 100, y: window.innerHeight - 200}, 0);
        try {
            simulation.init();
            simulation.start();

            const clearButton = document.getElementById('clear-button');
            const stopButton = document.getElementById('stop-button');
            const startButton = document.getElementById('start-button');

            if (clearButton) {
                clearButton.addEventListener('click', () => simulation.clear());
            }
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
            <canvas id="particle-canvas"></canvas>
            <div className="controls">
                <button id="clear-button" className={"ui-div"}>очистить</button>
                <button id="stop-button" className={"ui-div"}>остановить</button>
                <button id="start-button" className={"ui-div"}>запустить</button>
            </div>
        </div>
    )
}