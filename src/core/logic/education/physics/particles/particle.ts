import { Vector2D } from './utils';

export interface Color {
    r: number;
    g: number;
    b: number;
}

export abstract class Particle {
    protected position: Vector2D;
    protected velocity: Vector2D;
    protected acceleration: Vector2D;
    private _mass: number | undefined;
    public get mass(): number | undefined {
        return this._mass;
    }
    public set mass(value: number) {
        this._mass = value;
    }
    charge: number;
    protected spin: number;
    protected color: Color;
    protected radius: number;
    protected name: string;
    protected age: number = 0;
    protected antiParticle: boolean = false;

    constructor(position: Vector2D, mass: number, charge: number, spin: number) {
        this.position = { ...position };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.mass = mass;
        this.charge = charge;
        this.spin = spin;
        this.color = { r: 255, g: 255, b: 255 };
        this.radius = 5;
        this.name = '?';
    }

    update(deltaTime: number): void {
        // Обновляем скорость
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;

        // Обновляем позицию
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Сбрасываем ускорение
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        // Увеличиваем возраст частицы
        this.age += deltaTime;
    }

    applyForce(force: Vector2D): void {
        // F = ma -> a = F/m
        this.acceleration.x += force.x / this.mass;
        this.acceleration.y += force.y / this.mass;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
        ctx.fill();

        // Отображаем название частицы
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y + this.radius + 8);
    }

    collidesWith(other: Particle): boolean {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + other.radius;
    }

    getPosition(): Vector2D {
        return { ...this.position };
    }

    setPosition(position: Vector2D): void {
        this.position = { ...position };
    }

    getVelocity(): Vector2D {
        return { ...this.velocity };
    }

    setVelocity(velocity: Vector2D): void {
        this.velocity = { ...velocity };
    }

    getMass(): number {
        return this.mass;
    }

    getCharge(): number {
        return this.charge;
    }

    getSpin(): number {
        return this.spin;
    }

    getName(): string {
        return this.name;
    }

    isAntiParticle(): boolean {
        return this.antiParticle;
    }

    // Абстрактный метод для создания античастицы
    abstract createAntiParticle(): Particle;
}