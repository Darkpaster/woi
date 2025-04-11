// Стерильное нейтрино (кандидат на роль тёмной материи)
import {Vector2D} from "../utils.ts";
import {Lepton} from "../leptons/lepton.ts";
import {Particle} from "../particle.ts";

export class SterileNeutrino extends Lepton {
    private oscillationPhase: number;
    private oscillationRate: number;

    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Стерильное нейтрино: очень лёгкое, нейтральное, не участвует в слабых взаимодействиях
        super(position, 0.0001, 0);
        this.name = 'νs';
        this.color = { r: 220, g: 220, b: 255 }; // Бледно-голубой цвет
        this.radius = 3;
        this.oscillationPhase = Math.random() * Math.PI * 2;
        this.oscillationRate = 0.5 + Math.random() * 0.5; // Частота осцилляций
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Стерильные нейтрино могут осциллировать между разными типами
        this.oscillationPhase += deltaTime * this.oscillationRate;
        if (this.oscillationPhase > Math.PI * 2) {
            this.oscillationPhase -= Math.PI * 2;
        }
    }

    createAntiParticle(): Particle {
        // Если нейтрино - дираковская частица, то антинейтрино отличается
        const antiNeutrino = new SterileNeutrino(this.getPosition());
        antiNeutrino.setVelocity(this.getVelocity());
        antiNeutrino.oscillationPhase = (this.oscillationPhase + Math.PI) % (Math.PI * 2);
        return antiNeutrino;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация нейтринных осцилляций
        const waveRadius = 15;
        const oscFactor = Math.sin(this.oscillationPhase);
        const intensity = 0.3 + 0.2 * oscFactor;

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${intensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Второй круг для визуализации осцилляций
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, waveRadius * (1 + 0.3 * oscFactor), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${intensity * 0.7})`;
        ctx.stroke();
    }

    // Метод для проверки осцилляции в другой тип нейтрино
    oscillate(): string {
        const rand = Math.random();
        if (rand < 0.1) {
            return "electron"; // Осцилляция в электронное нейтрино
        } else if (rand < 0.2) {
            return "muon"; // Осцилляция в мюонное нейтрино
        } else if (rand < 0.3) {
            return "tau"; // Осцилляция в тау-нейтрино
        }
        return "sterile"; // Остаётся стерильным
    }
}