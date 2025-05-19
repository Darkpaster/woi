import {Compound, ElementCount} from "../../compound.ts";

export class Oxide extends Compound {
    private oxidationType: 'basic' | 'acidic' | 'amphoteric' | 'neutral';

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: number,
        composition: ElementCount[],
        oxidationType: 'basic' | 'acidic' | 'amphoteric' | 'neutral',
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'solid',
        color: string = '#FFCC99'
    ) {
        super(id, name, formula, molarMass, composition, state, 0, color);
        this.oxidationType = oxidationType;
    }

    public getOxidationType(): 'basic' | 'acidic' | 'amphoteric' | 'neutral' {
        return this.oxidationType;
    }

    public getType(): string {
        return 'Oxide';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const { x, y } = this.position;

        // Визуальный индикатор типа оксида
        let indicatorColor = '';
        switch (this.oxidationType) {
            case 'basic':
                indicatorColor = '#0000FF';
                break;
            case 'acidic':
                indicatorColor = '#FF0000';
                break;
            case 'amphoteric':
                indicatorColor = '#800080'; // Purple
                break;
            case 'neutral':
                indicatorColor = '#808080'; // Gray
                break;
        }

        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.strokeStyle = indicatorColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Текстовый индикатор типа оксида
        ctx.font = '10px Arial';
        ctx.fillStyle = indicatorColor;
        ctx.fillText(this.oxidationType, x, y + 20);
    }
}
