import {useEffect} from "react";
import {PianoRoll} from "../../../../../../core/logic/education/music/visualization/pianoRoll.ts";

export const MusicSimulationWindow = () => {
    useEffect(() => {
        const piano = new PianoRoll("music-canvas");
        // const midi = new MIDIVisualizer("music-canvas");
        // const soundFontPlayer = new SoundFontPlayer();
        // const metronome = new Metronome("music-canvas")
        // const scoreEditor = new ScoreEditor("music-canvas")
        try {
            piano.render();
            // midi.render()
            // soundFontPlayer.playNote({pitch: "C4", duration: 1024, startTime: 100, velocity: 55});

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
            <h1>Симуляция музыки</h1>
            <canvas id="music-canvas"></canvas>
            <div className="controls">
                <button id="stop-button" className={"ui-div"}>остановить</button>
                <button id="start-button" className={"ui-div"}>запустить</button>
            </div>
        </div>
    )
}