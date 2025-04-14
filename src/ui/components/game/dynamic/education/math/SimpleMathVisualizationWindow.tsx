import {useEffect, useRef, useState} from "react";
import {Visualization} from "../../../../../../core/logic/education/math/visualization/visualization.ts";
import {Calculus} from "../../../../../../core/logic/education/math/calculus/calculus.ts";
import MathFunction = Calculus.MathFunction;
import MathCanvas = Visualization.MathCanvas;
import {MathExpressionGeneratorApp} from "../../../../../../core/logic/education/math/generator.ts";

let visualizer: MathCanvas;

export const SimpleMathVisualizationWindow = () => {
    const [expression, setExpression] = useState("");
    const [funcName, setFuncName] = useState("default");

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generator = new MathExpressionGeneratorApp("elementary", 1);

    const render = () => {
        if (!expression || !visualizer) return

        // visualizer.addObject(new MathFunction(expression, funcName));
    }

    const random = () => {
        const res = funcName.split(" ");
        generator.setGeneratorType(res[0], Number(res[1]));
        alert(generator.generateExpression());
        // visualizer.addObject(new MathFunction(generator.generateExpression()));
    }

    const clear = () => {
        if (!expression || !visualizer) return

        // visualizer.clearObjects();
    }

    useEffect(() => {
        // visualizer = new MathCanvas(canvasRef.current);
    }, []);

    return (
        <div className={"ui-div"}>
            <h1>Визуализация математики</h1>
            <canvas id="math-canvas" ref={canvasRef}></canvas>
            <div className="controls" style={{textAlign: "center"}}>
                <h3>имя функции::</h3>
                <input id={"func-name-input"} type={"text"} onChange={(ev) => setFuncName(ev.target.value)}
                       className={"ui-div"}/>
                <h3>функция:</h3>
                <input id={"func-input"} type={"text"} onChange={(ev) => setExpression(ev.target.value)}
                       className={"ui-div"}/>
                <button onClick={render} className={"ui-div"}>render</button>
                <button onClick={clear} className={"ui-div"}>clear</button>
                <button onClick={random} className={"ui-div"}>random</button>
            </div>
        </div>
    )
}