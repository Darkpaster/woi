import { useEffect, useState, useRef } from "react";
import { canvas } from "../../core/graphics/graphics.js";
import { Mob } from "../../core/logic/actors/mobs/mob.js";
import { camera, player } from "../../core/logic/update.js";
import { clickAt } from "../components/components.ts";
import { scaledTileSize } from "../../utils/math.js";

const bindings = {
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
};

function clickOffsetX() {
	return player!.getX() - window.innerWidth / 2 + scaledTileSize();
}

function clickOffsetY() {
	return player!.getY() - window.innerHeight / 2 + scaledTileSize();
}

export function useKeyboard() {
	const [keysPressed, setKeysPressed] = useState(new Set());
	const canvasRef = useRef(canvas);

	useEffect(() => {
		const handleKeyDown = (event: { key: unknown; preventDefault: () => void; }) => {
			setKeysPressed((prevKeys) => new Set(prevKeys).add(event.key));

			switch (event.key) {
				case bindings.left:
					player?.moveLeft?.();
					break;
				case bindings.up:
					player?.moveUp?.();
					break;
				case bindings.right:
					player?.moveRight?.();
					break;
				case bindings.down:
					player?.moveDown?.();
					break;
				case bindings.zoomIn:
					if (camera!.zoom < 4) camera!.zoom += 1;
					break;
				case bindings.zoomOut:
					if (camera!.zoom > 2) camera!.zoom -= 1;
					break;
				case bindings.tab:
					event.preventDefault();
					player?.selectNearestTarget?.();
					break;
				case bindings.b1:
					clickAt("skill-0");
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
					clickAt("open-close-inventory");
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
