// Base abstract class for all chemical reactions
import {ChemicalEntity} from "../chemicalEntity.ts";
import {ChemicalSystem} from "../chemicalSystem.ts";

export abstract class Reaction {
    protected id: string;
    protected name: string;
    protected reactants: ChemicalEntity[];
    protected products: ChemicalEntity[];
    protected energyChange: number; // in kJ/mol, positive for endothermic, negative for exothermic
    protected activationEnergy: number; // in kJ/mol
    protected rateConstant: number;
    protected isReversible: boolean;

    constructor(
        id: string,
        name: string,
        reactants: ChemicalEntity[],
        products: ChemicalEntity[],
        energyChange: number = 0,
        activationEnergy: number = 0,
        rateConstant: number = 0,
        isReversible: boolean = false
    ) {
        this.id = id;
        this.name = name;
        this.reactants = [...reactants];
        this.products = [...products];
        this.energyChange = energyChange;
        this.activationEnergy = activationEnergy;
        this.rateConstant = rateConstant;
        this.isReversible = isReversible;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getReactants(): ChemicalEntity[] {
        return [...this.reactants];
    }

    public getProducts(): ChemicalEntity[] {
        return [...this.products];
    }

    public getEnergyChange(): number {
        return this.energyChange;
    }

    public getActivationEnergy(): number {
        return this.activationEnergy;
    }

    public getRateConstant(): number {
        return this.rateConstant;
    }

    public isReactionReversible(): boolean {
        return this.isReversible;
    }

    public abstract getType(): string;

    // Method to check if reaction can proceed with given reagents
    public canReact(entities: ChemicalEntity[]): boolean {
        // Check if all reactants are present in sufficient quantities
        return this.reactants.every(reactant =>
            entities.some(entity => entity.getId() === reactant.getId())
        );
    }

    // Method to apply the reaction to a chemical system
    public abstract applyReaction(system: ChemicalSystem, timeStep: number): void;

    // Method to visualize the reaction
    public render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        // Draw reactants
        const reactantsWidth = width * 0.4;
        this.renderEntities(ctx, this.reactants, x, y, reactantsWidth, height);

        // Draw arrow
        this.renderArrow(ctx, x + reactantsWidth, y + height / 2, width * 0.2, this.isReversible);

        // Draw products
        const productsX = x + reactantsWidth + width * 0.2;
        this.renderEntities(ctx, this.products, productsX, y, reactantsWidth, height);

        // Draw energy information
        this.renderEnergyInfo(ctx, x, y + height + 10, width);
    }

    private renderEntities(ctx: CanvasRenderingContext2D, entities: ChemicalEntity[], x: number, y: number, width: number, height: number): void {
        const entityWidth = width / entities.length;

        entities.forEach((entity, index) => {
            const entityX = x + index * entityWidth + entityWidth / 2;
            const entityY = y + height / 2;

            // Set entity position temporarily for rendering
            const originalPosition = { ...entity.getPosition() };
            entity.setPosition(entityX, entityY);

            // Render the entity
            entity.render(ctx);

            // Restore original position
            entity.setPosition(originalPosition.x, originalPosition.y);

            // Draw stoichiometric coefficient if needed (can be implemented)
        });
    }

    private renderArrow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, isReversible: boolean): void {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width - 10, y - 5);
        ctx.lineTo(x + width - 10, y + 5);
        ctx.closePath();
        ctx.fillStyle = '#000000';
        ctx.fill();

        // If reversible, draw second arrow
        if (isReversible) {
            ctx.beginPath();
            ctx.moveTo(x + width, y - 10);
            ctx.lineTo(x, y - 10);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw second arrowhead
            ctx.beginPath();
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x + 10, y - 15);
            ctx.lineTo(x + 10, y - 5);
            ctx.closePath();
            ctx.fillStyle = '#000000';
            ctx.fill();
        }
    }

    private renderEnergyInfo(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        let energyLabel = this.energyChange > 0
            ? `Endothermic: +${this.energyChange.toFixed(2)} kJ/mol`
            : `Exothermic: ${this.energyChange.toFixed(2)} kJ/mol`;

        ctx.fillText(energyLabel, x + width / 2, y);
        ctx.fillText(`Activation Energy: ${this.activationEnergy.toFixed(2)} kJ/mol`, x + width / 2, y + 20);
    }
}