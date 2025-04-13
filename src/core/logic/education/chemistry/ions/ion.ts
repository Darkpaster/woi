import {Charge, MolarMass} from "../types.ts";
import {ChemicalEntity} from "../chemicalEntity.ts";

export abstract class Ion extends ChemicalEntity {
    protected sourceElement: Element | null;

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: MolarMass,
        charge: Charge,
        sourceElement: Element | null = null,
        color: string = '#FFFFFF'
    ) {
        super(id, name, formula, molarMass, charge, color);
        this.sourceElement = sourceElement;
    }

    public getSourceElement(): Element | null {
        return this.sourceElement;
    }

    public abstract getType(): string;

    public render(ctx: CanvasRenderingContext2D): void {
        const { x, y } = this.position;
        const radius = 15;

        // Рисуем круг иона
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Отображаем символ иона
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.formula, x, y);

        // Отображаем заряд в виде "+" или "-"
        let chargeDisplay = '';
        if (this.charge > 0) {
            chargeDisplay = '+' + (this.charge > 1 ? this.charge : '');
        } else if (this.charge < 0) {
            chargeDisplay = '−' + (this.charge < -1 ? Math.abs(this.charge) : '');
        }

        ctx.font = '10px Arial';
        ctx.fillText(chargeDisplay, x + radius, y - radius);
    }
}
