// Redox reaction: A + B → A+ + B-
import {ChemicalEntity} from "../../chemicalEntity.ts";
import {Reaction} from "../reaction.ts";
import {ChemicalSystem} from "../../chemicalSystem.ts";

export class RedoxReaction extends Reaction {
    private electronTransferCount: number;
    private electrochemicalPotential: number; // in volts

    constructor(
        id: string,
        name: string,
        reactants: ChemicalEntity[],
        products: ChemicalEntity[],
        energyChange: number = 0,
        activationEnergy: number = 0,
        rateConstant: number = 0,
        isReversible: boolean = false,
        electronTransferCount: number = 1,
        electrochemicalPotential: number = 0
    ) {
        super(id, name, reactants, products, energyChange, activationEnergy, rateConstant, isReversible);
        this.electronTransferCount = electronTransferCount;
        this.electrochemicalPotential = electrochemicalPotential;
    }

    public getElectronTransferCount(): number {
        return this.electronTransferCount;
    }

    public getElectrochemicalPotential(): number {
        return this.electrochemicalPotential;
    }

    public getType(): string {
        return 'Redox';
    }

    public applyReaction(system: ChemicalSystem, timeStep: number): void {
        if (!this.canReact(system.getEntities())) {
            return;
        }

        const temperature = system.getTemperature();
        const concentrationFactor = this.calculateConcentrationFactor(system);

        // Calculate standard cell potential using Nernst equation
        const R = 8.314; // Gas constant in J/(mol·K)
        const F = 96485; // Faraday constant in C/mol
        const nernstFactor = (R * temperature) / (this.electronTransferCount * F);
        const actualPotential = this.electrochemicalPotential - nernstFactor * Math.log(concentrationFactor);

        // Calculate reaction rate based on electrochemical potential
        const reactionRate = this.rateConstant * Math.exp(Math.abs(actualPotential) / nernstFactor);

        // Calculate reaction extent
        const reactionExtent = reactionRate * timeStep;

        if (reactionExtent > 0) {
            // Remove reactants
            for (const reactant of this.reactants) {
                system.removeEntity(reactant.getId(), reactionExtent);
            }

            // Add products
            for (const product of this.products) {
                system.addEntity(product, reactionExtent);
            }
        }
    }

    private calculateConcentrationFactor(system: ChemicalSystem): number {
        // Calculate concentration quotient for Nernst equation
        const entities = system.getEntities();
        const volume = system.getVolume();

        let reductantConcentration = 1;
        let oxidantConcentration = 1;

        // Identify oxidants (gain electrons) and reductants (lose electrons)
        // This is a simplified approach - in a real system would need to identify redox pairs

        // Assuming products are oxidized/reduced forms of reactants
        for (const product of this.products) {
            const count = entities.filter(e => e.getId() === product.getId()).length;
            const concentration = count / volume;

            if (product.getCharge() > 0) {
                // Oxidized form (lost electrons)
                oxidantConcentration *= concentration || 0.000001;
            } else if (product.getCharge() < 0) {
                // Reduced form (gained electrons)
                reductantConcentration *= concentration || 0.000001;
            }
        }

        for (const reactant of this.reactants) {
            const count = entities.filter(e => e.getId() === reactant.getId()).length;
            const concentration = count / volume;

            if (reactant.getCharge() === 0 || reactant.getCharge() < 0) {
                // Potential reductant (will lose electrons)
                reductantConcentration *= concentration || 0.000001;
            } else if (reactant.getCharge() > 0) {
                // Potential oxidant (will gain electrons)
                oxidantConcentration *= concentration || 0.000001;
            }
        }

        return oxidantConcentration / reductantConcentration;
    }

    // Override render to show electrochemical information
    public render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        // Call parent render method
        super.render(ctx, x, y, width, height);

        // Add redox-specific information
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        const potentialText = `Cell Potential: ${this.electrochemicalPotential.toFixed(2)}V`;
        const electronText = `Electrons Transferred: ${this.electronTransferCount}`;

        ctx.fillText(potentialText, x + width / 2, y + height + 50);
        ctx.fillText(electronText, x + width / 2, y + height + 70);
    }
}