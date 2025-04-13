import {Hydrocarbon, HydrocarbonType} from "./organic/hydrocarbons/hydrocarbon.ts";
import {ElementCount} from "./compound.ts";
import {Position} from "../types.ts";
import {Oxide} from "./inorganic/oxides/oxide.ts";
import {Salt} from "./inorganic/salts/salt.ts";
import {Base} from "./inorganic/bases/base.ts";
import {Acid} from "./inorganic/acids/acid.ts";
import {PeriodicTable} from "../elements/periodicTable.ts";

export class CompoundFactory {
    private periodicTable: PeriodicTable;

    constructor() {
        this.periodicTable = PeriodicTable.getInstance();
    }

    public createAcid(
        name: string,
        formula: string,
        composition: { symbol: string; count: number }[],
        pKa: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'aqueous',
        position?: Position
    ): Acid | null {
        const elements: ElementCount[] = [];
        let molarMass = 0;

        for (const { symbol, count } of composition) {
            const element = this.periodicTable.getElementBySymbol(symbol);
            if (!element) return null;

            elements.push({ element, count });
            molarMass += element.getMolarMass() * count;
        }

        const acid = new Acid(
            `acid_${Date.now()}`,
            name,
            formula,
            molarMass,
            elements,
            pKa,
            state
        );

        if (position) {
            acid.setPosition(position);
        }

        return acid;
    }

    public createBase(
        name: string,
        formula: string,
        composition: { symbol: string; count: number }[],
        pKb: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'aqueous',
        position?: Position
    ): Base | null {
        const elements: ElementCount[] = [];
        let molarMass = 0;

        for (const { symbol, count } of composition) {
            const element = this.periodicTable.getElementBySymbol(symbol);
            if (!element) return null;

            elements.push({ element, count });
            molarMass += element.getMolarMass() * count;
        }

        const base = new Base(
            `base_${Date.now()}`,
            name,
            formula,
            molarMass,
            elements,
            pKb,
            state
        );

        if (position) {
            base.setPosition(position);
        }

        return base;
    }

    public createSalt(
        name: string,
        formula: string,
        composition: { symbol: string; count: number }[],
        solubility: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'solid',
        position?: Position
    ): Salt | null {
        const elements: ElementCount[] = [];
        let molarMass = 0;

        for (const { symbol, count } of composition) {
            const element = this.periodicTable.getElementBySymbol(symbol);
            if (!element) return null;

            elements.push({ element, count });
            molarMass += element.getMolarMass() * count;
        }

        const salt = new Salt(
            `salt_${Date.now()}`,
            name,
            formula,
            molarMass,
            elements,
            solubility,
            state
        );

        if (position) {
            salt.setPosition(position);
        }

        return salt;
    }

    public createOxide(
        name: string,
        formula: string,
        composition: { symbol: string; count: number }[],
        oxidationType: 'basic' | 'acidic' | 'amphoteric' | 'neutral',
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'solid',
        position?: Position
    ): Oxide | null {
        const elements: ElementCount[] = [];
        let molarMass = 0;

        for (const { symbol, count } of composition) {
            const element = this.periodicTable.getElementBySymbol(symbol);
            if (!element) return null;

            elements.push({ element, count });
            molarMass += element.getMolarMass() * count;
        }

        const oxide = new Oxide(
            `oxide_${Date.now()}`,
            name,
            formula,
            molarMass,
            elements,
            oxidationType,
            state
        );

        if (position) {
            oxide.setPosition(position);
        }

        return oxide;
    }

    public createHydrocarbon(
        name: string,
        formula: string,
        hydrocarbonType: HydrocarbonType,
        carbonCount: number,
        hydrogenCount: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'liquid',
        position?: Position
    ): Hydrocarbon | null {
        const elements: ElementCount[] = [];
        let molarMass = 0;

        // Добавляем углерод и водород
        const carbon = this.periodicTable.getElementBySymbol('C');
        const hydrogen = this.periodicTable.getElementBySymbol('H');

        if (!carbon || !hydrogen) return null;

        elements.push({ element: carbon, count: carbonCount });
        elements.push({ element: hydrogen, count: hydrogenCount });

        molarMass = carbon.getMolarMass() * carbonCount + hydrogen.getMolarMass() * hydrogenCount;

        const hydrocarbon = new Hydrocarbon(
            `hydrocarbon_${Date.now()}`,
            name,
            formula,
            molarMass,
            elements,
            hydrocarbonType,
            carbonCount,
            hydrogenCount,
            state
        );

        if (position) {
            hydrocarbon.setPosition(position);
        }

        return hydrocarbon;
    }

    // Методы для создания других соединений...
    // Аналогичные методы для FunctionalGroup и Biomolecule
}