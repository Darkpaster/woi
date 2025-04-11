import { Proton } from './hadrons/baryons/proton.ts';
import { Neutron } from './hadrons/baryons/neutron.ts';
import { Vector2D } from './utils';
import {Particle} from "./particle.ts";

export class AtomCore extends Particle {
    get neutrons(): Neutron[] {
        return this._neutrons;
    }
    get protons(): Proton[] {
        return this._protons;
    }
    private _protons: Proton[];
    private _neutrons: Neutron[];

    constructor(position: Vector2D, protons: Proton[], neutrons: Neutron[]) {
        super(position, 0, protons.length, 0);
        this._protons = protons;
        this._neutrons = neutrons;
    }

    get mass(): number {
        return this._protons.reduce((sum, p) => sum + p.mass, 0) +
            this._neutrons.reduce((sum, n) => sum + n.mass, 0);
    }

    public setVelocity(velocity: Vector2D) {
        this.velocity = velocity;
    }

    update(deltaTime: number): void {
        // Обновить состояние ядра, например, рассчитать внутренние силы
        // В простой симуляции можно пропустить

        // Обновляем положение всех частиц внутри ядра
        const radius = 5;
        const particlesCount = this._protons.length + this._neutrons.length;

        // Размещаем протоны и нейтроны внутри ядра в форме круга
        [...this._protons, ...this._neutrons].forEach((particle, index) => {
            if (particlesCount <= 1) {
                particle.setPosition(this.position);
            } else {
                const angle = (Math.PI * 2 * index) / particlesCount;
                particle.setPosition({
                    x: this.position.x + Math.cos(angle) * radius,
                    y: this.position.y + Math.sin(angle) * radius
                });
            }

            particle.update(deltaTime);
        });
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем контур ядра
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
        ctx.fill();

        // Рисуем протоны и нейтроны
        this._protons.forEach(proton => proton.draw(ctx));
        this._neutrons.forEach(neutron => neutron.draw(ctx));
    }

    getPosition(): Vector2D {
        return { ...this.position };
    }

    setPosition(position: Vector2D): void {
        this.position = { ...position };
    }

    createAntiParticle(): Particle {
        return undefined;
    }
}