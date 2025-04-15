import {SimulationEngine} from "./simulationEngine.ts";
import {Vector2D} from "../../../../utils/math/2d.ts";

export abstract class SimulationObject {
    protected position: Vector2D = new Vector2D(0, 0);
    protected engine: SimulationEngine | null = null;
    protected initialState: any = {};

    constructor(x: number = 0, y: number = 0) {
        this.position = new Vector2D(x, y);
        this.saveInitialState();
    }

    public setEngine(engine: SimulationEngine): void {
        this.engine = engine;
    }

    public getPosition(): Vector2D {
        return this.position;
    }

    public setPosition(x: number, y: number): void {
        this.position = new Vector2D(x, y);
    }

    protected saveInitialState(): void {
        this.initialState = {
            position: { ...this.position }
        };
    }

    public reset(): void {
        this.position = { ...this.initialState.position };
    }

    public isPointInside(x: number, y: number): boolean {
        return false; // Переопределяется в конкретных классах
    }

    public abstract update(deltaTime: number): void;
    public abstract render(ctx: CanvasRenderingContext2D): void;
}
