// Гравитино (суперпартнёр гравитона в теории суперсимметрии)
import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Lepton} from "../elementary/fermions/leptons/lepton.ts";
import {Particle} from "../particle.ts";

export class Gravitino extends Lepton {
    private superSymmetryEnergy: number;

    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Гравитино: фермионный партнёр гравитона со спином 3/2
        super(position, 0, 0);
        this.name = 'G̃';
        this.color = { r: 150, g: 150, b: 150 }; // Серебристый цвет
        this.radius = 5;
        this.spin = 1.5; // Спин 3/2
        this.superSymmetryEnergy = 1000; // Энергия нарушения суперсимметрии
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Гравитино взаимодействует очень слабо, в основном гравитационно
    }

    createAntiParticle(): Particle {
        // Гравитино является майорановской частицей (совпадает со своей античастицей)
        const antiGravitino = new Gravitino(this.getPosition());
        antiGravitino.setVelocity(this.getVelocity());
        return antiGravitino;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация суперсимметричной природы
        ctx.beginPath();
        const sides = 6; // Шестиугольник для фермиона высокого спина
        const angleStep = Math.PI * 2 / sides;

        for (let i = 0; i <= sides; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = this.position.x + Math.cos(angle) * this.radius * 1.5;
            const y = this.position.y + Math.sin(angle) * this.radius * 1.5;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Внутренняя структура - связь с гравитацией
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.stroke();
    }
}