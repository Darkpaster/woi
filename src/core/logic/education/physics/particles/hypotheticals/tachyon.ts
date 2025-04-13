// Тахион (гипотетическая частица, движущаяся быстрее света)
import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Particle} from "../particle.ts";

export class Tachyon extends Particle {
    private phaseTrail: Vector2D[];
    private maxTrailLength: number;

    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Тахионы: частицы с мнимой массой, двигающиеся быстрее света
        super(position, -1, 0); // Отрицательный квадрат массы
        this.name = 'T';
        this.color = { r: 200, g: 0, b: 200 }; // Пурпурный цвет
        this.radius = 2;
        this.phaseTrail = [];
        this.maxTrailLength = 20;

        // Тахионы всегда движутся со сверхсветовой скоростью
        const angle = Math.random() * Math.PI * 2;
        const speed = 500; // Скорость выше скорости света в симуляции
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Тахионы всегда движутся со сверхсветовой скоростью
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        const c = 299.792458; // Скорость света в условных единицах симуляции

        if (speed < c * 1.1) { // Если скорость близка к световой или меньше
            const scaleFactor = (c * 1.1) / speed;
            this.velocity.x *= scaleFactor;
            this.velocity.y *= scaleFactor;
        }

        // Сохраняем путь для визуализации
        this.phaseTrail.unshift({...this.position});
        if (this.phaseTrail.length > this.maxTrailLength) {
            this.phaseTrail.pop();
        }
    }

    createAntiParticle(): Particle {
        // Античастица тахиона движется в противоположном направлении
        const antiTachyon = new Tachyon(this.getPosition());
        antiTachyon.velocity.x = -this.velocity.x;
        antiTachyon.velocity.y = -this.velocity.y;
        return antiTachyon;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация нарушения причинности (движения "назад во времени")
        if (this.phaseTrail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.phaseTrail[0].x, this.phaseTrail[0].y);

            for (let i = 1; i < this.phaseTrail.length; i++) {
                ctx.lineTo(this.phaseTrail[i].x, this.phaseTrail[i].y);

                // Фазовые искажения пространства-времени
                if (i % 3 === 0) {
                    const phaseOffset = Math.sin(i * 0.2) * 5;
                    const normalX = -(this.velocity.y) / Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                    const normalY = this.velocity.x / Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

                    ctx.lineTo(
                        this.phaseTrail[i].x + normalX * phaseOffset,
                        this.phaseTrail[i].y + normalY * phaseOffset
                    );
                }
            }

            ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Черенковское излучение (конус)
        ctx.beginPath();
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        const coneAngle = Math.PI / 8;

        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(
            this.position.x - Math.cos(angle - coneAngle) * this.radius * 10,
            this.position.y - Math.sin(angle - coneAngle) * this.radius * 10
        );
        ctx.lineTo(
            this.position.x - Math.cos(angle + coneAngle) * this.radius * 10,
            this.position.y - Math.sin(angle + coneAngle) * this.radius * 10
        );
        ctx.closePath();

        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.radius * 10
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
    }
}