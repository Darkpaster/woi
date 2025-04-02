import {useEffect, useState, useRef, RefObject} from "react";
import {camera, player} from "../../core/main.ts";
import {scaledTileSize} from "../../utils/math.js";

export const bindings = {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    pause: "Escape",
    inventory: "b",
    fullscreen: "f11",
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
    pause: () => {

    },
    inventory: () => {

    },
    fullscreen: () => {

    },
    zoomIn: () => {
        if (camera!.zoom < 4) camera!.zoom += 1;

    },
    zoomOut: () => {
        if (camera!.zoom > 2) camera!.zoom -= 1;

    },
    tab: (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        player?.selectNearestTarget?.();
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
}

function clickOffsetX() {
    return player!.x - window.innerWidth / 2 + scaledTileSize();
}

function clickOffsetY() {
    return player!.y - window.innerHeight / 2 + scaledTileSize();
}

export function useKeyboard(canvasRef: RefObject<HTMLCanvasElement | null>) {
    const [keysPressed, setKeysPressed] = useState(new Set());
    // const canvasRef = useRef(canvas);

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
                    actions.pause();
                    break;
                case bindings.inventory:
                    actions.inventory();
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
            }
        };

        const handleClick = (event: { clientX: number; clientY: number; }) => {
            if (player) {
                // player.target =
                //     Mob.getMobsOnTile(event.clientX + clickOffsetX(), event.clientY + clickOffsetY())[0] ||
                //     null;
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
            canvasEl.addEventListener("contextmenu", handleContextMenu);
            document.addEventListener("click", preventFocus);
        }


        return () => {
            if (canvasEl) {
                canvasEl.removeEventListener("keydown", handleKeyDown);
                canvasEl.removeEventListener("keyup", handleKeyUp);
                canvasEl.removeEventListener("click", handleClick);
                canvasEl.removeEventListener("contextmenu", handleContextMenu);
                document.removeEventListener("click", preventFocus);
            }
        };

    }, []);

    return keysPressed;
}
