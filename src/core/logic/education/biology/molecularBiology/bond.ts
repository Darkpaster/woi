import {SimulationObject} from "../simulation/simulation.ts";
import {Molecule} from "./molecule.ts";

export enum BondType {
    COVALENT,
    IONIC,
    HYDROGEN,
    VAN_DER_WAALS
}

export class Bond implements SimulationObject {
    public id: string;
    private molecule1: Molecule;
    private molecule2: Molecule;
    private bondType: BondType;
    private strength: number;
    private length: number;
    private color: string;

    constructor(
        id: string,
        molecule1: Molecule,
        molecule2: Molecule,
        bondType: BondType,
        strength: number
    ) {
        this.id = id;
        this.molecule1 = molecule1;
        this.molecule2 = molecule2;
        this.bondType = bondType;
        this.strength = strength;
        this.length = molecule1.getPosition().distanceTo(molecule2.getPosition());

        // Set bond color based on type
        switch (bondType) {
            case BondType.COVALENT: this.color = '#000000'; break;  // Black
            case BondType.IONIC: this.color = '#FF0000'; break;     // Red
            case BondType.HYDROGEN: this.color = '#0000FF'; break;  // Blue
            case BondType.VAN_DER_WAALS: this.color = '#00FF00'; break; // Green
        }
    }

    public update(deltaTime: number): void {
        // Update bond length based on molecule positions
        this.length = this.molecule1.getPosition().distanceTo(this.molecule2.getPosition());

        // Apply forces to maintain the proper bond length
        const idealLength = (this.molecule1.getSize() + this.molecule2.getSize()) * 1.5;
        const diff = this.length - idealLength;

        if (Math.abs(diff) > 0.1) {
            const dir = this.molecule2.getPosition().subtract(this.molecule1.getPosition()).normalize();
            const force = dir.multiply(diff * this.strength * deltaTime);

            // Apply forces in opposite directions
            const m1Mass = this.molecule1.getMass();
            const m2Mass = this.molecule2.getMass();
            const totalMass = m1Mass + m2Mass;

            const m1Force = force.multiply(m2Mass / totalMass);
            const m2Force = force.multiply(-m1Mass / totalMass);

            const m1NewPos = this.molecule1.getPosition().add(m1Force);
            const m2NewPos = this.molecule2.getPosition().add(m2Force);

            this.molecule1.setPosition(m1NewPos);
            this.molecule2.setPosition(m2NewPos);
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const pos1 = this.molecule1.getPosition();
        const pos2 = this.molecule2.getPosition();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.strength;

        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
    }

    public isBroken(): boolean {
        // Check if bond is broken based on distance
        const maxLength = (this.molecule1.getSize() + this.molecule2.getSize()) * 3;
        return this.length > maxLength;
    }
}