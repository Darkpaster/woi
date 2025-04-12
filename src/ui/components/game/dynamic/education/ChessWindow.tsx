import {useEffect} from "react";
import {ChessRenderer} from "../../../../../core/logic/education/chess/visualization/chessRenderer.ts";
import {Board} from "../../../../../core/logic/education/chess/board/board.ts";


export const ChessWindow = () => {
    useEffect(() => {
        const chess = new ChessRenderer("chess-canvas", new Board(), window.innerHeight / 1.5);
        try {
            chess.drawBoard();
            chess.drawPieces();
            chess.render();

            // Добавляем кнопки управления (опционально)
            // const stopButton = document.getElementById('stopButton');
            // const startButton = document.getElementById('startButton');
            //
            // if (stopButton) {
            //     stopButton.addEventListener('click', () => simulation.stop());
            // }
            //
            // if (startButton) {
            //     startButton.addEventListener('click', () => simulation.start());
            // }
        } catch (error) {
            console.error('Ошибка инициализации симуляции:', error);
        }

        return () => {
            // simulation.;
        }
    }, []);
    return (
        <div className={"ui-div"}>
            <h1>Шахматы</h1>
            <canvas id="chess-canvas"></canvas>
            {/*<div className="controls">*/}
                {/*<button id="startButton">Запустить</button>*/}
                {/*<button id="stopButton">Остановить</button>*/}
            {/*</div>*/}
        </div>
    )
}