import {pH} from "../../../types.ts";
import {Compound, ElementCount} from "../../compound.ts";

export class Base extends Compound {
    private pKb: number;
    private strength: 'strong' | 'moderate' | 'weak';

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: number,
        composition: ElementCount[],
        pKb: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'aqueous',
        color: string = '#CCCCFF'
    ) {
        super(id, name, formula, molarMass, composition, state, 0, color);
        this.pKb = pKb;
        this.strength = this.calculateStrength();
    }

    private calculateStrength(): 'strong' | 'moderate' | 'weak' {
        if (this.pKb < 0) return 'strong';
        if (this.pKb < 4) return 'moderate';
        return 'weak';
    }

    public getPKb(): number {
        return this.pKb;
    }

    public getStrength(): 'strong' | 'moderate' | 'weak' {
        return this.strength;
    }

    public calculatepH(concentration: number): pH {
        // Упрощенный расчет pH для оснований
        // Для сильных оснований: pH = 14 + log10(concentration)
        // Для слабых оснований используем pKb
        if (this.strength === 'strong') {
            return 14 + Math.log10(concentration);
        } else {
            // Упрощенный расчет для слабых оснований
            return 14 - 0.5 * (this.pKb - Math.log10(concentration));
        }
    }

    public getType(): string {
        return 'Base';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        // Добавляем индикатор основания (синий оттенок вокруг молекулы)
        const { x, y } = this.position;
        const radius = 40;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        ctx.fill();

        // Индикатор силы основания
        ctx.font = '10px Arial';
        ctx.fillStyle = '#0000FF';
        ctx.fillText(`pKb: ${this.pKb.toFixed(2)}`, x, y + 10);
    }
}