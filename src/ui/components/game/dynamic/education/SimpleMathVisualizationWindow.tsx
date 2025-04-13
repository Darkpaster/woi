import {useEffect} from "react";
import {Visualization} from "../../../../../core/logic/education/math/visualization/visualization.ts";

export const ChemicalReactionsSimulationWindow = () => {
    useEffect(() => {
        const simulation = new Visualization.MathCanvas();
        try {

            const stopButton = document.getElementById('stop-button');
            const startButton = document.getElementById('start-button');

            // if (stopButton) {
            //     stopButton.addEventListener('click', () => simulation.stop());
            // }
            if (startButton) {
                startButton.addEventListener('click', () => simulation.start());
            }
        } catch (error) {
            console.error('Ошибка инициализации симуляции:', error);
        }

        // return () => {
        //     simulation.stop();
        // }
    }, []);
    return (
        <div className={"ui-div"}>
            <h1>Визуализация математики</h1>
    <canvas id="math-canvas"></canvas>
        <div className="controls">
    <button id="stop-button" className={"ui-div"}>остановить</button>
        <button id="start-button" className={"ui-div"}>запустить</button>
        </div>
        </div>
)
}