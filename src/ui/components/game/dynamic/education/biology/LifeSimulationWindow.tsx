import {useEffect} from "react";
import {BiologicalSimulation} from "../../../../../../core/logic/education/biology/simulations/simulation.ts";


export const LifeSimulationWindow = () => {
    useEffect(() => {
        const simulation = new BiologicalSimulation("life-canvas");

    }, []);
    return (
        <div className={"ui-div"}>
            <h1>Симуляция микро жизни</h1>
    <canvas id="life-canvas"></canvas>
        <div className="controls">
    <button id="clear-button" className={"ui-div"}>очистить</button>
        <button id="stop-button" className={"ui-div"}>остановить</button>
        <button id="start-button" className={"ui-div"}>запустить</button>
        </div>
        </div>
)
}