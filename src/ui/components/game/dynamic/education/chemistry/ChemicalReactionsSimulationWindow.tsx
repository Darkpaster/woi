import {useEffect} from "react";
import {
    ChemistrySimulationApp
} from "../../../../../../core/logic/education/chemistry/simulations/baseChemistrySimulation.ts";

export const ChemicalReactionsSimulationWindow = () => {
    useEffect(() => {
        const simulation = new ChemistrySimulationApp("chemistry-canvas");
        try {
            simulation.start();

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
            <h1>Симуляция химических реакций</h1>
            <canvas id="chemistry-canvas"></canvas>
            <div className="controls">
                <button id="stop-button" className={"ui-div"}>остановить</button>
                <button id="start-button" className={"ui-div"}>запустить</button>
            </div>
        </div>
    )
}