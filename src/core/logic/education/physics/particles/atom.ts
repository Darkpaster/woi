import { AtomCore } from './atomCore';
import { Electron } from './leptons/electron.ts';
import { Neutron } from './hadrons/baryons/neutron.ts';
import { Proton } from './hadrons/baryons/proton.ts';
import {Vector2D} from "../../../../../utils/math/2d.ts";

export class Atom {
    get velocity(): Vector2D {
        return this._velocity;
    }
    get position(): Vector2D {
        return this._position;
    }
    private core: AtomCore;
    private electrons: Electron[] = [];
    private _position: Vector2D;
    private _velocity: Vector2D;
    private element: string;

    constructor(
        position: Vector2D,
        element: string,
        protons: number,
        neutrons: number,
        electrons: number
    ) {
        this._position = position;
        this._velocity = new Vector2D(0, 0);
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

            const electronPosition = new Vector2D(position.x + Math.cos(angle) * orbitRadius,position.y + Math.sin(angle) * orbitRadius);
            this.electrons.push(new Electron(electronPosition));
        }
    }

    get mass(): number {
        return this.core.mass + this.electrons.reduce((sum, e) => sum + e.mass, 0);
    }

    set mass(mass: number) {
        this.core.mass = mass;
    }

    public get charge(): number {
        return this.core.charge - this.electrons.length;
    }

    update(deltaTime: number): void {
        // Обновляем позицию атома
        this._position.x += this._velocity.x * deltaTime;
        this._position.y += this._velocity.y * deltaTime;

        // Обновляем ядро
        this.core.setPosition(this._position);
        this.core.update(deltaTime);

        // Обновляем электроны (вращаем вокруг ядра)
        this.electrons.forEach((electron, i) => {
            const shellIndex = Math.floor(i / 8); // Максимум 8 электронов на оболочке
            const electronIndex = i % 8;
            const orbitRadius = 30 + shellIndex * 15;
            const angularVelocity = 2 - shellIndex * 0.5; // Разная скорость вращения для разных оболочек

            const angle = (Math.PI * 2 * electronIndex) / 8 + angularVelocity * deltaTime;


            const electronPosition = new Vector2D(this._position.x + Math.cos(angle) * orbitRadius,this._position.y + Math.sin(angle) * orbitRadius);

            electron.setPosition(electronPosition);
            electron.update(deltaTime);
        });
    }

    applyForce(force: Vector2D): void {
        const acceleration = {
            x: force.x / this.mass,
            y: force.y / this.mass
        };

        this._velocity.x += acceleration.x;
        this._velocity.y += acceleration.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем ядро
        this.core.draw(ctx);

        // Рисуем электроны
        this.electrons.forEach(electron => electron.draw(ctx));

        // Рисуем информацию об атоме
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.element, this._position.x - 20, this._position.y - 20);
    }

    getPosition(): Vector2D {
        return this._position;
    }

    setPosition(position: Vector2D): void {
        this._position = new Vector2D(position.x, position.y);
    }

    getVelocity(): Vector2D {
        return this._velocity;
    }

    setVelocity(velocity: Vector2D): void {
        this._velocity = new Vector2D(velocity.x, velocity.y);
    }
}