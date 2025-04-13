// Магнитный монополь (гипотетическая частица с одним магнитным полюсом)
import {Vector2D} from "../../../../../../utils/math/2d.ts";
import {Particle} from "../particle.ts";

export class MagneticMonopole extends Particle {
    private magneticCharge: number; // Северный (+1) или южный (-1) магнитный полюс
    private fieldStrength: number;

    constructor(position: Vector2D = new Vector2D(0, 0), magneticCharge: number = 1) {
        // Магнитные монополи: массивные, с магнитным зарядом
        super(position, 1000, 0); // Очень тяжёлая частица
        this.name = magneticCharge > 0 ? 'N' : 'S';
        this.color = magneticCharge > 0 ? { r: 200, g: 50, b: 50 } : { r: 50, g: 50, b: 200 };
        this.radius = 8; // Большой размер из-за массы
        this.magneticCharge = magneticCharge;
        this.fieldStrength = 100;
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Магнитные монополи создают магнитное поле и могут ускорять заряженные частицы
    }

    createAntiParticle(): Particle {
        // Античастица магнитного монополя имеет противоположный магнитный заряд
        const antiMonopole = new MagneticMonopole(this.getPosition(), -this.magneticCharge);
        antiMonopole.setVelocity(this.getVelocity());
        return antiMonopole;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация магнитного поля
        const numLines = 16;
        const lineLength = this.fieldStrength;

        ctx.beginPath();
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const startX = this.position.x + Math.cos(angle) * this.radius;
            const startY = this.position.y + Math.sin(angle) * this.radius;
            const endX = this.position.x + Math.cos(angle) * lineLength;
            const endY = this.position.y + Math.sin(angle) * lineLength;

            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);

            // Добавим стрелки на концах линий поля
            const arrowSize = 5;
            const arrowAngle = Math.PI / 6;

            if (this.magneticCharge > 0) { // Линии от монополя
                const angle1 = angle + Math.PI - arrowAngle;
                const angle2 = angle + Math.PI + arrowAngle;

                ctx.moveTo(endX, endY);
                ctx.lineTo(endX + Math.cos(angle1) * arrowSize, endY + Math.sin(angle1) * arrowSize);
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX + Math.cos(angle2) * arrowSize, endY + Math.sin(angle2) * arrowSize);
            } else { // Линии к монополю
                const angle1 = angle - arrowAngle;
                const angle2 = angle + arrowAngle;

                ctx.moveTo(startX, startY);
                ctx.lineTo(startX + Math.cos(angle1) * arrowSize, startY + Math.sin(angle1) * arrowSize);
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX + Math.cos(angle2) * arrowSize, startY + Math.sin(angle2) * arrowSize);
            }
        }

        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.4)`;
        ctx.stroke();

        // Символ магнитного заряда
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.magneticCharge > 0 ? 'N' : 'S', this.position.x, this.position.y);
    }

    getMagneticCharge(): number {
        return this.magneticCharge;
    }
}