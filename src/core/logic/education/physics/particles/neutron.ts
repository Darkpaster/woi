import { Hadron } from './hadron';
import { Vector2D } from './utils';
import { UpQuark, DownQuark, AntiUpQuark, AntiDownQuark } from './quark';

export class Neutron extends Hadron {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Нейтрон состоит из одного u-кварка и двух d-кварков
        const upQuark = new UpQuark();
        const downQuark1 = new DownQuark();
        const downQuark2 = new DownQuark();

        super(position, [upQuark, downQuark1, downQuark2]);

        this.color = { r: 200, g: 200, b: 200 };
        this.radius = 6;
        this.name = 'n';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительная визуализация для нейтрона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Создать антинейтрон
    createAntiParticle(): Hadron {
        return new AntiNeutron({ x: this.position.x, y: this.position.y });
    }
}

// Антинейтрон - античастица нейтрона
export class AntiNeutron extends Hadron {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Антинейтрон состоит из одного анти-u-кварка и двух анти-d-кварков
        const antiUpQuark = new AntiUpQuark();
        const antiDownQuark1 = new AntiDownQuark();
        const antiDownQuark2 = new AntiDownQuark();

        super(position, [antiUpQuark, antiDownQuark1, antiDownQuark2]);

        this.color = { r: 130, g: 130, b: 130 };
        this.radius = 6;
        this.name = 'n̄';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Визуализация для антинейтрона - пунктирная граница
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(130, 130, 130, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Создать нейтрон (античастица антинейтрона)
    createAntiParticle(): Hadron {
        return new Neutron({ x: this.position.x, y: this.position.y });
    }
}