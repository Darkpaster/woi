import {SimulationObject} from "./simulationObject.ts";
import {InteractionManager} from "./interactionManager.ts";

export class SimulationEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private simulationObjects: SimulationObject[] = [];
    private isRunning: boolean = false;
    private lastTimestamp: number = 0;
    private interactions: InteractionManager;

    constructor(canvasId: string, size: number = 800) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas with id ${canvasId} not found.`);
        }

        this.canvas = canvas;
        this.canvas.width = size;
        this.canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context from canvas.');
        }

        this.ctx = ctx;
        this.interactions = new InteractionManager(this.canvas, this);
    }

    public addObject(object: SimulationObject): void {
        this.simulationObjects.push(object);
        object.setEngine(this);
    }

    public removeObject(object: SimulationObject): void {
        const index = this.simulationObjects.indexOf(object);
        if (index !== -1) {
            this.simulationObjects.splice(index, 1);
        }
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public getObjects(): SimulationObject[] {
        return [...this.simulationObjects];
    }

    public start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTimestamp = performance.now();
            requestAnimationFrame(this.animationFrame.bind(this));
        }
    }

    public stop(): void {
        this.isRunning = false;
    }

    public reset(): void {
        this.simulationObjects.forEach(obj => obj.reset());
    }

    private animationFrame(timestamp: number): void {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTimestamp) / 1000; // в секундах
        this.lastTimestamp = timestamp;

        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Обновление и отрисовка объектов
        this.simulationObjects.forEach(obj => {
            obj.update(deltaTime);
            obj.render(this.ctx);
        });

        requestAnimationFrame(this.animationFrame.bind(this));
    }
}
