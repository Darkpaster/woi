export interface SimulationObject {
    id: string;
    update(deltaTime: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}

export interface Simulatable {
    tick(deltaTime: number): void;
}

export abstract class Simulation implements Simulatable {
    protected objects: SimulationObject[] = [];
    protected time: number = 0;
    protected running: boolean = false;
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas with id ${canvasId} not found`);
        }
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = context;
    }

    public addObject(object: SimulationObject): void {
        this.objects.push(object);
    }

    public removeObject(id: string): void {
        const index = this.objects.findIndex(obj => obj.id === id);
        if (index !== -1) {
            this.objects.splice(index, 1);
        }
    }

    public start(): void {
        this.running = true;
        this.loop(0);
    }

    public stop(): void {
        this.running = false;
    }

    public tick(deltaTime: number): void {
        this.time += deltaTime;
        this.objects.forEach(obj => obj.update(deltaTime));
        this.render();
    }

    private loop(timestamp: number): void {
        if (!this.running) return;

        const lastTime = this.time || timestamp;
        const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds

        this.tick(deltaTime);

        requestAnimationFrame(this.loop.bind(this));
    }

    protected render(): void {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render all objects
        this.objects.forEach(obj => obj.render(this.ctx));
    }

    public abstract initialize(): void;
}