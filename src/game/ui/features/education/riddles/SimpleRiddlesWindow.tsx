import {useEffect} from "react";
import {initializeRiddleQuest} from "../../../../core/logic/education/riddle.ts";

export const SimpleRiddlesWindow = () => {
    useEffect(() => {
        const riddles = initializeRiddleQuest("riddle-canvas", 800);
        // try {
        //
        //     const stopButton = document.getElementById('stop-button');
        //     const startButton = document.getElementById('start-button');
        //
        //     if (stopButton) {
        //         stopButton.addEventListener('click', () => simulation.stop());
        //     }
        //     if (startButton) {
        //         startButton.addEventListener('click', () => simulation.start());
        //     }
        // } catch (error) {
        //     console.error('Ошибка инициализации симуляции:', error);
        // }
        //
        // return () => {
        //     simulation.stop();
        // }
    }, []);
    return (
        <div className={"ui-div"}>
            <h1>Загадки</h1>
            <canvas id="riddle-canvas"></canvas>
            {/*<div className="controls">*/}
                {/*<button id="stop-button" className={"ui-div"}>остановить</button>*/}
                {/*<button id="start-button" className={"ui-div"}>запустить</button>*/}
            {/*</div>*/}
        </div>
    )
}