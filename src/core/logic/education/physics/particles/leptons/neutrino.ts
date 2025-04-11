import { Particle } from '../particle.ts';
import { Vector2D } from '../utils.ts';

export class Neutrino extends Particle {
    protected flavour: string; // Электронное, мюонное или тау-нейтрино

    constructor(position: Vector2D, flavour: string = 'electron') {
        // Нейтрино: очень малая масса, нейтральное, спин 1/2
        super(position, 0.000001, 0, 0.5);
        this.flavour = flavour;
        this.name = `${flavour[0].toUpperCase()}${flavour.slice(1)} Neutrino`;
        this.color = { r: 200, g: 230, b: 255 }; // Светло-голубой
        this.radius = 2; // Очень маленький размер
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Нейтрино очень слабо взаимодействует с материей
        // Практически не меняет траекторию при столкновении
    }

    createAntiParticle(): Particle {
        const antiNeutrino = new AntiNeutrino(this.getPosition(), this.flavour);
        antiNeutrino.setVelocity(this.getVelocity());
        return antiNeutrino;
    }

    getFlavour(): string {
        return this.flavour;
    }
}

export class AntiNeutrino extends Neutrino {
    constructor(position: Vector2D, flavour: string = 'electron') {
        super(position, flavour);
        this.name = `Anti-${this.name}`;
        this.antiParticle = true;
    }

    createAntiParticle(): Particle {
        const neutrino = new Neutrino(this.getPosition(), this.flavour);
        neutrino.setVelocity(this.getVelocity());
        return neutrino;
    }
}