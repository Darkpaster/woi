import {Vector2D} from "../math/2d.ts";

export class VisualState {
    private position: Vector2D;
    private color: string;
    private scale: number;
    private visible: boolean;

    constructor() {
        this.position = new Vector2D(0, 0);
        this.color = "#3498db";
        this.scale = 1.0;
        this.visible = true;
    }

    public getPosition(): Vector2D { return this.position; }
    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    public getColor(): string { return this.color; }
    public setColor(color: string): void { this.color = color; }

    public getScale(): number { return this.scale; }
    public setScale(scale: number): void { this.scale = scale; }

    public isVisible(): boolean { return this.visible; }
    public setVisible(visible: boolean): void { this.visible = visible; }
}