import { Hadron } from './hadron';
import { Vector2D } from './utils';
import { UpQuark, DownQuark, AntiUpQuark, AntiDownQuark } from './quark';

export class Proton extends Hadron {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Протон состоит из двух u-кварков и одного d-кварка
        const upQuark1 = new UpQuark();
        const upQuark2 = new UpQuark();
        const downQuark = new DownQuark();

        super(position, [upQuark1, upQuark2, downQuark]);

        this.color = { r: 255, g: 100, b: 100 };
        this.radius = 6;
        this.name = 'p+';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительная визуализация для протона - знак "+"
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', this.position.x, this.position.y);

        // Добавляем свечение для протона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Создать антипротон
    createAntiParticle(): Hadron {
        return new AntiProton({ x: this.position.x, y: this.position.y });
    }
}

// Антипротон - античастица протона
export class AntiProton extends Hadron {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Антипротон состоит из двух анти-u-кварков и одного анти-d-кварка
        const antiUpQuark1 = new AntiUpQuark();
        const antiUpQuark2 = new AntiUpQuark();
        const antiDownQuark = new AntiDownQuark();

        super(position, [antiUpQuark1, antiUpQuark2, antiDownQuark]);

        this.color = { r: 100, g: 50, b: 50 };
        this.radius = 6;
        this.name = 'p-';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Дополнительная визуализация для антипротона - знак "-"
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('-', this.position.x, this.position.y);

        // Добавляем пунктирное свечение для антипротона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(100, 50, 50, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Создать протон (античастица антипротона)
    createAntiParticle(): Hadron {
        return new Proton({ x: this.position.x, y: this.position.y });
    }
}