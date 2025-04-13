import {useEffect} from "react";
import {
    SimpleParticleSimulation
} from "../../../../../core/logic/education/physics/visualization/particles/draft/simpleParticleSimulation.ts";


export const SimpleParticleSimulationWindow = () => {
    useEffect(() => {
        const simulation = new SimpleParticleSimulation("particle-canvas");
        try {
            simulation.start();

            const stopButton = document.getElementById('stop-button');
            const startButton = document.getElementById('start-button');

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
            <h1>Симуляция взаимодействия p+ и e-</h1>
    <canvas id="particle-canvas"></canvas>
        <div className="controls">
        <button id="stop-button" className={"ui-div"}>остановить</button>
        <button id="start-button" className={"ui-div"}>запустить</button>
        </div>
        </div>
)
}