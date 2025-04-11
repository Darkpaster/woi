import { AtomCore } from './atomCore';
import { Electron } from './leptons/electron.ts';
import { Neutron } from './hadrons/baryons/neutron.ts';
import { Proton } from './hadrons/baryons/proton.ts';
import { Vector2D } from './utils';

export class Atom {
    private core: AtomCore;
    private electrons: Electron[] = [];
    private position: Vector2D;
    private velocity: Vector2D;
    private element: string;

    constructor(
        position: Vector2D,
        element: string,
        protons: number,
        neutrons: number,
        electrons: number
    ) {
        this.position = position;
        this.velocity = { x: 0, y: 0 };
        this.element = element;

        // Создаем ядро атома
        const protonArray: Proton[] = [];
        const neutronArray: Neutron[] = [];

        for (let i = 0; i < protons; i++) {
            protonArray.push(new Proton());
        }

        for (let i = 0; i < neutrons; i++) {
            neutronArray.push(new Neutron());
        }

        this.core = new AtomCore(position, protonArray, neutronArray);

        // Создаем электроны на орбитах
        for (let i = 0; i < electrons; i++) {
            const angle = (Math.PI * 2 * i) / electrons;
            const orbitRadius = 30 + (i % 3) * 15; // Разные орбиты
            const electronPosition = {
                x: position.x + Math.cos(angle) * orbitRadius,
                y: position.y + Math.sin(angle) * orbitRadius
            };
            this.electrons.push(new Electron(electronPosition));
        }
    }

    get mass(): number {
        return this.core.mass + this.electrons.reduce((sum, e) => sum + e.mass, 0);
    }

    get charge(): number {
        return this.core.charge - this.electrons.length;
    }

    update(deltaTime: number): void {
        // Обновляем позицию атома
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Обновляем ядро
        this.core.setPosition(this.position);
        this.core.update(deltaTime);

        // Обновляем электроны (вращаем вокруг ядра)
        this.electrons.forEach((electron, i) => {
            const shellIndex = Math.floor(i / 8); // Максимум 8 электронов на оболочке
            const electronIndex = i % 8;
            const orbitRadius = 30 + shellIndex * 15;
            const angularVelocity = 2 - shellIndex * 0.5; // Разная скорость вращения для разных оболочек

            const angle = (Math.PI * 2 * electronIndex) / 8 + angularVelocity * deltaTime;

            const electronPosition = {
                x: this.position.x + Math.cos(angle) * orbitRadius,
                y: this.position.y + Math.sin(angle) * orbitRadius
            };

            electron.setPosition(electronPosition);
            electron.update(deltaTime);
        });
    }

    applyForce(force: Vector2D): void {
        const acceleration = {
            x: force.x / this.mass,
            y: force.y / this.mass
        };

        this.velocity.x += acceleration.x;
        this.velocity.y += acceleration.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем ядро
        this.core.draw(ctx);

        // Рисуем электроны
        this.electrons.forEach(electron => electron.draw(ctx));

        // Рисуем информацию об атоме
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.element, this.position.x - 10, this.position.y - 40);
    }

    getPosition(): Vector2D {
        return { ...this.position };
    }

    setPosition(position: Vector2D): void {
        this.position = { ...position };
    }

    getVelocity(): Vector2D {
        return { ...this.velocity };
    }

    setVelocity(velocity: Vector2D): void {
        this.velocity = { ...velocity };
    }
}