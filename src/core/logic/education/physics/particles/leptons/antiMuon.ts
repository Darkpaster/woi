import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Lepton} from "./lepton.ts";
import {Muon} from "./muon.ts";

export class AntiMuon extends Lepton {
    constructor(position: Vector2D) {
        // Параметры антимюона: масса как у мюона, заряд +1, спин 0.5
        super(position, 0.105, 1, 0.5);
        this.color = { r: 200, g: 100, b: 200 };
        this.radius = 4;
        this.name = 'μ+';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Антимюон также имеет короткое время жизни
        const lifespan = 2.2;
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 100, 200, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {
        return new Muon(new Vector2D(this.position.x, this.position.y));
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Такая же вероятность распада, как у мюона
        const decayProbability = deltaTime / 2.2;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        console.log(`${this.name} распался`);
        // Логика создания продуктов распада
    }
}