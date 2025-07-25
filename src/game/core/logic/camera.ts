import { settings } from "../config/settings.ts";
import { updateZoom } from "./update.ts";
import { graphics } from "../main.ts";
import { scaledTileSize } from "../../../utils/math/general.ts";

interface CameraOptions {
    x: number;
    y: number;
}

interface CameraMovement {
    x: number;
    y: number;
}

export class Camera {
    private _zoom: number;

    constructor({ x, y }: CameraOptions) {
        this.initializePosition(x, y);
        this._zoom = settings.defaultTileScale;
    }

    get zoom(): number {
        return this._zoom;
    }

    set zoom(value: number) {
        const isZoomingIn = value > this._zoom;
        updateZoom(isZoomingIn);
        this._zoom = value;
    }

    public update(movement: CameraMovement, playerX: number, playerY: number): void {
        const context = graphics?.ctx;
        if (!context) {
            console.warn("Graphics context not available for camera update");
            return;
        }

        context.translate(movement.x, movement.y);
    }

    private initializePosition(x: number, y: number): void {
        const context = graphics?.ctx;
        if (!context) {
            console.warn("Graphics context not available for camera initialization");
            return;
        }

        const centerX = window.innerWidth / 2 - scaledTileSize();
        const centerY = window.innerHeight / 2 - scaledTileSize();

        context.translate(-x + centerX, -y + centerY);
    }
}