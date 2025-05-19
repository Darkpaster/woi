import {Point} from "../../../../../../utils/math/2d.ts";
import {SimulationObject} from "./simulation.ts";

export enum EntityType {
    MOLECULE,
    CELL,
    ORGANISM,
    POPULATION,
    ECOSYSTEM
}


export abstract class BiologicalEntity implements SimulationObject {
    public id: string;
    protected position: Point;
    protected velocity: Point;
    protected type: EntityType;
    protected size: number;
    protected color: string;

    constructor(id: string, position: Point, type: EntityType, size: number = 5, color: string = '#000000') {
        this.id = id;
        this.position = position;
        this.velocity = new Point(0, 0);
        this.type = type;
        this.size = size;
        this.color = color;
    }

    public getPosition(): Point {
        return this.position;
    }

    public setPosition(position: Point): void {
        this.position = position;
    }

    public getVelocity(): Point {
        return this.velocity;
    }

    public setVelocity(velocity: Point): void {
        this.velocity = velocity;
    }

    public getType(): EntityType {
        return this.type;
    }

    public getSize(): number {
        return this.size;
    }

    public abstract update(deltaTime: number): void;

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export interface Observer<T> {
    update(subject: T): void;
}

export interface Subject<T> {
    attach(observer: Observer<T>): void;
    detach(observer: Observer<T>): void;
    notify(): void;
}