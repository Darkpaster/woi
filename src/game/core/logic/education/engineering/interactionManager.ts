import {Vector2D} from "../../../../../utils/math/2d.ts";
import {SimulationEngine} from "./simulationEngine.ts";
import {SimulationObject} from "./simulationObject.ts";

export class InteractionManager {
    private canvas: HTMLCanvasElement;
    private engine: SimulationEngine;
    private draggingObject: SimulationObject | null = null;
    private dragOffset: Vector2D = new Vector2D(0, 0);

    constructor(canvas: HTMLCanvasElement, engine: SimulationEngine) {
        this.canvas = canvas;
        this.engine = engine;

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    private getCanvasCoordinates(clientX: number, clientY: number): Vector2D {
        const rect = this.canvas.getBoundingClientRect();

        return new Vector2D(clientX - rect.left, clientY - rect.top);
    }

    private handleMouseDown(event: MouseEvent): void {
        const { x, y } = this.getCanvasCoordinates(event.clientX, event.clientY);
        this.startDragging(x, y);
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.draggingObject) {
            const { x, y } = this.getCanvasCoordinates(event.clientX, event.clientY);
            this.draggingObject.setPosition(
                x - this.dragOffset.x,
                y - this.dragOffset.y
            );
        }
    }

    private handleMouseUp(): void {
        this.draggingObject = null;
    }

    private handleTouchStart(event: TouchEvent): void {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
            this.startDragging(x, y);
            event.preventDefault();
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        if (event.touches.length === 1 && this.draggingObject) {
            const touch = event.touches[0];
            const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
            this.draggingObject.setPosition(
                x - this.dragOffset.x,
                y - this.dragOffset.y
            );
            event.preventDefault();
        }
    }

    private handleTouchEnd(): void {
        this.draggingObject = null;
    }

    private startDragging(x: number, y: number): void {
        const objects = this.engine.getObjects();

        // Перебираем объекты в обратном порядке (верхние слои сначала)
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj.isPointInside(x, y)) {
                this.draggingObject = obj;
                const pos = obj.getPosition();
                
                this.dragOffset = new Vector2D(x - pos.x,y - pos.y);
                break;
            }
        }
    }
}
