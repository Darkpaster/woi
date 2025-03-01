import React, {useState, useEffect, useCallback, useRef} from 'react';
import {pauseMusic, playMusic, resumeMusic} from '../core/audio/music.ts';
import {MainMenu} from "./layouts/MainMenu.tsx";
import {PauseMenu} from "./layouts/PauseMenu.tsx";
import {SelfWidget} from "./components/SelfWidget.tsx";
import {TargetWidget} from "./components/TargetWidget.tsx";
import {Panel} from "./components/Panel.tsx";
import {Chat} from "./components/Chat.tsx";
import {Inventory} from "./components/Inventory.tsx";
import {InfoWindow} from "./components/InfoWindow.tsx";
import {init, pauseLoop, player, startLoop} from "../core/main.ts";
import {Item} from "../core/logic/items/item.ts";
import {Actor} from "../core/logic/actors/actor.ts";
import {Skill} from "../core/logic/skills/skill.ts";
import {actions, useKeyboard} from "./input/input.ts";
import uiSlice, {toggleInventory, UIState} from "../utils/stateManagement/uiSlice.ts";
import {useMyDispatch, useMySelector} from "../utils/stateManagement/store.ts";
import {RootState} from "@reduxjs/toolkit/query";

export type ItemType<T extends Item | Actor | Skill> = T;

let canvas: HTMLCanvasElement | null;


export const GameUI: React.FC = () => {

    const [gameState, setGameState] = useState<'mainMenu' | 'paused' | 'inGame'>('mainMenu');
    // const [showInventory, setShowInventory] = useState(false);
    // const [infoEntity, setInfoEntity] = useState<ItemType<Item | Actor | Skill> | null>(null);
    // const [infoPosition, setInfoPosition] = useState<{ left: number; top: number } | null>(null);
    const [health, setHealth] = useState(player!.HP);
    const [maxHealth, setMaxHealth] = useState(player!.HT);
    const [targetHealth, setTargetHealth] = useState(player!.target ? player!.target.HP : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player!.target ? player!.target.HT : 100);


    const infoEntity = useMySelector((state: { ui: UIState}) => state.ui.infoEntity);
    const infoPosition = useMySelector((state: { ui: UIState}) => state.ui.infoPosition);
    const isInventoryOpen = useMySelector((state: { ui: UIState}) => state.ui.isInventoryOpen);

    const dispatch = useMyDispatch();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const infoWindowRef = useRef<HTMLDivElement | null>(null);
    const keyboardListeners = useKeyboard(canvasRef);

    // Инициализация canvas после монтирования компонента
    useEffect(() => {
        canvas = canvasRef.current;
        if (canvas) {
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
        }


        const initButton = document.getElementById('init');
        if (initButton) {
            initButton!.addEventListener('click', (event) => {
                (event.target as HTMLCanvasElement).remove();
                document.getElementById("root")!.style.display = "flex";
                canvas!.style.display = "block";
                // playMusic("main");
            });

            init();
        }

        actions.inventory = () => {
            dispatch(toggleInventory());
        }

        const interval = setInterval(() => {
            setHealth(player!.HP);
            setMaxHealth(player!.HT);
            if (player!.target) {
                setTargetHealth(player!.target.HP);
                setTargetMaxHealth(player!.target.HT);
            }
        }, 100);
        return () => clearInterval(interval);

        // Пример: динамический импорт модулей, не связанных с React,
        // который выполняется уже после того, как DOM загружен:
        // import('../core/logic/someModule').then(mod => {
        //     // Используйте модуль по необходимости
        //     mod.initialize();
        // });
    }, []);

    function hideCanvas(): void {
        canvas!.style.display = "none";
    }

    function showCanvas(): void {
        canvas!.style.display = "block";
        canvas!.setAttribute('tabindex', '0');
        canvas!.focus();
    }

    // const handleShowInfo = useCallback((item: ItemType<Item | Actor | Skill>, rect: DOMRect) => {
    //     setInfoPosition({
    //         left: rect.left,
    //         top: rect.top,
    //     });
    //     setInfoItem(item);
    // }, []);

    // const handleHideInfo = useCallback(() => {
    //     setInfoItem(null);
    //     setInfoPosition(null);
    // }, []);

    const handleNewGame = () => {
        setGameState('inGame');
        showCanvas();
        startLoop();
        playMusic('garden');
    };

    const handleResume = () => {
        setGameState('inGame');
        resumeMusic();
        // canvas.setAttribute('tabindex', '0');
        startLoop();
    };

    const handleMainMenu = () => {
        setGameState('mainMenu');
        hideCanvas();
        playMusic('main');
        pauseLoop();
    };

    return (
        <>
            <canvas id="canvas" ref={canvasRef}></canvas>
            <div id="welcome-div">
                <header id="title" style={{display: gameState === 'inGame' ? 'none' : 'block'}}>
                    The Aftermath Trail
                </header>
                {gameState === 'mainMenu' && (
                    <MainMenu onNewGame={handleNewGame}/>
                )}
                {gameState === 'paused' && (
                    <PauseMenu onResume={handleResume} onMainMenu={handleMainMenu}/>
                )}
                {gameState === 'inGame' && (
                    <div id="interface-layer">
                        <div id="static-interface">
                            <SelfWidget value={health} max={maxHealth}/>
                            {player!.target && (
                                <TargetWidget value={targetHealth} max={targetMaxHealth}/>
                            )}
                            <Panel />
                            <Chat/>
                        </div>
                        {isInventoryOpen && (
                            <Inventory />
                        )}
                        {
                            infoEntity && infoPosition && (<InfoWindow entity={infoEntity} position={infoPosition}/>)
                        }
                    </div>
                )}
            </div>
        </>
    );
};

export const clickAt = (button: string): void => {
    document.getElementById(button)?.click();
};
