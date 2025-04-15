import {useEffect, useRef, useState} from "react";
import {Visualization} from "../../../../../../core/logic/education/math/visualization/visualization.ts";
import MathCanvas = Visualization.MathCanvas;
import katex from "katex";
import {MathExpressionGeneratorApp} from "../../../../../../core/logic/education/math/generator.ts";
import {f} from "../../../../../../core/logic/education/math/parser.ts";
import {KaTexToPlainTextParser} from "../../../../../../core/logic/education/math/katexParser.ts";

let visualizer: MathCanvas;

export const SimpleMathVisualizationWindow = () => {
    const [expression, setExpression] = useState("");
    const [funcName, setFuncName] = useState("default");

    const katexParser = new KaTexToPlainTextParser();


    const [statement, setStatement] = useState<string>("")

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const difficulty = ["", "elementary", "middle-school", "high-school", "undergraduate", "graduate"]

    const topic = ["", 'mechanics', 'electromagnetism', 'thermodynamics', 'optics', 'modern-physics', 'waves', 'astrophysics', 'relativistic-physics', 'solid-state-physics', 'particle-physics', 'quantum-mechanics']


    // Example usage
    // const generator = new MathExpressionGeneratorApp();

// Generate a random balanced equation at high school level
//     console.log(generator.generateEquation('high-school', true));
// Example output: \ce{C_6H_{12}O_6 + 6O_2 -> 6CO_2 + 6H_2O}

// Generate multiple equations of varying difficulties
//     const multipleEquations = generator.generateMultipleEquations(3, true);
//     console.log(multipleEquations);
// Example output: ['\ce{2H_2 + O_2 -> 2H_2O}', '\ce{Zn + 2HCl -> ZnCl_2 + H_2}', '\ce{2KMnO_4 + 5H_2C_2O_4 + 3H_2SO_4 -> K_2SO_4 + 2MnSO_4 + 10CO_2 + 8H_2O}']

// Generate an equation on a specific topic
//     console.log(generator.generateEquationByTopic('redox', true));
// Example output: \ce{2KMnO_4 + 16HCl -> 2KCl + 2MnCl_2 + 8H_2O + 5Cl_2}

    const render = () => {
        if (!expression || !visualizer) return

        // visualizer.addObject(new MathFunction(expression, funcName));
    }

    const random = async () => {
        const res = funcName.split(" ").map(str => +str);
        const generator = new MathExpressionGeneratorApp(difficulty[res[0]], res[1]);
        const katexExpression = generator.generateExpression();
        const expression = katexParser.parse(katexExpression);
        console.log(`${katexExpression} -> ${expression}`);
        const result = f(expression, {});
        // alert(notProcessed);
        // setStatement("");
        const notProcessed = `${katexExpression} = ${result} `;
        const processed = katex.renderToString(notProcessed, {output: 'mathml'});
        setStatement(processed);

        // alert(mhchemParser.toTex("\\ce{2Al + 3CuSO_4 -> Al_2(SO_4)_3 + 3Cu}", "pu"))

        // const str = generator.generateEquation('high-school', true);

        // setStatement(katex.renderToString(mhchemParser.toTex(str, "tex")));
        // setStatement(katex.renderToString("\\text{"+generator.generateProblem(topic[res[0]], res[0] > 6 ? "graduate" : difficulty[res[1]]).statement+"}"));
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
        // <React.Fragment>
        <div className={"ui-div"}>
            <h1>Визуализация математики</h1>
            <canvas id="math-canvas" ref={canvasRef}></canvas>
            <div className="controls" style={{textAlign: "center"}}>
                {statement.length > 0 &&
                    <div dangerouslySetInnerHTML={{__html: statement}}/>}
                <button onClick={random} className={"ui-div"}>generate</button>
                {/*<h3>имя функции:</h3>*/}
                <input id={"func-name-input"} type={"text"} onChange={(ev) => setFuncName(ev.target.value)}
                       className={"ui-div"}/>
                {/*<h3>функция:</h3>*/}
                {/*<input id={"func-input"} type={"text"} onChange={(ev) => setExpression(ev.target.value)}*/}
                {/*       className={"ui-div"}/>*/}
                {/*<button onClick={render} className={"ui-div"}>render</button>*/}
                {/*<button onClick={clear} className={"ui-div"}>clear</button>*/}
            </div>
        </div>
        // </React.Fragment>
    )
}