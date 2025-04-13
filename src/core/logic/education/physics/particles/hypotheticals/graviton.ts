// Гравитон (теоретический переносчик гравитационного взаимодействия)
import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Boson} from "../bosons/boson.ts";
import {Particle} from "../particle.ts";

export class Graviton extends Boson {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Гравитон: теоретически безмассовый, нейтральный, спин 2
        super(position, 0, 0, 'gravitational');
        this.name = 'G';
        this.color = { r: 100, g: 100, b: 100 }; // Тёмно-серый цвет
        this.radius = 3; // Маленький размер
        this.spin = 2; // Гравитон имеет спин 2, в отличие от других бозонов
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Гравитоны взаимодействуют с массой и энергией
        // Логика гравитационного взаимодействия реализуется в симуляции
    }

    // Гравитон является собственной античастицей
    createAntiParticle(): Particle {
        const antiGraviton = new Graviton(this.getPosition());
        antiGraviton.setVelocity(this.getVelocity());
        return antiGraviton;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительное отображение для гравитона - искривление пространства
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
        ctx.stroke();
    }
}