// components.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { pauseMusic, playMusic, resumeMusic } from '../../core/audio/music';
import { canvas, hideCanvas, setBlur, showCanvas } from '../../core/graphics/graphics';
import {getLogHistory, log, Message} from '../../core/logic/logs';
import { player } from '../../core/logic/update';
// Предполагается, что game и pauseLoop доступны в вашем проекте
// import { game, pauseLoop } from '../../main';
import { Button } from './button';
import { Win } from './window';

// Вспомогательная функция для определения цвета редкости
const getRarityColor = (rarity: string): string => {
    switch (rarity) {
        case 'common':
            return 'grey';
        case 'rare':
            return 'blue';
        default:
            return 'white';
    }
};

// Основной компонент игрового интерфейса
export const GameUI: React.FC = () => {
    // Состояние игры: главное меню, игра на паузе или игровой процесс
    const [gameState, setGameState] = useState<'mainMenu' | 'paused' | 'inGame'>('mainMenu');
    // Состояния для дополнительных элементов интерфейса
    const [showInventory, setShowInventory] = useState(false);
    const [infoItem, setInfoItem] = useState<never | null>(null);
    const [infoPosition, setInfoPosition] = useState<{ left: number; top: number } | null>(null);
    const [health, setHealth] = useState(player.getHP());
    const [maxHealth, setMaxHealth] = useState(player.getHT());
    const [targetHealth, setTargetHealth] = useState(player.target ? player.target.getHP() : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player.target ? player.target.getHT() : 100);

    // Периодически обновляем данные о здоровье
    useEffect(() => {
        const interval = setInterval(() => {
            setHealth(player.getHP());
            setMaxHealth(player.getHT());
            if (player.target) {
                setTargetHealth(player.target.getHP());
                setTargetMaxHealth(player.target.getHT());
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Колбэки для отображения/скрытия информационного окна
    const handleShowInfo = useCallback((item: never, rect: DOMRect) => {
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
        // Сброс скрытия интерфейса, воспроизведение музыки, запуск игрового цикла и т.п.
        playMusic('garden');
        // game();
    };

    const handleResume = () => {
        setGameState('inGame');
        resumeMusic();
        // canvas.setAttribute('tabindex', '0');
        // game();
    };

    const handleMainMenu = () => {
        setGameState('mainMenu');
        hideCanvas();
        playMusic('main');
        // pauseLoop();
    };

    return (
        <div id="game-ui">
            {/* Заголовок */}
            <header id="title" style={{ display: gameState === 'inGame' ? 'none' : 'block' }}>
                Game Title
            </header>

            {/* Меню */}
            {gameState === 'mainMenu' && (
                <div id="menu">
                    <MainMenu onNewGame={handleNewGame} />
                </div>
            )}
            {gameState === 'paused' && (
                <div id="menu">
                    <PauseMenu onResume={handleResume} onMainMenu={handleMainMenu} />
                </div>
            )}

            {/* Игровой интерфейс */}
            {gameState === 'inGame' && (
                <div id="root">
                    <div id="interface">
                        <HealthBar value={health} max={maxHealth} />
                        {player.target && (
                            <TargetHealthBar value={targetHealth} max={targetMaxHealth} />
                        )}
                        <Panel onShowInfo={handleShowInfo} onHideInfo={handleHideInfo} />
                        <Chat />
                    </div>
                    {showInventory && (
                        <Inventory onShowInfo={handleShowInfo} onHideInfo={handleHideInfo} />
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
    );
};

// Функция для эмуляции клика по элементу по id (для совместимости)
export const clickAt = (button: string): void => {
    document.getElementById(button)?.click();
};
