import {Element} from "./element.ts";

export class PeriodicTable {
    private elements: Map<string, Element>;
    private elementsByAtomicNumber: Map<number, Element>;
    private static instance: PeriodicTable;

    public constructor() {
        this.elements = new Map<string, Element>();
        this.elementsByAtomicNumber = new Map<number, Element>();
        this.initializePeriodicTable();
    }

    public static getInstance(): PeriodicTable {
        if (!PeriodicTable.instance) {
            PeriodicTable.instance = new PeriodicTable();
        }
        return PeriodicTable.instance;
    }

    private initializePeriodicTable(): void {
        this.addElement(new Element('H', 'Hydrogen', 'H', 1, 1.008, 2.20, 1, 1, 1, '1s1', 53, '#FFFFFF'));
        this.addElement(new Element('O', 'Oxygen', 'O', 8, 16.0, 3.44, 16, 2, 6, '1s2 2s2 2p4', 48, '#FF0000'));
        this.addElement(new Element('C', 'Carbon', 'C', 6, 12.011, 2.55, 14, 2, 4, '1s2 2s2 2p2', 67, '#808080'));
        this.addElement(new Element('N', 'Nitrogen', 'N', 7, 14.007, 3.04, 15, 2, 5, '1s2 2s2 2p3', 56, '#0000FF'));
        this.addElement(new Element('Na', 'Sodium', 'Na', 11, 22.99, 0.93, 1, 3, 1, '1s2 2s2 2p6 3s1', 166, '#808080'));
        this.addElement(new Element('Cl', 'Chlorine', 'Cl', 17, 35.45, 3.16, 17, 3, 7, '1s2 2s2 2p6 3s2 3p5', 79, '#00FF00'));
        this.addElement(new Element('He', 'Helium', 'He', 2, 4.0026, null, 18, 1, 0, '1s2', 31, '#D9FFFF'));
        this.addElement(new Element('Li', 'Lithium', 'Li', 3, 6.94, 0.98, 1, 2, 1, '1s2 2s1', 167, '#CC80FF'));
        this.addElement(new Element('Be', 'Beryllium', 'Be', 4, 9.0122, 1.57, 2, 2, 2, '1s2 2s2', 112, '#C2FF00'));
        this.addElement(new Element('B', 'Boron', 'B', 5, 10.81, 2.04, 13, 2, 3, '1s2 2s2 2p1', 87, '#FFB5B5'));
        this.addElement(new Element('F', 'Fluorine', 'F', 9, 18.998, 3.98, 17, 2, 7, '1s2 2s2 2p5', 64, '#00FF00'));
        this.addElement(new Element('Ne', 'Neon', 'Ne', 10, 20.18, null, 18, 2, 0, '1s2 2s2 2p6', 69, '#D9FFFF'));
        this.addElement(new Element('Mg', 'Magnesium', 'Mg', 12, 24.305, 1.31, 2, 3, 2, '1s2 2s2 2p6 3s2', 160, '#C2FF00'));
        this.addElement(new Element('Al', 'Aluminum', 'Al', 13, 26.982, 1.61, 13, 3, 3, '1s2 2s2 2p6 3s2 3p1', 143, '#EBA6A6'));
        this.addElement(new Element('Si', 'Silicon', 'Si', 14, 28.085, 1.90, 14, 3, 4, '1s2 2s2 2p6 3s2 3p2', 111, '#CCCC99'));
        this.addElement(new Element('P', 'Phosphorus', 'P', 15, 30.974, 2.19, 15, 3, 5, '1s2 2s2 2p6 3s2 3p3', 98, '#FFB5B5'));
        this.addElement(new Element('S', 'Sulfur', 'S', 16, 32.06, 2.58, 16, 3, 6, '1s2 2s2 2p6 3s2 3p4', 88, '#FFFF00'));
        this.addElement(new Element('Ar', 'Argon', 'Ar', 18, 39.948, null, 18, 3, 0, '1s2 2s2 2p6 3s2 3p6', 71, '#D9FFFF'));
        this.addElement(new Element('K', 'Potassium', 'K', 19, 39.098, 0.82, 1, 4, 1, '[Ar] 4s1', 243, '#CC80FF'));
        this.addElement(new Element('Ca', 'Calcium', 'Ca', 20, 40.078, 1.00, 2, 4, 2, '[Ar] 4s2', 194, '#C2FF00'));
    }

    public addElement(element: Element): void {
        this.elements.set(element.getSymbol(), element);
        this.elementsByAtomicNumber.set(element.getAtomicNumber(), element);
    }

    public getElementBySymbol(symbol: string): Element | undefined {
        return this.elements.get(symbol);
    }

    public getElementByAtomicNumber(atomicNumber: number): Element | undefined {
        return this.elementsByAtomicNumber.get(atomicNumber);
    }

    public getAllElements(): Element[] {
        return Array.from(this.elements.values());
    }
}
