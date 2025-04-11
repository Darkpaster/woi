import { settings } from "../config/settings.ts";
import { updateZoom } from "./update.ts";
// import { getCurrentLocation } from "./world/mapManager.ts";
import { scaledTileSize } from "../../utils/general/math.ts";
import {graphics} from "../main.ts";

interface CameraConstructor {
    x: number;
    y: number;
}

export class Camera {
    private _zoom: number;

    constructor({ x, y }: CameraConstructor) {
        graphics!.ctx!.translate(-x + window.innerWidth / 2 - scaledTileSize(), -y + window.innerHeight / 2 - scaledTileSize());
        this._zoom = settings.defaultTileScale;
    }

    public get zoom(): number {
        return this._zoom;
    }

    public set zoom(value: number) {
        updateZoom(value > this._zoom);
        this._zoom = value;
    }

    public update(diff: { x: number; y: number }, x: number, y: number): void {
        graphics!.ctx!.translate(diff.x, diff.y);
        // if (getCurrentLocation().floor.length * scaledTileSize() < y || y < 0) {
        //     graphics!.ctx!.translate(0, -diff.y);
        // }
        // if (getCurrentLocation().floor[0].length * scaledTileSize() < x || x < 0) {
        //     graphics!.ctx!.translate(-diff.x, 0);
        // }
    }
}