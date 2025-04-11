// Мюон - тяжелый лептон
import {Lepton} from "./lepton.ts";
import {AntiMuon} from "./antiMuon.ts";
import {Vector2D} from "../utils.ts";

export class Muon extends Lepton {
    constructor(position: Vector2D) {
        // Параметры мюона: масса больше электрона, заряд -1, спин 0.5
        // Мюон: масса 0.1057 ГэВ, заряд -1, спин 1/2
        super(position, 0.1057, -1, 0.5);
        this.color = { r: 100, g: 200, b: 100 };
        this.radius = 4;
        this.name = 'μ-';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Мюон имеет более короткое время жизни - отражаем это визуально
        const lifespan = 2.2; // мюоны живут примерно 2.2 микросекунды
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 100, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {
        return new AntiMuon({ x: this.position.x, y: this.position.y });
    }

    // Мюоны распадаются со временем
    update(deltaTime: number): void {
        super.update(deltaTime);

        // Вероятность распада зависит от времени жизни
        const decayProbability = deltaTime / 2.2;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        // Мюон распадается на электрон и два нейтрино
        console.log(`${this.name} распался`);
        // Здесь можно добавить логику создания продуктов распада
    }
}