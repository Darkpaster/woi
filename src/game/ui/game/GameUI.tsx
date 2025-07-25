// GameUI.tsx - CODE REVIEW COMMENTS

import React, {useState, useEffect, useRef} from 'react';
import {pauseMusic, playMusic, resumeMusic} from '../../core/audio/music.ts';
import {MainMenu} from "../features/menu/ui/MainMenu.tsx";
import {gameRTC, init, pauseLoop, player, startLoop} from "../../core/main.ts";
import {actions, useKeyboard} from "../input/input.ts";
import uiSlice, {
    toggleAchievements,
    toggleCharMenu,
    toggleFriends,
    toggleInventory,
    toggleProfessions, toggleQuests, toggleSpellBook,
    toggleTalents
} from "../../../utils/stateManagement/uiSlice.ts";
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

// ISSUE 1: Global variable - anti-pattern in React
// ❌ Проблема: Глобальная переменная может вызвать проблемы при множественном рендеринге
let canvas: HTMLCanvasElement | null;

// ISSUE 2: Сложная логика для обхода Strict Mode
// ❌ Проблема: Хакерское решение, лучше правильно обработать Strict Mode
export function isMounted() {
    let mounted = false;
    return () => {
        const now = mounted;
        mounted = true;
        return now;
    }
}

const check = isMounted();

// SUGGESTIONS FOR IMPROVEMENT:
// 1. Убрать глобальную переменную canvas
// 2. Использовать useCallback для обработчиков
// 3. Вынести логику инициализации в отдельный хук
// 4. Добавить типизацию для всех props
// 5. Убрать хак с isMounted и правильно обработать Strict Mode

export const GameUI: React.FC = () => {
    // ISSUE 3: Инициализация состояния через document.cookie - side effect
    // ❌ Проблема: Side effect в инициализации состояния
    const [gameState, setGameState] = useState<'auth' | 'mainMenu' | 'inGame'>(
        document.cookie.includes("session_active") ? 'mainMenu' : 'auth'
    );
    const [onPause, setOnPause] = useState(false);

    const dispatch = useMyDispatch();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keyboardListeners = useKeyboard(canvasRef);

    // ISSUE 4: Очень сложный useEffect с множественной ответственностью
    useEffect(() => {
        // Хак для обхода Strict Mode
        if (!check()) {
            canvas = canvasRef.current;
            if (canvas) {
                // ISSUE 5: Прямое изменение DOM вместо CSS
                canvas.height = window.innerHeight;
                canvas.width = window.innerWidth;
            }

            // ISSUE 6: Прямая работа с DOM через getElementById
            const initButton = document.getElementById('init');
            if (initButton) {
                initButton!.addEventListener('click', (event) => {
                    (event.target as HTMLCanvasElement).remove();
                    document.getElementById("root")!.style.display = "flex";
                    canvas!.style.display = "block";
                });
            }

            if (gameState !== 'auth') {
                initButton?.click();
            }

            // ISSUE 7: Мутация глобального объекта actions
            // ❌ Проблема: Изменение внешнего объекта из компонента
            actions.inventoryWindow = () => {
                dispatch(toggleInventory());
            }
            actions.characterWindow = () => {
                dispatch(toggleCharMenu());
            }
            actions.settingsWindow = () => {
                setOnPause(prev => !prev);
            }
            actions.talentsWindow = () => {
                dispatch(toggleTalents());
            }
            actions.achievementsWindow = () => {
                dispatch(toggleAchievements());
            }
            actions.friendsWindow = () => {
                dispatch(toggleFriends());
            }
            actions.professionsWindow = () => {
                dispatch(toggleProfessions());
            }
            actions.spellBookWindow = () => {
                dispatch(toggleSpellBook());
            }
            actions.questsWindow = () => {
                dispatch(toggleQuests());
            }
        }
    }, []); // ISSUE 8: Пустой массив зависимостей, но используются внешние переменные

    // ISSUE 9: Функции напрямую изменяют DOM
    function hideCanvas(): void {
        canvas!.style.display = "none";
    }

    function showCanvas(): void {
        canvas!.style.display = "block";
        canvas!.setAttribute('tabindex', '0');
        canvas!.focus();
    }

    // ISSUE 10: Отсутствует обработка ошибок
    const handleNewGame = () => {
        setGameState('inGame');
        showCanvas();
        startLoop();
    };

    const handleResume = () => {
        setGameState('inGame');
        resumeMusic();
        startLoop();
    };

    const handleMainMenu = () => {
        gameRTC.close(); // Может выбросить ошибку
        setGameState('mainMenu');
        hideCanvas();
        pauseLoop();
    };

    // ISSUE 11: Инлайн стили вместо CSS классов
    return (
        <>
            <header id="title" style={{display: gameState === 'inGame' ? 'none' : 'block'}}>
                The Aftermath Trail
            </header>
            <canvas id="canvas" ref={canvasRef}></canvas>

            <div id="welcome-div">
                <span
                    id="version"
                    style={{
                        display: gameState === 'inGame' ? 'none' : 'block',
                        bottom: 0,
                        right: 0,
                        position: "absolute"
                    }}
                >
                    v1.0.0
                </span>
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
    );
};

// РЕКОМЕНДАЦИИ ПО РЕФАКТОРИНГУ:
/*
1. Создать отдельный хук useCanvas для работы с canvas
2. Использовать Redux для управления состоянием canvas
3. Убрать прямую работу с DOM
4. Добавить обработку ошибок
5. Вынести стили в CSS модули
6. Использовать useCallback для обработчиков событий
7. Добавить loading состояния
8. Правильно обработать cleanup в useEffect
*/