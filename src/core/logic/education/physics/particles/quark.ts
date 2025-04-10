import { Particle } from './particle';
import { Vector2D } from './utils';


// Базовый класс для кварков
export abstract class Quark extends Particle {
    protected quarkType: string;  // up, down, strange, charm, top, bottom
    protected quarkColor: string; // red, green, blue (цветовой заряд)
    protected antiParticleType: string | null = null;

    constructor(
        position: Vector2D,
        quarkType: string,
        quarkColor: string,
        mass: number,
        charge: number
    ) {
        super(position, mass, charge, 0.5);
        this.quarkType = quarkType;
        this.quarkColor = quarkColor;
        this.radius = 2;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColorFromQuarkColor();
        ctx.fill();

        // Отобразить заряд кварка
        if (this.charge !== 0) {
            ctx.fillStyle = 'white';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const chargeText = this.charge > 0 ?
                `+${Math.abs(this.charge * 3).toFixed(1)}` :
                `-${Math.abs(this.charge * 3).toFixed(1)}`;
            ctx.fillText(chargeText, this.position.x, this.position.y);
        }
    }

    private getColorFromQuarkColor(): string {
        switch (this.quarkColor) {
            case 'red': return 'rgba(255, 0, 0, 0.7)';
            case 'green': return 'rgba(0, 255, 0, 0.7)';
            case 'blue': return 'rgba(0, 0, 255, 0.7)';
            case 'anti-red': return 'rgba(0, 255, 255, 0.7)'; // cyan (анти-красный)
            case 'anti-green': return 'rgba(255, 0, 255, 0.7)'; // magenta (анти-зеленый)
            case 'anti-blue': return 'rgba(255, 255, 0, 0.7)'; // yellow (анти-синий)
            default: return 'rgba(200, 200, 200, 0.7)';
        }
    }

    getQuarkType(): string {
        return this.quarkType;
    }

    getQuarkColor(): string {
        return this.quarkColor;
    }

    setQuarkColor(color: string): void {
        this.quarkColor = color;
    }

    abstract createAntiParticle(): Quark;
}

// Конкретные реализации кварков

// u-кварк (up-кварк)
export class UpQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'red') {
        super(position, 'up', quarkColor, 0.002, 2/3);
        this.color = { r: 255, g: 100, b: 100 };
        this.name = 'u';
        this.antiParticleType = 'anti-up';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiUpQuark({ ...this.position }, antiColor);
    }
}

// d-кварк (down-кварк)
export class DownQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'green') {
        super(position, 'down', quarkColor, 0.005, -1/3);
        this.color = { r: 100, g: 100, b: 255 };
        this.name = 'd';
        this.antiParticleType = 'anti-down';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiDownQuark({ ...this.position }, antiColor);
    }
}

// Анти-u-кварк
export class AntiUpQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'anti-red') {
        super(position, 'anti-up', quarkColor, 0.002, -2/3);
        this.color = { r: 100, g: 255, b: 255 };
        this.name = 'ū';
        this.antiParticle = true;
        this.antiParticleType = 'up';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new UpQuark({ ...this.position }, regularColor);
    }
}

// Анти-d-кварк
export class AntiDownQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'anti-green') {
        super(position, 'anti-down', quarkColor, 0.005, 1/3);
        this.color = { r: 255, g: 100, b: 255 };
        this.name = 'd̄';
        this.antiParticle = true;
        this.antiParticleType = 'down';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new DownQuark({ ...this.position }, regularColor);
    }
}

// Дополнительно можно реализовать странный, очарованный, прелестный и истинный кварки
export class StrangeQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'blue') {
        super(position, 'strange', quarkColor, 0.095, -1/3);
        this.color = { r: 100, g: 200, b: 200 };
        this.name = 's';
        this.antiParticleType = 'anti-strange';
    }

    createAntiParticle(): Quark {
        const antiColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : `anti-${this.quarkColor}`;
        return new AntiStrangeQuark({ ...this.position }, antiColor);
    }
}

export class AntiStrangeQuark extends Quark {
    constructor(position: Vector2D = { x: 0, y: 0 }, quarkColor: string = 'anti-blue') {
        super(position, 'anti-strange', quarkColor, 0.095, 1/3);
        this.color = { r: 200, g: 100, b: 100 };
        this.name = 's̄';
        this.antiParticle = true;
        this.antiParticleType = 'strange';
    }

    createAntiParticle(): Quark {
        const regularColor = this.quarkColor.startsWith('anti-')
            ? this.quarkColor.slice(5)
            : this.quarkColor;
        return new StrangeQuark({ ...this.position }, regularColor);
    }
}