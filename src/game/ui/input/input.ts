import {useEffect, useState, useRef, RefObject} from "react";
import {camera, entityManager, player} from "../../core/main.ts";
import {scaledTileSize} from "../../../utils/math/general.ts";
import Mob from "../../core/logic/actors/mobs/mob.ts";

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
};

export const actions = {
    up: (down: boolean) => {
        player!.pressUp = down;
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
    settingsWindow: () => {

    },
    inventoryWindow: () => {

    },
    characterWindow: () => {

    },
    talentsWindow: () => {

    },
    achievementsWindow: () => {

    },
    friendsWindow: () => {

    },
    questsWindow: () => {

    },
    professionsWindow: () => {

    },
    spellBookWindow: () => {

    },
    zoomIn: () => {
        if (camera!.zoom < 4) camera!.zoom += 1;
    },
    zoomOut: () => {
        if (camera!.zoom > 1) camera!.zoom -= 1;
    },
    tab: (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        player?.selectNearestTarget(Array.from(entityManager.players.values()), Array.from(entityManager.mobs.values()));
    },
    shift: () => {

    },
    enter: (event: { preventDefault: () => void; }) => {

    },
    b1: () => {

    },
    b2: () => {

    },
    b3: () => {

    },
    b4: () => {

    },
    b5: () => {

    },
    b6: () => {

    },
    b7: () => {

    },
    b8: () => {

    },
    b9: () => {

    },
}

function clickOffsetX() {
    return player!.x - window.innerWidth / 2 + scaledTileSize();
}

function clickOffsetY() {
    return player!.y - window.innerHeight / 2 + scaledTileSize();
}

// Функция для получения мобов в указанной позиции
function getMobsAtPosition(worldX: number, worldY: number): Mob[] {
    const mobs: Mob[] = [];
    const clickRadius = scaledTileSize(); // Радиус клика

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

// Функция для конвертации экранных координат в мировые
function screenToWorld(screenX: number, screenY: number): { x: number, y: number } {
    return {
        x: screenX + clickOffsetX(),
        y: screenY + clickOffsetY()
    };
}

export function useKeyboard(canvasRef: RefObject<HTMLCanvasElement | null>) {
    const [keysPressed, setKeysPressed] = useState(new Set());
    const [hoveredMob, setHoveredMob] = useState<Mob | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: { key: unknown; preventDefault: () => void; }) => {
            setKeysPressed((prevKeys) => new Set(prevKeys).add(event.key));

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

            switch (event.key) {
                case bindings.pause:
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
                case "e":
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

        const handleClick = (event: { clientX: number; clientY: number; }) => {
            if (player) {
                const worldPos = screenToWorld(event.clientX, event.clientY);
                const mobsAtClick = getMobsAtPosition(worldPos.x, worldPos.y);

                if (mobsAtClick.length > 0) {
                    // Если кликнули на моба, выбираем ближайшего к центру клика
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
                    // Если кликнули не на моба, снимаем таргет
                    player.target = null;
                }
            }
        };

        const handleMouseMove = (event: { clientX: number; clientY: number; }) => {
            if (player) {
                const worldPos = screenToWorld(event.clientX, event.clientY);
                const mobsAtHover = getMobsAtPosition(worldPos.x, worldPos.y);

                if (mobsAtHover.length > 0) {
                    // Находим ближайшего моба для hover эффекта
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

                    // Меняем курсор на pointer при наведении на моба
                    if (canvasRef.current) {
                        canvasRef.current.style.cursor = 'pointer';
                    }
                } else {
                    setHoveredMob(null);

                    // Возвращаем обычный курсор
                    if (canvasRef.current) {
                        canvasRef.current.style.cursor = 'default';
                    }
                }
            }
        };

        const handleContextMenu = (event: MouseEvent) => event.preventDefault();

        const canvasEl = canvasRef.current;

        const preventFocus = (event: MouseEvent)=> {
            if (!(event.target instanceof HTMLInputElement)) {
                canvasEl.focus();
            }
        }

        if (canvasEl) {
            canvasEl.addEventListener("keydown", handleKeyDown);
            canvasEl.addEventListener("keyup", handleKeyUp);
            canvasEl.addEventListener("click", handleClick);
            canvasEl.addEventListener("mousemove", handleMouseMove);
            canvasEl.addEventListener("contextmenu", handleContextMenu);
            document.addEventListener("click", preventFocus);
        }

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

    }, []);

    // Возвращаем как состояние клавиш, так и информацию о hover
    return {
        keysPressed,
        hoveredMob
    };
}