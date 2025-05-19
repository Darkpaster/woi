export abstract class Organism {
    protected x: number;
    protected y: number;
    protected energy: number;
    protected size: number;
    protected speed: number;
    protected color: string;
    protected lifespan: number;
    protected age: number = 0;

    constructor(x: number, y: number, energy: number, size: number, speed: number, color: string, lifespan: number) {
        this.x = x;
        this.y = y;
        this.energy = energy;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.lifespan = lifespan;
    }

    public abstract update(dt: number, organisms: Organism[]): void;
    public abstract reproduce(): Organism | null;

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    public getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    public getEnergy(): number {
        return this.energy;
    }

    public getSize(): number {
        return this.size;
    }

    public isDead(): boolean {
        return this.energy <= 0 || this.age >= this.lifespan;
    }

    protected move(dx: number, dy: number, canvasWidth: number, canvasHeight: number): void {
        this.x += dx;
        this.y += dy;

        // Wrap around edges
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
    }

    protected consumeEnergy(amount: number): void {
        this.energy -= amount;
    }

    protected gainEnergy(amount: number): void {
        this.energy += amount;
    }
}
