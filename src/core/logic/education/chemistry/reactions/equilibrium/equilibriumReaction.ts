// Equilibrium reaction: A + B ⇌ C + D
import {ChemicalSystem} from "../../chemicalSystem.ts";
import {ChemicalEntity} from "../../chemicalEntity.ts";
import {Reaction} from "../reaction.ts";

export class EquilibriumReaction extends Reaction {
    private equilibriumConstant: number; // Keq
    private forwardRate: number;
    private reverseRate: number;

    constructor(
        id: string,
        name: string,
        reactants: ChemicalEntity[],
        products: ChemicalEntity[],
        energyChange: number = 0,
        activationEnergy: number = 0,
        rateConstant: number = 0,
        equilibriumConstant: number = 1.0,
        forwardRate: number = 0.5,
        reverseRate: number = 0.5
    ) {
        super(id, name, reactants, products, energyChange, activationEnergy, rateConstant, true);
        this.equilibriumConstant = equilibriumConstant;
        this.forwardRate = forwardRate;
        this.reverseRate = reverseRate;
    }

    public getEquilibriumConstant(): number {
        return this.equilibriumConstant;
    }

    public setEquilibriumConstant(constant: number): void {
        this.equilibriumConstant = constant;
    }

    public getForwardRate(): number {
        return this.forwardRate;
    }

    public getReverseRate(): number {
        return this.reverseRate;
    }

    public getType(): string {
        return 'Equilibrium';
    }

    public applyReaction(system: ChemicalSystem, timeStep: number): void {
        // Get entities from the system
        const entities = system.getEntities();

        // Check if forward reaction can proceed
        const canForward = this.reactants.every(reactant =>
            entities.some(entity => entity.getId() === reactant.getId())
        );

        // Check if reverse reaction can proceed
        const canReverse = this.products.every(product =>
            entities.some(entity => entity.getId() === product.getId())
        );

        if (!canForward && !canReverse) {
            return;
        }

        const temperature = system.getTemperature();

        // Calculate reaction quotient Q
        const Q = this.calculateReactionQuotient(system);

        // Determine if we should favor forward or reverse reaction
        const forwardFavorability = this.equilibriumConstant / Math.max(Q, 0.000001);

        // Calculate temperature-adjusted rates
        const adjustedForwardRate = this.calculateTemperatureAdjustedRate(this.forwardRate, temperature, this.activationEnergy);
        const adjustedReverseRate = this.calculateTemperatureAdjustedRate(this.reverseRate, temperature, this.activationEnergy - this.energyChange);

        // Calculate net reaction extent considering equilibrium
        let netReactionExtent = 0;

        if (canForward) {
            const forwardExtent = adjustedForwardRate * timeStep * (forwardFavorability > 1 ? 1 : forwardFavorability);
            netReactionExtent += forwardExtent;
        }

        if (canReverse) {
            const reverseExtent = adjustedReverseRate * timeStep * (forwardFavorability < 1 ? 1 : 1/forwardFavorability);
            netReactionExtent -= reverseExtent;
        }

        // Apply reaction changes
        if (netReactionExtent > 0) {
            // Forward reaction dominates
            for (const reactant of this.reactants) {
                system.removeEntity(reactant.getId(), netReactionExtent);
            }

            for (const product of this.products) {
                system.addEntity(product, netReactionExtent);
            }
        } else if (netReactionExtent < 0) {
            // Reverse reaction dominates
            const absExtent = Math.abs(netReactionExtent);

            for (const product of this.products) {
                system.removeEntity(product.getId(), absExtent);
            }

            for (const reactant of this.reactants) {
                system.addEntity(reactant, absExtent);
            }
        }
    }

    private calculateReactionQuotient(system: ChemicalSystem): number {
        // Simplified calculation of reaction quotient
        // Q = [Products] / [Reactants]

        const entities = system.getEntities();
        const volume = system.getVolume();

        let productConcentration = 1;
        let reactantConcentration = 1;

        // Calculate product concentrations
        for (const product of this.products) {
            const count = entities.filter(e => e.getId() === product.getId()).length;
            const concentration = count / volume;
            productConcentration *= concentration || 0.000001; // Avoid division by zero
        }

        // Calculate reactant concentrations
        for (const reactant of this.reactants) {
            const count = entities.filter(e => e.getId() === reactant.getId()).length;
            const concentration = count / volume;
            reactantConcentration *= concentration || 0.000001; // Avoid division by zero
        }

        return productConcentration / reactantConcentration;
    }

    private calculateTemperatureAdjustedRate(rate: number, temperature: number, activationEnergy: number): number {
        // Arrhenius equation: k = A * e^(-Ea/RT)
        const R = 8.314; // Gas constant in J/(mol·K)
        return rate * Math.exp(-activationEnergy * 1000 / (R * temperature));
    }
}