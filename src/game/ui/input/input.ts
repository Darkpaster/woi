// input.ts - CODE REVIEW COMMENTS

import {useEffect, useState, useRef, RefObject} from "react";
import {camera, entityManager, player} from "../../core/main.ts";
import {scaledTileSize} from "../../../utils/math/general.ts";
import Mob from "../../core/logic/actors/mobs/mob.ts";

// ISSUE 1: Объект конфигурации привязок клавиш можно типизировать
// ✅ Хорошо: Централизованная конфигурация клавиш
export const bindings = {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    pause: "Escape",
    inventory: "b",
    char: "c",
    talents: "t",
    spellBook: "i",
    quests: "g",
    professions: "p",
    achievements: "j",
    friends: "h",
    zoomIn: "=",
    zoomOut: "-",
    selectNearest: "Tab",
    shift: "Shift",
    enter: "Enter",
    b1: "1",
    b2: "2",
    b3: "3",
    b4: "4",
    b5: "5",
    b6: "6",
    b7: "7",
    b8: "8",
    b9: "9",
} as const;

// SUGGESTIONS FOR IMPROVEMENT:
// 1. Добавить типизацию для всех функций в actions
// 2. Создать enum для клавиш вместо строковых литералов
// 3. Добавить валидацию для игровых объектов
// 4. Использовать более описательные имена для переменных

// ISSUE 2: Объект actions мутируется извне (из GameUI)
// ❌ Проблема: Нарушение инкапсуляции, сложно отслеживать изменения
export const actions = {
    up: (down: boolean) => {
        player!.pressUp = down; // Небезопасное обращение к player
    },
    down: (down: boolean) => {
        player!.pressDown = down;
    },
    left: (down: boolean) => {
        player!.pressLeft = down;
    },
    right: (down: boolean) => {
        player!.pressRight = down;
    },

    // ISSUE 3: Пустые функции-заглушки
    // ❌ Проблема: Заглушки без реализации могут ввести в заблуждение
    settingsWindow: () => {
        // Пустая функция
    },
    inventoryWindow: () => {
        // Пустая функция - будет перезаписана в GameUI
    },
    characterWindow: () => {
        // Пустая функция
    },
    talentsWindow: () => {},
    achievementsWindow: () => {},
    friendsWindow: () => {},
    questsWindow: () => {},
    professionsWindow: () => {},
    spellBookWindow: () => {},

    zoomIn: () => {
        // ISSUE 4: Магические числа без констант
        if (camera!.zoom < 4) camera!.zoom += 1; // Небезопасное обращение к camera
    },
    zoomOut: () => {
        if (camera!.zoom > 1) camera!.zoom -= 1;
    },

    tab: (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        // ISSUE 5: Сложная логика выбора цели без проверок
        player?.selectNearestTarget(
            Array.from(entityManager.players.values()),
            Array.from(entityManager.mobs.values())
        );
    },

    shift: () => {
        // Пустая функция
    },
    enter: (event: { preventDefault: () => void; }) => {
        // Пустая функция
    },

    // ISSUE 6: Множество пустых функций для кнопок действий
    b1: () => {},
    b2: () => {},
    b3: () => {},
    b4: () => {},
    b5: () => {},
    b6: () => {},
    b7: () => {},
    b8: () => {},
    b9: () => {},
}

// ISSUE 7: Функции вне компонента без типизации
function clickOffsetX() {
    return player!.x - window.innerWidth / 2 + scaledTileSize();
}

function clickOffsetY() {
    return player!.y - window.innerHeight / 2 + scaledTileSize();
}

// ISSUE 8: Функция с неоптимальным алгоритмом поиска
function getMobsAtPosition(worldX: number, worldY: number): Mob[] {
    const mobs: Mob[] = [];
    const clickRadius = scaledTileSize();

    // ISSUE 9: Линейный поиск по всем мобам - O(n)
    // ❌ Проблема: Может быть медленно при большом количестве мобов
    for (const mob of entityManager.mobs.values()) {
        const distance = Math.sqrt(
            Math.pow(mob.x - worldX, 2) + Math.pow(mob.y - worldY, 2)
        );

        if (distance <= clickRadius) {
            mobs.push(mob);
        }
    }

    return mobs;
}

function screenToWorld(screenX: number, screenY: number): { x: number, y: number } {
    return {
        x: screenX + clickOffsetX(),
        y: screenY + clickOffsetY()
    };
}

// ISSUE 10: Очень большой и сложный хук с множественной ответственностью
export function useKeyboard(canvasRef: RefObject<HTMLCanvasElement | null>) {
    const [keysPressed, setKeysPressed] = useState(new Set());
    const [hoveredMob, setHoveredMob] = useState<Mob | null>(null);

    useEffect(() => {
        // ISSUE 11: Большие обработчики событий в useEffect
        const handleKeyDown = (event: { key: unknown; preventDefault: () => void; }) => {
            setKeysPressed((prevKeys) => new Set(prevKeys).add(event.key));

            // ISSUE 12: Большой switch без группировки логики
            switch (event.key) {
                case bindings.left:
                    actions.left(true);
                    break;
                case bindings.up:
                    actions.up(true);
                    break;
                case bindings.right:
                    actions.right(true);
                    break;
                case bindings.down:
                    actions.down(true);
                    break;
                case bindings.zoomIn:
                    actions.zoomIn();
                    break;
                case bindings.zoomOut:
                    actions.zoomOut();
                    break;
                case bindings.selectNearest:
                    actions.tab(event)
                    break;
                case bindings.shift:
                    actions.shift();
                    break;
                case bindings.b1:
                    actions.b1();
                    break;
                case bindings.b2:
                    actions.b2();
                    break;
                case bindings.b3:
                    actions.b3();
                    break;
                case bindings.b4:
                    actions.b4();
                    break;
                case bindings.b5:
                    actions.b5();
                    break;
            }
        };

        const handleKeyUp = (event: { key: unknown; preventDefault: () => void; }) => {
            setKeysPressed((prevKeys) => {
                const newKeys = new Set(prevKeys);
                newKeys.delete(event.key);
                return newKeys;
            });

            // ISSUE 13: Еще один большой switch
            switch (event.key) {
                case bindings.pause:
                    // ISSUE 14: Логика игры смешана с UI логикой
                    if (player?.target) {
                        player.target = null;
                        break
                    }
                    actions.settingsWindow();
                    break;
                case bindings.left:
                    actions.left(false);
                    break;
                case bindings.up:
                    actions.up(false);
                    break;
                case bindings.right:
                    actions.right(false);
                    break;
                case bindings.down:
                    actions.down(false);
                    break;
                case "e": // ISSUE 15: Хардкод клавиши не из bindings
                    if (player) player.AA = !player.AA;
                    break;
                case bindings.enter:
                    actions.enter(event);
                    break;
                case bindings.inventory:
                    actions.inventoryWindow();
                    break;
                case bindings.char:
                    actions.characterWindow();
                    break;
                case bindings.achievements:
                    actions.achievementsWindow();
                    break;
                case bindings.friends:
                    actions.friendsWindow();
                    break;
                case bindings.talents:
                    actions.talentsWindow();
                    break;
                case bindings.quests:
                    actions.questsWindow();
                    break;
                case bindings.spellBook:
                    actions.spellBookWindow();
                    break;
                case bindings.professions:
                    actions.professionsWindow();
                    break;
            }
        };

        // ISSUE 16: Сложная логика клика с дублированием кода
        const handleClick = (event: { clientX: number; clientY: number; }) => {
            if (player) {
                const worldPos = screenToWorld(event.clientX, event.clientY);
                const mobsAtClick = getMobsAtPosition(worldPos.x, worldPos.y);

                if (mobsAtClick.length > 0) {
                    // Дублирование логики поиска ближайшего моба
                    let closestMob = mobsAtClick[0];
                    let minDistance = Math.sqrt(
                        Math.pow(closestMob.x - worldPos.x, 2) +
                        Math.pow(closestMob.y - worldPos.y, 2)
                    );

                    for (const mob of mobsAtClick) {
                        const distance = Math.sqrt(
                            Math.pow(mob.x - worldPos.x, 2) +
                            Math.pow(mob.y - worldPos.y, 2)
                        );
                        if (distance < minDistance) {
                            closestMob = mob;
                            minDistance = distance;
                        }
                    }

                    player.target = closestMob;
                } else {
                    player.target = null;
                }
            }
        };

        // ISSUE 17: Дублирование логики с handleClick
        const handleMouseMove = (event: { clientX: number; clientY: number; }) => {
            if (player) {
                const worldPos = screenToWorld(event.clientX, event.clientY);
                const mobsAtHover = getMobsAtPosition(worldPos.x, worldPos.y);

                if (mobsAtHover.length > 0) {
                    // Та же логика поиска ближайшего моба
                    let closestMob = mobsAtHover[0];
                    let minDistance = Math.sqrt(
                        Math.pow(closestMob.x - worldPos.x, 2) +
                        Math.pow(closestMob.y - worldPos.y, 2)
                    );

                    for (const mob of mobsAtHover) {
                        const distance = Math.sqrt(
                            Math.pow(mob.x - worldPos.x, 2) +
                            Math.pow(mob.y - worldPos.y, 2)
                        );
                        if (distance < minDistance) {
                            closestMob = mob;
                            minDistance = distance;
                        }
                    }

                    setHoveredMob(closestMob);

                    // ISSUE 18: Прямое изменение DOM стилей
                    if (canvasRef.current) {
                        canvasRef.current.style.cursor = 'pointer';
                    }
                } else {
                    setHoveredMob(null);
                    if (canvasRef.current) {
                        canvasRef.current.style.cursor = 'default';
                    }
                }
            }
        };

        const handleContextMenu = (event: MouseEvent) => event.preventDefault();

        const canvasEl = canvasRef.current;

        // ISSUE 19: Функция с неясной логикой
        const preventFocus = (event: MouseEvent)=> {
            if (!(event.target instanceof HTMLInputElement)) {
                canvasEl.focus();
            }
        }

        // ISSUE 20: Множественные addEventListener без группировки
        if (canvasEl) {
            canvasEl.addEventListener("keydown", handleKeyDown);
            canvasEl.addEventListener("keyup", handleKeyUp);
            canvasEl.addEventListener("click", handleClick);
            canvasEl.addEventListener("mousemove", handleMouseMove);
            canvasEl.addEventListener("contextmenu", handleContextMenu);
            document.addEventListener("click", preventFocus);
        }

        // ISSUE 21: Cleanup с повторением логики
        return () => {
            if (canvasEl) {
                canvasEl.removeEventListener("keydown", handleKeyDown);
                canvasEl.removeEventListener("keyup", handleKeyUp);
                canvasEl.removeEventListener("click", handleClick);
                canvasEl.removeEventListener("mousemove", handleMouseMove);
                canvasEl.removeEventListener("contextmenu", handleContextMenu);
                document.removeEventListener("click", preventFocus);
            }
        };

    }, []); // ISSUE 22: Пустой массив зависимостей при использовании внешних переменных

    return {
        keysPressed,
        hoveredMob
    };
}

// РЕКОМЕНДАЦИИ ПО РЕФАКТОРИНГУ:
/*
1. Разделить хук на несколько меньших:
   - useKeyboardInput
   - useMouseInput  
   - useGameControls

2. Создать типы для всех объектов:
   type KeyBindings = typeof bindings;
   type ActionMap = Record<keyof KeyBindings, () => void>;

3. Вынести логику поиска ближайшего объекта в отдельную функцию:
   function findClosestEntity<T extends {x: number, y: number}>(
     entities: T[], 
     targetPos: {x: number, y: number}
   ): T | null

4. Использовать Map для обработчиков клавиш вместо switch:
   const keyHandlers = new Map([
     [bindings.left, () => actions.left(true)],
     [bindings.right, () => actions.right(true)],
     // ...
   ]);

5. Добавить константы для магических чисел:
   const ZOOM_MIN = 1;
   const ZOOM_MAX = 4;
   const ZOOM_STEP = 1;

6. Создать отдельный хук для управления курсором:
   function useCursor(condition: boolean, cursor: string)

7. Добавить debounce для mousemove событий

8. Использовать useCallback для обработчиков событий

9. Добавить валидацию для игровых объектов:
   if (!player || !camera || !entityManager) return;

10. Создать систему команд вместо прямой мутации actions:
    interface Command {
      execute(): void;
      undo?(): void;
    }
*/