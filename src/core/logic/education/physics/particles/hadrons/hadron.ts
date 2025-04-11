import { Particle } from '../particle.ts';
import { Quark } from '../quarks/quark.ts';
import { Gluon } from '../bosons/gluon.ts';
import { Vector2D } from '../utils.ts';

// Базовый класс для адронов (частиц, состоящих из кварков)
export abstract class Hadron extends Particle {
    protected quarks: Quark[];
    protected gluons: Gluon[] = [];
    protected hadronType: string; // baryon или meson

    constructor(position: Vector2D, quarks: Quark[]) {
        // Вычисляем массу, заряд и спин на основе составляющих кварков
        const totalMass = quarks.reduce((sum, q) => sum + q.getMass(), 0);
        const totalCharge = quarks.reduce((sum, q) => sum + q.getCharge(), 0);

        // Спин адрона - сумма спинов кварков, но это упрощение для симуляции
        const totalSpin = 0.5;

        super(position, totalMass, totalCharge, totalSpin);

        this.quarks = quarks;
        this.hadronType = quarks.length === 3 ? 'baryon' : 'meson';

        // Инициализация кварков внутри адрона
        this.arrangeQuarks();

        // Создаем глюоны между кварками
        this.createGluons();
    }

    private arrangeQuarks(): void {
        const radius = this.radius * 0.7;

        this.quarks.forEach((quark, index) => {
            const angle = (Math.PI * 2 * index) / this.quarks.length;
            const quarkPosition = {
                x: this.position.x + Math.cos(angle) * radius,
                y: this.position.y + Math.sin(angle) * radius
            };

            quark.setPosition(quarkPosition);
        });
    }

    private createGluons(): void {
        this.gluons = [];

        // Создаем глюоны между всеми парами кварков
        for (let i = 0; i < this.quarks.length; i++) {
            for (let j = i + 1; j < this.quarks.length; j++) {
                const quark1 = this.quarks[i];
                const quark2 = this.quarks[j];

                // Создаем глюон, соединяющий два кварка
                const gluonPosition = {
                    x: (quark1.getPosition().x + quark2.getPosition().x) / 2,
                    y: (quark1.getPosition().y + quark2.getPosition().y) / 2
                };

                // Цвет глюона зависит от цветов соединяемых кварков
                const gluon = new Gluon(
                    gluonPosition,
                    quark1.getQuarkColor(),
                    quark2.getQuarkColor().startsWith('anti-') ?
                        quark2.getQuarkColor() :
                        `anti-${quark2.getQuarkColor()}`
                );

                this.gluons.push(gluon);
            }
        }
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Обновляем положение кварков внутри адрона
        this.arrangeQuarks();

        // Обновляем кварки
        this.quarks.forEach(quark => quark.update(deltaTime));

        // Обновляем и при необходимости пересоздаем глюоны
        this.gluons = this.gluons.filter(gluon => !gluon.isExpired());
        this.gluons.forEach(gluon => gluon.update(deltaTime));

        if (Math.random() < 0.05) {
            this.createGluons();
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем контур адрона
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.3)`;
        ctx.fill();

        // Рисуем глюоны
        this.gluons.forEach(gluon => gluon.draw(ctx));

        // Рисуем кварки
        this.quarks.forEach(quark => quark.draw(ctx));

        // Рисуем название адрона
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y + this.radius + 10);
    }

    getHadronType(): string {
        return this.hadronType;
    }

    getQuarks(): Quark[] {
        return [...this.quarks];
    }
}