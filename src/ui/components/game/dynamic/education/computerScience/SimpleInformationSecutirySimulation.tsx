import {useEffect, useState} from "react";
import {
    InformationSecuritySystem
} from "../../../../../../core/logic/education/computerScience/simulation/informationSecuritySystem.ts";
import {SecurityLog} from "../../../../../../core/logic/education/computerScience/informationSecurity/securityLog.ts";

export const SimpleInformationSecutirySimulation = () => {
    const simulation = new InformationSecuritySystem("1", "Security", "Симуляция взлома системы");
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    useEffect(() => {
        try {
            simulation.render();
            simulation.simulate(3);
            simulation.render();
            setLogs(simulation.getLogs())

            // const stopButton = document.getElementById('stop-button');
            // const startButton = document.getElementById('start-button');

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
            <h1>Симуляция взлома жопы</h1>
            {logs.length > 0 && logs.map((log, i) => (
                <p key={log+""+i}>{`[${log.getType()}] [${log.getUser()}]: ${log.getMessage()}`}</p>
            ))}
            {/*<canvas id="security-canvas"></canvas>*/}
            <div className="controls">
                {/*<button id="stop-button" className={"ui-div"}>остановить</button>*/}
                {/*<button id="start-button" className={"ui-div"}>запустить</button>*/}
            </div>
        </div>
    )
}