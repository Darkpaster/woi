import {Lepton} from "./lepton.ts";
import {Tau} from "./tau.ts";
import {Vector2D} from "../../../../../../utils/math/2d.ts";

export class AntiTau extends Lepton {
    constructor(position: Vector2D) {
        super(position, 1.777, 1, 0.5);
        this.color = { r: 200, g: 50, b: 150 };
        this.radius = 5;
        this.name = 'τ+';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        const lifespan = 0.0003;
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 50, 150, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {

        return new Tau(new Vector2D(this.position.x, this.position.y));
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        const decayProbability = deltaTime / 0.0003;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        console.log(`${this.name} распался`);
    }
}