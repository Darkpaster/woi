import {useEffect} from "react";
import {SimulationEngine} from "../../../../../../core/logic/education/engineering/simulationEngine.ts";
import {Electrical} from "../../../../../../core/logic/education/engineering/electrical.ts";
import Lamp = Electrical.Lamp;
import CircuitSimulation = Electrical.CircuitSimulation;
import Motor = Electrical.Motor;
import {Thermodynamics} from "../../../../../../core/logic/education/engineering/thermodynamics.ts";
import HeatSource = Thermodynamics.HeatSource;
import HeatTransfer = Thermodynamics.HeatTransfer;
import {FluidsSimulationManager} from "../../../../../../core/logic/education/engineering/fluids.ts";

export const SimpleEngineeringSimulationWindow = () => {
    useEffect(() => {
        const simulation = new FluidsSimulationManager("engineering-canvas", 800, 800);
        try {
            // simulation.addObject(new Wheel(100, 100, 50))
            // simulation.addObject(new Spring(300, 300, 5, 100, 10))
            // simulation.addObject(new FluidFlow(400, 400, 300, 300, 1000, 200))
            // simulation.addObject(new CircularObstacle(400, 400, 50))
            // simulation.addObject(new RectangularObstacle(100, 300, 100, 200))
            // const circuit = new CircuitSimulation(400, 400);
            // circuit.addComponent(new Lamp(300, 300));
            // circuit.addComponent(new Motor(200, 200))
            // simulation.addObject()
            // const src = new HeatSource(300, 300, 1000);
            // const trans = new HeatTransfer(300, 300, 200, 50);
            // trans.addHeatSource(src);
            // simulation.addObject(trans)
            const stopButton = document.getElementById('stop-button');
            const startButton = document.getElementById('start-button');

            // if (stopButton) {
            //     stopButton.addEventListener('click', () => simulation.stop());
            // }
            // if (startButton) {
            //     startButton.addEventListener('click', () => simulation.start());
            // }
        } catch (error) {
            console.error('Ошибка инициализации симуляции:', error);
        }

        // return () => {
        //     simulation.stop();
        // }
    }, []);
    return (
        <div className={"ui-div"}>
            <h1>Симуляция инженерии</h1>
            <canvas id="engineering-canvas"></canvas>
            <div className="controls">
                {/*<button id="stop-button" className={"ui-div"}>остановить</button>*/}
                {/*<button id="start-button" className={"ui-div"}>запустить</button>*/}
            </div>
        </div>
    )
}