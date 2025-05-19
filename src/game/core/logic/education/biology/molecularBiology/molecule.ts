import {BiologicalEntity, EntityType} from "../simulations/biologicalEntity.ts";
import {Point} from "../../../../../../utils/math/2d.ts";

export enum MoleculeType {
    WATER,
    GLUCOSE,
    PROTEIN,
    DNA,
    RNA,
    ATP,
    ENZYME,
    LIPID
}

export class Molecule extends BiologicalEntity {
    private moleculeType: MoleculeType;
    private energy: number;
    private reactivity: number;
    private charge: number; // -1 (negative), 0 (neutral), 1 (positive)
    private mass: number;

    constructor(
        id: string,
        position: Point,
        moleculeType: MoleculeType,
        mass: number,
        energy: number = 100,
        reactivity: number = 0.5,
        charge: number = 0
    ) {
        // Determine size based on mass with a scaling factor
        const size = Math.max(2, Math.min(10, mass * 0.5));

        // Determine color based on molecule type
        let color = '#000000';
        switch (moleculeType) {
            case MoleculeType.WATER: color = '#ADD8E6'; break;  // Light blue
            case MoleculeType.GLUCOSE: color = '#FFFF99'; break; // Light yellow
            case MoleculeType.PROTEIN: color = '#FF9999'; break; // Light red
            case MoleculeType.DNA: color = '#9999FF'; break;    // Light purple
            case MoleculeType.RNA: color = '#CCCCFF'; break;    // Lighter purple
            case MoleculeType.ATP: color = '#FFCC99'; break;    // Light orange
            case MoleculeType.ENZYME: color = '#99FF99'; break; // Light green
            case MoleculeType.LIPID: color = '#FFFFCC'; break;  // Very light yellow
        }

        super(id, position, EntityType.MOLECULE, size, color);

        this.moleculeType = moleculeType;
        this.energy = energy;
        this.reactivity = reactivity;
        this.charge = charge;
        this.mass = mass;
    }

    public getMoleculeType(): MoleculeType {
        return this.moleculeType;
    }

    public getEnergy(): number {
        return this.energy;
    }

    public getMass(): number {
        return this.mass;
    }

    public getCharge(): number {
        return this.charge;
    }

    public update(deltaTime: number): void {
        // Apply Brownian motion (random movement) based on temperature
        const brownianFactor = 2.0;
        this.velocity = new Point(
            (Math.random() - 0.5) * brownianFactor,
            (Math.random() - 0.5) * brownianFactor
        );

        // Update position based on velocity
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // Slowly decrease energy over time
        this.energy -= 0.1 * deltaTime;
        if (this.energy < 0) this.energy = 0;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw the molecule
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw charge indicator if not neutral
        if (this.charge !== 0) {
            ctx.fillStyle = this.charge > 0 ? '#FF0000' : '#0000FF';
            ctx.beginPath();
            ctx.arc(
                this.position.x + this.size * 0.6,
                this.position.y - this.size * 0.6,
                this.size * 0.3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    // Check if this molecule can react with another molecule
    public canReactWith(other: Molecule): boolean {
        // Simple model: reactivity and proximity determine reaction potential
        const distance = this.position.distanceTo(other.position);
        const reactionThreshold = (this.size + other.size) * 1.2;

        return distance <= reactionThreshold &&
            this.reactivity * other.reactivity > 0.3 &&
            this.energy > 10 &&
            other.energy > 10;
    }
}
