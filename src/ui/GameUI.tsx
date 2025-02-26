import React, {useState, useEffect, useCallback} from 'react';
import {pauseMusic, playMusic, resumeMusic} from '../core/audio/music.ts';
import {hideCanvas, setBlur, showCanvas} from '../core/graphics/graphics.ts';
import {player} from '../core/logic/update.ts';
import {MainMenu} from "./layouts/MainMenu.tsx";
import {PauseMenu} from "./layouts/PauseMenu.tsx";
import {SelfWidget} from "./components/SelfWidget.tsx";
import {TargetWidget} from "./components/TargetWidget.tsx";
import {Panel} from "./components/Panel.tsx";
import {Chat} from "./components/Chat.tsx";
import {Inventory} from "./components/Inventory.tsx";
import {InfoWindow} from "./components/InfoWindow.tsx";
import {game, pauseLoop} from "../core/main.ts";
import {Item} from "../core/logic/items/item.ts";
import {Actor} from "../core/logic/actors/actor.ts";
import {Skill} from "../core/logic/skills/skill.ts";
// Предполагается, что game и pauseLoop доступны в вашем проекте

export type ItemType = Item | Actor | Skill | null;

// Основной компонент игрового интерфейса
export const GameUI: React.FC = () => {
    // Состояние игры: главное меню, игра на паузе или игровой процесс
    const [gameState, setGameState] = useState<'mainMenu' | 'paused' | 'inGame'>('mainMenu');
    // Состояния для дополнительных элементов интерфейса
    const [showInventory, setShowInventory] = useState(false);
    const [infoItem, setInfoItem] = useState<ItemType>(null);
    const [infoPosition, setInfoPosition] = useState<{ left: number; top: number } | null>(null);
    const [health, setHealth] = useState(player!.HP);
    const [maxHealth, setMaxHealth] = useState(player!.HT);
    const [targetHealth, setTargetHealth] = useState(player!.target ? player!.target.HP : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player!.target ? player!.target.HT : 100);

    // Периодически обновляем данные о здоровье
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

    // Колбэки для отображения/скрытия информационного окна
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

    // Обработчики нажатий в меню
    const handleNewGame = () => {
        setGameState('inGame');
        showCanvas();
        game();
        // Сброс скрытия интерфейса, воспроизведение музыки, запуск игрового цикла и т.п.
        playMusic('garden');
        // game();
    };

    const handleResume = () => {
        setGameState('inGame');
        resumeMusic();
        // canvas.setAttribute('tabindex', '0');
        game();
    };

    const handleMainMenu = () => {
        setGameState('mainMenu');
        hideCanvas();
        playMusic('main');
        pauseLoop();
    };

    return (
        <>
            <button id="init" style={{textAlign: "center", fontSize: "2000px", color: "black", backgroundColor: "black", border: "none"}}
            onClick={(event) => {
                (event.target as HTMLElement).remove();
                document.getElementById("root")!.style.display = "flex";
                canvas!.style.display = "block";
                playMusic("main");
            }}>click
            </button>
            <canvas id="canvas" onLoad={
                () => {
                    canvas!.height = window.innerHeight;
                    canvas!.width = window.innerWidth;
            }}></canvas>
            <div id="welcome-div">
                {/* Заголовок */}
                <header id="title" style={{display: gameState === 'inGame' ? 'none' : 'block'}}>
                    The Aftermath Trail
                </header>

                {/* Меню */}
                {gameState === 'mainMenu' && (
                    <MainMenu onNewGame={handleNewGame}/>
                )}
                {gameState === 'paused' && (
                    <PauseMenu onResume={handleResume} onMainMenu={handleMainMenu}/>
                )}

                {/* Игровой интерфейс */}
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

// Функция для эмуляции клика по элементу по id (для совместимости)
export const clickAt = (button: string): void => {
    document.getElementById(button)?.click();
};
