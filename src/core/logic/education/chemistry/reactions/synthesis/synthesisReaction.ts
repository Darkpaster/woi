// Synthesis reaction: A + B → AB
import {Reaction} from "../reaction.ts";
import {ChemicalEntity} from "../../chemicalEntity.ts";
import {ChemicalSystem} from "../../chemicalSystem.ts";

export class SynthesisReaction extends Reaction {
    private catalystPresent: boolean;
    private catalystEfficiency: number;

    constructor(
        id: string,
        name: string,
        reactants: ChemicalEntity[],
        products: ChemicalEntity[],
        energyChange: number = 0,
        activationEnergy: number = 0,
        rateConstant: number = 0,
        isReversible: boolean = false,
        catalystPresent: boolean = false,
        catalystEfficiency: number = 1.0
    ) {
        super(id, name, reactants, products, energyChange, activationEnergy, rateConstant, isReversible);
        this.catalystPresent = catalystPresent;
        this.catalystEfficiency = catalystEfficiency;
    }

    public hasCatalyst(): boolean {
        return this.catalystPresent;
    }

    public setCatalyst(present: boolean, efficiency: number = 1.0): void {
        this.catalystPresent = present;
        this.catalystEfficiency = efficiency;
    }

    public getCatalystEfficiency(): number {
        return this.catalystEfficiency;
    }

    public getType(): string {
        return 'Synthesis';
    }

    public applyReaction(system: ChemicalSystem, timeStep: number): void {
        if (!this.canReact(system.getEntities())) {
            return;
        }

        // Get available reactants
        const reactantIds = this.reactants.map(r => r.getId());
        const availableReactants = system.getEntities().filter(entity =>
            reactantIds.includes(entity.getId())
        );

        // Calculate minimum number of reaction sets that can occur
        const reactionSets = this.calculateReactionSets(availableReactants);

        // Calculate reaction rate based on temperature, pressure, and catalyst
        const temperature = system.getTemperature();
        const pressure = system.getPressure();
        const reactionRate = this.calculateReactionRate(temperature, pressure);

        // Apply catalyst effect if present
        const effectiveRate = this.catalystPresent
            ? reactionRate * this.catalystEfficiency
            : reactionRate;

        // Apply the reaction based on rate, time step, and available reactants
        const reactionExtent = Math.min(reactionSets, effectiveRate * timeStep);

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

    private calculateReactionSets(availableReactants: ChemicalEntity[]): number {
        // Group reactants by ID and count occurrences
        const reactantCounts = new Map<string, number>();
        availableReactants.forEach(entity => {
            const id = entity.getId();
            reactantCounts.set(id, (reactantCounts.get(id) || 0) + 1);
        });

        // Count required reactants of each type
        const requiredCounts = new Map<string, number>();
        this.reactants.forEach(entity => {
            const id = entity.getId();
            requiredCounts.set(id, (requiredCounts.get(id) || 0) + 1);
        });

        // Calculate maximum possible reaction sets
        let minSets = Infinity;
        for (const [id, required] of requiredCounts.entries()) {
            const available = reactantCounts.get(id) || 0;
            const possibleSets = Math.floor(available / required);
            minSets = Math.min(minSets, possibleSets);
        }

        return minSets === Infinity ? 0 : minSets;
    }

    private calculateReactionRate(temperature: number, pressure: number): number {
        // Arrhenius equation with pressure consideration
        const R = 8.314; // Gas constant in J/(mol·K)
        const arrhenius = this.rateConstant * Math.exp(-this.activationEnergy * 1000 / (R * temperature));

        // For synthesis reactions, higher pressure often increases rate (for gas-phase reactions)
        const pressureFactor = 1 + 0.1 * Math.log(pressure / 101325); // normalized to 1 atm

        return arrhenius * pressureFactor;
    }
}