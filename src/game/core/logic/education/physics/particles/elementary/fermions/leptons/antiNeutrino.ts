import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";
import {Particle} from "../../../particle.ts";
import {Neutrino} from "./neutrino.ts";

export class AntiNeutrino extends Neutrino {
    constructor(position: Vector2D, flavour: string = 'electron') {
        super(position, flavour);
        this._name = `Anti-${this.name}`;
        this.antiParticle = true;
    }

    createAntiParticle(): Particle {
        const neutrino = new Neutrino(this.getPosition(), this.flavour);
        neutrino.setVelocity(this.getVelocity());
        return neutrino;
    }
}