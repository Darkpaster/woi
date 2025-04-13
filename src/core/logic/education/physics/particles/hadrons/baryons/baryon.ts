import { Particle } from '../../particle.ts';
import {Vector2D} from "../../../../../../../utils/math/2d.ts";
import {Quark} from "../../quarks/quark.ts";

export abstract class Baryon extends Particle {
    protected quarks: Quark[] = [];

    constructor(position: Vector2D, mass: number, charge: number, spin: number) {
        super(position, mass, charge, spin);
        this.radius = 6;
        // this.name = this.generateName();
        // this.name = `${q1}-${q2}-${q3} Baryon`;
        this.color = { r: 128, g: 0, b: 128 }; // Фиолетовый цвет
    }

    // private generateName(): string {
    //     // Упрощенная логика для генерации названия бариона
    //     const [q1, q2, q3] = this.quarkComposition;
    //     if (q1 === 'up' && q2 === 'up' && q3 === 'down') return 'Proton';
    //     if (q1 === 'up' && q2 === 'down' && q3 === 'down') return 'Neutron';
    //     if (q1 === 'up' && q2 === 'down' && q3 === 'strange') return 'Λ0';
    //     if (q1 === 'up' && q2 === 'up' && q3 === 'strange') return 'Σ+';
    //     if (q1 === 'down' && q2 === 'down' && q3 === 'strange') return 'Σ-';
    //     return `${q1}-${q2}-${q3} Baryon`;
    // }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Некоторые барионы стабильны (протон), другие нет
        if (this.name !== 'Proton' && this.age > 10) {
            // Готов к распаду (кроме протона)
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем основу бариона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`;
        ctx.fill();

        // Рисуем кварки внутри бариона
        this.quarks.forEach((quark, index) => {
            const angle = (index / this.quarks.length) * Math.PI * 2;
            const offset = this.radius * 0.6;
            const x = this.position.x + Math.cos(angle) * offset;
            const y = this.position.y + Math.sin(angle) * offset;

            quark.setPosition(new Vector2D(x,y));
            quark.draw(ctx);
        });

        // Отображаем название бариона
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y + this.radius + 8);
    }

    abstract createAntiParticle(): Baryon;

    // createAntiParticle(): Particle {
        // Для создания античастицы меняем кварки на антикварки
        // const [q1, q2, q3] = this.quarkComposition;
        // const aq1 = q1.startsWith('anti-') ? q1.slice(5) : `anti-${q1}`;
        // const aq2 = q2.startsWith('anti-') ? q2.slice(5) : `anti-${q2}`;
        // const aq3 = q3.startsWith('anti-') ? q3.slice(5) : `anti-${q3}`;
        //
        // const antiBaryon = new Baryon(
        //     this.getPosition(),
        //     [aq1, aq2, aq3],
        //     this.mass,
        //     -this.charge
        // );
        // antiBaryon.setVelocity(this.getVelocity());
        // antiBaryon.antiParticle = true;
        // return antiBaryon;
    // }

    getQuarkComposition(): Quark[] {
        return [...this.quarks];
    }
}