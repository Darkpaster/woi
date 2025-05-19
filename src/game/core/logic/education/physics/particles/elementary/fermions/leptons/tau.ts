
// Тау-лептон - самый тяжелый лептон
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {Lepton} from "./lepton.ts";
import {AntiTau} from "./antiTau.ts";

export class Tau extends Lepton {
    constructor(position: Vector2D) {
        // Параметры тау-лептона: большая масса, заряд -1, спин 0.5
        super(position, 1.777, -1, 0.5);
        this.color = { r: 150, g: 50, b: 200 };
        this.radius = 5;
        this._name = 'τ-';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Тау имеет очень короткое время жизни
        const lifespan = 0.0003; // примерно 0.3 пикосекунды
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 50, 200, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {
        const antiTau = new AntiTau(this.getPosition());
        antiTau.setVelocity(this.getVelocity());
        return antiTau;
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Большая вероятность распада из-за очень короткого времени жизни
        const decayProbability = deltaTime / 0.0003;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        console.log(`${this.name} распался`);
        // Тау имеет много каналов распада
    }
}