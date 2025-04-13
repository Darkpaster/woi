import {Charge, MolarMass} from "../types.ts";
import {ChemicalEntity} from "../chemicalEntity.ts";

export interface ElementCount {
    element: Element;
    count: number;
}

export abstract class Compound extends ChemicalEntity {
    protected composition: ElementCount[];
    protected state: 'solid' | 'liquid' | 'gas' | 'aqueous';

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: MolarMass,
        composition: ElementCount[],
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'solid',
        charge: Charge = 0,
        color: string = '#FFFFFF'
    ) {
        super(id, name, formula, molarMass, charge, color);
        this.composition = [...composition];
        this.state = state;
    }

    public getComposition(): ElementCount[] {
        return [...this.composition];
    }

    public getState(): 'solid' | 'liquid' | 'gas' | 'aqueous' {
        return this.state;
    }

    public setState(state: 'solid' | 'liquid' | 'gas' | 'aqueous'): void {
        this.state = state;
    }

    public calculateMolarMass(): MolarMass {
        return this.composition.reduce(
            (total, { element, count }) => total + element.getMolarMass() * count,
            0
        );
    }

    public abstract getType(): string;

    public render(ctx: CanvasRenderingContext2D): void {
        const { x, y } = this.position;
        const radius = 30; // Размер отображения соединения

        // Рисуем молекулу
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Отображаем формулу
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.formula, x, y);

        // Отображаем состояние вещества
        ctx.font = '10px Arial';
        let stateSymbol = '';
        switch (this.state) {
            case 'solid':
                stateSymbol = '(s)';
                break;
            case 'liquid':
                stateSymbol = '(l)';
                break;
            case 'gas':
                stateSymbol = '(g)';
                break;
            case 'aqueous':
                stateSymbol = '(aq)';
                break;
        }
        ctx.fillText(stateSymbol, x, y + radius * 0.6);
    }
}