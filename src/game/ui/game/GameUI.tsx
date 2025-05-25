import React, {useState, useEffect, useRef} from 'react';
import {pauseMusic, playMusic, resumeMusic} from '../../core/audio/music.ts';
import {MainMenu} from "../features/menu/ui/MainMenu.tsx";
import {gameRTC, init, pauseLoop, player, startLoop} from "../../core/main.ts";
import {actions, useKeyboard} from "../input/input.ts";
import uiSlice, {toggleCharMenu, toggleInventory} from "../../../utils/stateManagement/uiSlice.ts";
import {useMyDispatch, useMySelector} from "../../../utils/stateManagement/store.ts";
import Auth from "../features/auth/ui/Auth.tsx";
import {InGame} from "./InGame.tsx";

import "./globalStyles.scss"

import "../shared/styles/button.scss"
import "../shared/styles/progressBar.scss"
import "../shared/styles/tab.scss"
import "../shared/styles/loadingSpinner.scss"
import "../shared/styles/modalOverlay.scss"
import "../shared/styles/error.scss"
import "../shared/styles/tooltip.scss"

let canvas: HTMLCanvasElement | null;


export function isMounted() {
    let mounted = false;

    return () => {
        const now = mounted;
        mounted = true;
        return now;
    }
}

const check = isMounted();


export const GameUI: React.FC = () => {
    const [gameState, setGameState] = useState<'auth' | 'mainMenu' | 'inGame'>(document.cookie.includes("session_active") ? 'mainMenu' : 'auth');
    const [onPause, setOnPause] = useState(false);

    const [particle, setParticle] = useState(false);

    const dispatch = useMyDispatch();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keyboardListeners = useKeyboard(canvasRef);

    // Инициализация canvas после монтирования компонента
    useEffect(() => {

        if (!check()) { //обход strictMode
            canvas = canvasRef.current;
            if (canvas) {
                canvas.height = window.innerHeight;
                canvas.width = window.innerWidth;
                // dispatch(setCanvasRef(HTMLCanvasElement));
            }

            const initButton = document.getElementById('init');
            if (initButton) {
                initButton!.addEventListener('click', (event) => {
                    (event.target as HTMLCanvasElement).remove();
                    document.getElementById("root")!.style.display = "flex";
                    canvas!.style.display = "block";
                    // playMusic("main");
                });
            }
            if (gameState !== 'auth') {
                initButton?.click();
            }

            actions.inventory = () => {
                dispatch(toggleInventory());
            }

            actions.charWindow = () => {
                dispatch(toggleCharMenu());
            }

            actions.pause = () => {
                setOnPause(prev => !prev);
            }

            actions.particles = () => {
                setParticle(prev => !prev);
            }

        }


    }, []);

    function hideCanvas(): void {
        canvas!.style.display = "none";
    }

    function showCanvas(): void {
        canvas!.style.display = "block";
        canvas!.setAttribute('tabindex', '0');
        canvas!.focus();
    }

    const handleNewGame = () => {
        setGameState('inGame');
        showCanvas();
        startLoop();
        // playMusic('garden');
    };

    const handleResume = () => {
        setGameState('inGame');
        resumeMusic();
        // canvas.setAttribute('tabindex', '0');
        startLoop();
    };

    const handleMainMenu = () => {
        gameRTC.close();
        setGameState('mainMenu');
        hideCanvas();
        // playMusic('main');
        pauseLoop();
    };

    const anotherModule = () => {
        return (
            <>
                <header id="title" style={{display: gameState === 'inGame' ? 'none' : 'block'}}>
                    The Aftermath Trail
                </header>
                <canvas id="canvas" ref={canvasRef}></canvas>

                <div id="welcome-div">
                    <span id="version" style={{display: gameState === 'inGame' ? 'none' : 'block', bottom: 0, right: 0, position: "absolute"}}>v1.0.0</span>
                    {gameState === 'auth' && (
                        <Auth onLogin={() => setGameState("mainMenu")} />
                    )}
                    {(gameState === 'mainMenu' || onPause) && (
                        <MainMenu
                            onStartGame={handleNewGame}
                            onMainMenu={onPause ? handleMainMenu : undefined}
                            onResume={() => setOnPause(false)}
                        />
                    )}
                    {gameState === 'inGame' && <InGame />}
                </div>
            </>
        )
    }

    return (
        anotherModule()
    );
};