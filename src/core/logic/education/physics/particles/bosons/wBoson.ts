// W-бозон (переносчик слабого взаимодействия)
import {Boson} from "./boson.ts";
import {Vector2D} from "../utils.ts";
import {Particle} from "../particle.ts";

export class WBoson extends Boson {
    constructor(position: Vector2D = { x: 0, y: 0 }, charge: number = 1) {
        // W-бозон: масса около 80.4 ГэВ, заряд +1 или -1
        super(position, 80.4, charge, 'weak');
        this.name = `W${charge > 0 ? '+' : '-'}`;
        this.color = { r: 50, g: 50, b: 255 }; // Синий цвет
        this.radius = 6;
        this.antiParticle = charge < 0; // W- считается античастицей W+
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // W-бозоны короткоживущие
        if (this.age > 3) {
            // Готов к распаду
        }
    }

    createAntiParticle(): Particle {
        const antiW = new WBoson(this.getPosition(), -this.charge);
        antiW.setVelocity(this.getVelocity());
        return antiW;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Добавим символ заряда
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.charge > 0 ? '+' : '-', this.position.x, this.position.y);
    }
}