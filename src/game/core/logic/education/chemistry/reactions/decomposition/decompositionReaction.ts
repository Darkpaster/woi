// Decomposition reaction: AB → A + B
import {Reaction} from "../reaction.ts";
import {ChemicalEntity} from "../../chemicalEntity.ts";
import {ChemicalSystem} from "../../chemicalSystem.ts";

export class DecompositionReaction extends Reaction {
    private decompositionFactor: number; // Factor affecting decomposition rate

    constructor(
        id: string,
        name: string,
        reactants: ChemicalEntity[],
        products: ChemicalEntity[],
        energyChange: number = 0,
        activationEnergy: number = 0,
        rateConstant: number = 0,
        isReversible: boolean = false,
        decompositionFactor: number = 1.0
    ) {
        super(id, name, reactants, products, energyChange, activationEnergy, rateConstant, isReversible);
        this.decompositionFactor = decompositionFactor;
    }

    public getDecompositionFactor(): number {
        return this.decompositionFactor;
    }

    public setDecompositionFactor(factor: number): void {
        this.decompositionFactor = factor;
    }

    public getType(): string {
        return 'Decomposition';
    }

    public applyReaction(system: ChemicalSystem, timeStep: number): void {
        if (!this.canReact(system.getEntities())) {
            return;
        }

        const reactantIds = this.reactants.map(r => r.getId());
        const availableReactants = system.getEntities().filter(entity =>
            reactantIds.includes(entity.getId())
        );

        // Calculate reaction rate based on temperature, concentration, and rate constant
        const temperature = system.getTemperature();
        const reactionRate = this.calculateReactionRate(temperature, availableReactants.length);

        // Apply the reaction based on rate and time step
        const reactionExtent = reactionRate * timeStep * this.decompositionFactor;

        // Remove reactants and add products based on reaction extent
        if (reactionExtent > 0) {
            // Remove reactants proportionally
            for (const reactant of this.reactants) {
                system.removeEntity(reactant.getId(), reactionExtent);
            }

            // Add products proportionally
            for (const product of this.products) {
                system.addEntity(product, reactionExtent);
            }
        }
    }

    private calculateReactionRate(temperature: number, concentration: number): number {
        // Arrhenius equation: k = A * e^(-Ea/RT)
        const R = 8.314; // Gas constant in J/(mol·K)
        const arrhenius = this.rateConstant * Math.exp(-this.activationEnergy * 1000 / (R * temperature));

        // For decomposition, rate is typically proportional to reactant concentration
        return arrhenius * concentration;
    }
}