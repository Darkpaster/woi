import {Position, Velocity} from "./types.ts";

export abstract class Entity {
    protected id: string;
    protected position: Position;
    protected velocity: Velocity;
    protected visible: boolean;

    constructor(id: string, position: Position = { x: 0, y: 0 }, visible: boolean = true) {
        this.id = id;
        this.position = position;
        this.velocity = { vx: 0, vy: 0 };
        this.visible = visible;
    }

    public getId(): string {
        return this.id;
    }

    public getPosition(): Position {
        return { ...this.position };
    }

    public setPosition(position: Position): void {
        this.position = { ...position };
    }

    public getVelocity(): Velocity {
        return { ...this.velocity };
    }

    public setVelocity(velocity: Velocity): void {
        this.velocity = { ...velocity };
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public setVisible(visible: boolean): void {
        this.visible = visible;
    }

    public update(deltaTime: number): void {
        this.position.x += this.velocity.vx * deltaTime;
        this.position.y += this.velocity.vy * deltaTime;
    }

    public abstract render(ctx: CanvasRenderingContext2D): void;
}
