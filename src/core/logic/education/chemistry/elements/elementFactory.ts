import {PeriodicTable} from "./periodicTable.ts";
import {Position} from "../types.ts";
import {Element} from "./element.ts";

export class ElementFactory {
    private periodicTable: PeriodicTable;

    constructor() {
        this.periodicTable = PeriodicTable.getInstance();
    }

    public createElement(symbol: string, position?: Position): Element | null {
        const element = this.periodicTable.getElementBySymbol(symbol);
        if (!element) {
            return null;
        }

        // Создаем копию элемента для использования в симуляции
        const newElement = new Element(
            `${symbol}_${Date.now()}`,
            element.getName(),
            element.getSymbol(),
            element.getAtomicNumber(),
            element.getMolarMass(),
            element.getElectronegativity(),
            element.getGroupNumber(),
            element.getPeriodNumber(),
            element.getValenceElectrons(),
            element.getElectronConfiguration(),
            element.getRadius(),
            element.getColor()
        );

        if (position) {
            newElement.setPosition(position);
        }

        return newElement;
    }
}