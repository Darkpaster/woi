// Струна (базовый строительный блок из теории струн)
import {Vector2D} from "../utils.ts";
import {Particle} from "../particle.ts";

export class String extends Particle {
    private oscillationPhase: number;
    private oscillationAmplitude: number;
    private length: number;
    private tension: number;

    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Струны имеют планковскую длину (чрезвычайно малы)
        super(position, 0, 0);
        this.name = 'STR';
        this.color = { r: 255, g: 200, b: 0 }; // Золотистый цвет
        this.radius = 2; // Визуально маленький размер
        this.oscillationPhase = Math.random() * Math.PI * 2;
        this.oscillationAmplitude = 3;
        this.length = 5; // Относительная длина для визуализации
        this.tension = 0.8; // Натяжение струны
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Струны колеблются в многомерном пространстве
        this.oscillationPhase += deltaTime * 5;
        if (this.oscillationPhase > Math.PI * 2) {
            this.oscillationPhase -= Math.PI * 2;
        }
    }

    createAntiParticle(): Particle {
        // В теории струн античастицы - это те же струны, колеблющиеся в противофазе
        const antiString = new String(this.getPosition());
        antiString.setVelocity(this.getVelocity());
        antiString.oscillationPhase = (this.oscillationPhase + Math.PI) % (Math.PI * 2); // Противофаза
        return antiString;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация колебаний струны
        ctx.beginPath();
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        for (let i = -this.length; i <= this.length; i += 0.5) {
            const x = this.position.x + Math.cos(angle) * i;
            const y = this.position.y + Math.sin(angle) * i;

            const offset = Math.sin(i * 0.5 + this.oscillationPhase) * this.oscillationAmplitude;
            const offsetX = -Math.sin(angle) * offset;
            const offsetY = Math.cos(angle) * offset;

            if (i === -this.length) {
                ctx.moveTo(x + offsetX, y + offsetY);
            } else {
                ctx.lineTo(x + offsetX, y + offsetY);
            }
        }

        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    vibrate(frequency: number): void {
        // Метод для изменения частоты колебаний струны
        // От частоты колебаний зависит, какую частицу представляет струна
        this.oscillationAmplitude = frequency;
    }
}