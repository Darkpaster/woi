import { MolarMass, Charge, Color } from './types.ts';
import {Entity} from "./entity.ts";

export abstract class ChemicalEntity extends Entity {
    protected name: string;
    protected formula: string;
    protected molarMass: MolarMass;
    protected charge: Charge;
    protected color: Color;

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: MolarMass,
        charge: Charge = 0,
        color: Color = '#FFFFFF'
    ) {
        super(id);
        this.name = name;
        this.formula = formula;
        this.molarMass = molarMass;
        this.charge = charge;
        this.color = color;
    }

    public getName(): string {
        return this.name;
    }

    public getFormula(): string {
        return this.formula;
    }

    public getMolarMass(): MolarMass {
        return this.molarMass;
    }

    public getCharge(): Charge {
        return this.charge;
    }

    public getColor(): Color {
        return this.color;
    }

    public setColor(color: Color): void {
        this.color = color;
    }

    public abstract getType(): string;
}