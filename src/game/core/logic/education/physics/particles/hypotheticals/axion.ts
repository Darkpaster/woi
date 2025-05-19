import {Vector2D} from "../../../../../../../utils/math/2d.ts";
import {Boson} from "../elementary/bosons/boson.ts";
import {Particle} from "../particle.ts";

export class Axion extends Boson {
    private phaseShift: number;
    private interactionRadius: number;

    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Аксионы: очень лёгкие, нейтральные, скалярные (спин 0)
        super(position, 0.000001, 0, 'weak');
        this.name = 'AX';
        this.color = { r: 30, g: 30, b: 70 }; // Тёмно-синий цвет
        this.radius = 3;
        this.spin = 0;
        this.phaseShift = Math.random() * Math.PI * 2;
        this.interactionRadius = 50; // Большой радиус взаимодействия (как у тёмной материи)
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Аксионы слабо взаимодействуют с обычной материей
        // но могут превращаться в фотоны в сильных магнитных полях
        this.phaseShift += deltaTime * 0.2;
        if (this.phaseShift > Math.PI * 2) {
            this.phaseShift -= Math.PI * 2;
        }
    }

    createAntiParticle(): Particle {
        // Аксион - собственная античастица
        const antiAxion = new Axion(this.getPosition());
        antiAxion.setVelocity(this.getVelocity());
        return antiAxion;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация "тёмной" природы аксиона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.interactionRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.03)`;
        ctx.fill();

        // Волновой паттерн
        ctx.beginPath();
        for (let radius = this.radius; radius < this.interactionRadius; radius += 10) {
            ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
        }
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.1)`;
        ctx.stroke();
    }

    interactWithPhoton(photon: Particle): boolean {
        // Метод для моделирования превращения аксиона в фотон и наоборот
        // в сильном магнитном поле
        return Math.random() < 0.01; // Очень малый шанс взаимодействия
    }
}