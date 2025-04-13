import { Particle } from '../particle.ts';
import {Vector2D} from "../../../../../../utils/math/2d.ts";


// Базовый класс для кварков
export abstract class Quark extends Particle {
    protected quarkType: string;  // up, down, strange, charm, top, bottom
    protected quarkColor: string; // red, green, blue (цветовой заряд)
    protected antiParticleType: string | null = null;

    protected constructor(
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

















