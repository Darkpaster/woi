import {Anion} from "./anions/anion.ts";
import {Cation} from "./cations/cation.ts";
import {Position} from "../types.ts";
import {PeriodicTable} from "../elements/periodicTable.ts";

export class IonFactory {
    private periodicTable: PeriodicTable;

    constructor() {
        this.periodicTable = PeriodicTable.getInstance();
    }

    public createCation(
        symbol: string,
        charge: number,
        position?: Position
    ): Cation | null {
        if (charge <= 0) {
            console.error('Cation must have a positive charge');
            return null;
        }

        const element = this.periodicTable.getElementBySymbol(symbol);
        if (!element) {
            console.error(`Element with symbol ${symbol} not found`);
            return null;
        }

        const formula = charge === 1 ? `${symbol}⁺` : `${symbol}⁺⁺`;
        const name = `${element.getName()} ion`;

        const cation = new Cation(
            `cation_${symbol}_${charge}_${Date.now()}`,
            name,
            formula,
            element.getMolarMass(),
            charge,
            element
        );

        if (position) {
            cation.setPosition(position);
        }

        return cation;
    }

    public createAnion(
        symbol: string,
        charge: number,
        position?: Position
    ): Anion | null {
        if (charge >= 0) {
            console.error('Anion must have a negative charge');
            return null;
        }

        const element = this.periodicTable.getElementBySymbol(symbol);
        if (!element) {
            console.error(`Element with symbol ${symbol} not found`);
            return null;
        }

        const formula = charge === -1 ? `${symbol}⁻` : `${symbol}⁻⁻`;
        const name = `${element.getName()} ion`;

        const anion = new Anion(
            `anion_${symbol}_${charge}_${Date.now()}`,
            name,
            formula,
            element.getMolarMass(),
            charge,
            element
        );

        if (position) {
            anion.setPosition(position);
        }

        return anion;
    }

    public createPolyatomicIon(
        formula: string,
        name: string,
        charge: number,
        molarMass: number,
        position?: Position
    ): Cation | Anion | null {
        if (charge === 0) {
            console.error('Ion must have a non-zero charge');
            return null;
        }

        const ionId = `polyatomic_${formula}_${Date.now()}`;

        if (charge > 0) {
            const cation = new Cation(
                ionId,
                name,
                formula,
                molarMass,
                charge,
                null
            );

            if (position) {
                cation.setPosition(position);
            }

            return cation;
        } else {
            const anion = new Anion(
                ionId,
                name,
                formula,
                molarMass,
                charge,
                null
            );

            if (position) {
                anion.setPosition(position);
            }

            return anion;
        }
    }
}