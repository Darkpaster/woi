import {useEffect, useState, useRef, RefObject} from "react";
import {Mob} from "../../core/logic/actors/mobs/mob.js";
import {camera, player} from "../../core/main.ts";
import {scaledTileSize} from "../../utils/math.js";
import {clickAt} from "../GameUI.tsx";

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
    tab: "Tab",
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
    enter: () => {

    },
    b1: () => {

    },
    b2: () => {

    },
    b3: () => {

    },
    b4: () => {

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
                case bindings.tab:
                    actions.tab(event)
                    break;
                case bindings.b1:
                    actions.b1();
                    break;
            }
        };

        const handleKeyUp = (event: { key: unknown; }) => {
            setKeysPressed((prevKeys) => {
                const newKeys = new Set(prevKeys);
                newKeys.delete(event.key);
                return newKeys;
            });

            switch (event.key) {
                case bindings.pause:
                    clickAt("resume");
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
            }
        };

        const handleClick = (event: { clientX: number; clientY: number; }) => {
            if (player) {
                player.target =
                    Mob.getMobsOnTile(event.clientX + clickOffsetX(), event.clientY + clickOffsetY())[0] ||
                    null;
            }
        };

        const handleContextMenu = (event: MouseEvent) => event.preventDefault();

        const canvasEl = canvasRef.current;
        if (canvasEl) {
            canvasEl.addEventListener("keydown", handleKeyDown);
            canvasEl.addEventListener("keyup", handleKeyUp);
            canvasEl.addEventListener("click", handleClick);
            canvasEl.addEventListener("contextmenu", handleContextMenu);
        }


        return () => {
            if (canvasEl) {
                canvasEl.removeEventListener("keydown", handleKeyDown);
                canvasEl.removeEventListener("keyup", handleKeyUp);
                canvasEl.removeEventListener("click", handleClick);
                canvasEl.removeEventListener("contextmenu", handleContextMenu);
            }
        };

    }, []);

    return keysPressed;
}
