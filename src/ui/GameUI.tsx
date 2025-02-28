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

export type ItemType = Item | Actor | Skill | null;

let canvas: HTMLCanvasElement | null;


export const GameUI: React.FC = () => {

    const [gameState, setGameState] = useState<'mainMenu' | 'paused' | 'inGame'>('mainMenu');
    const [showInventory, setShowInventory] = useState(false);
    const [infoItem, setInfoItem] = useState<ItemType>(null);
    const [infoPosition, setInfoPosition] = useState<{ left: number; top: number } | null>(null);
    const [health, setHealth] = useState(player!.HP);
    const [maxHealth, setMaxHealth] = useState(player!.HT);
    const [targetHealth, setTargetHealth] = useState(player!.target ? player!.target.HP : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player!.target ? player!.target.HT : 100);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keyboardListeners = useKeyboard(canvasRef);

    // Инициализация canvas после монтирования компонента
    useEffect(() => {
        canvas = canvasRef.current;
        if (canvas) {
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;

        }
        document.getElementById('init')!.addEventListener('click', (event) => {
            (event.target as HTMLCanvasElement).remove();
            document.getElementById("root")!.style.display = "flex";
            canvas!.style.display = "block";
            // playMusic("main");
        });

        init();

        actions.inventory = () => {
            setShowInventory(!z);
        }

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


    useEffect(() => {
        const interval = setInterval(() => {
            setHealth(player!.HP);
            setMaxHealth(player!.HT);
            if (player!.target) {
                setTargetHealth(player!.target.HP);
                setTargetMaxHealth(player!.target.HT);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleShowInfo = useCallback((item: ItemType, rect: DOMRect) => {
        const infoWidth = 200; // можно рассчитать динамически
        const infoHeight = 100;
        setInfoPosition({
            left: rect.left - infoWidth,
            top: rect.top - infoHeight / 2,
        });
        setInfoItem(item);
    }, []);

    const handleHideInfo = useCallback(() => {
        setInfoItem(null);
        setInfoPosition(null);
    }, []);

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
                            <Panel onShowInfo={handleShowInfo} onHideInfo={handleHideInfo}/>
                            <Chat/>
                        </div>
                        {showInventory && (
                            <Inventory onShowInfo={handleShowInfo} onHideInfo={handleHideInfo}/>
                        )}
                        {infoItem && infoPosition && (
                            <InfoWindow
                                item={infoItem}
                                position={infoPosition}
                                onClose={handleHideInfo}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export const clickAt = (button: string): void => {
    document.getElementById(button)?.click();
};
