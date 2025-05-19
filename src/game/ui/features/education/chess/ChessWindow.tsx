import {useEffect} from "react";
import {ChessRenderer} from "../../../../core/logic/education/chess/visualization/chessRenderer.ts";
import {Board} from "../../../../core/logic/education/chess/board/board.ts";
import {ChessController} from "../../../../core/logic/education/chess/game/chessController.ts";
import {Game} from "../../../../core/logic/education/chess/game/game.ts";


export const ChessWindow = () => {
    useEffect(() => {
        const renderer = new ChessRenderer("chess-canvas", new Board(), window.innerHeight / 1.5);
        renderer.drawBoard();
        renderer.drawPieces();
        renderer.render();
        const chess = new ChessController(new Game(), renderer);
        chess.startNewGame();
        return () => {
            // simulations.;
        }
    }, []);
    return (
        <div className={"ui-div"}>
            <h1>Шахматы</h1>
            <canvas id="chess-canvas"></canvas>
        </div>
    )
}