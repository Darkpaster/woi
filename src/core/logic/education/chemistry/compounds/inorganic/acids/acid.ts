import {Compound, ElementCount} from "../../compound.ts";
import {pH} from "../../../types.ts";

export class Acid extends Compound {
    private pKa: number;
    private strength: 'strong' | 'moderate' | 'weak';

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: number,
        composition: ElementCount[],
        pKa: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'aqueous',
        color: string = '#FFCCCC'
    ) {
        super(id, name, formula, molarMass, composition, state, 0, color);
        this.pKa = pKa;
        this.strength = this.calculateStrength();
    }

    private calculateStrength(): 'strong' | 'moderate' | 'weak' {
        if (this.pKa < 0) return 'strong';
        if (this.pKa < 4) return 'moderate';
        return 'weak';
    }

    public getPKa(): number {
        return this.pKa;
    }

    public getStrength(): 'strong' | 'moderate' | 'weak' {
        return this.strength;
    }

    public calculatepH(concentration: number): pH {
        // Упрощенный расчет pH для кислот
        // Для сильных кислот: pH = -log10(concentration)
        // Для слабых кислот используем уравнение Henderson-Hasselbalch
        if (this.strength === 'strong') {
            return -Math.log10(concentration);
        } else {
            // Упрощенный расчет для слабых кислот
            return 0.5 * (this.pKa - Math.log10(concentration));
        }
    }

    public getType(): string {
        return 'Acid';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        // Добавляем индикатор кислоты (красный оттенок вокруг молекулы)
        const { x, y } = this.position;
        const radius = 40;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fill();

        // Индикатор силы кислоты
        ctx.font = '10px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText(`pKa: ${this.pKa.toFixed(2)}`, x, y + 10);
    }
}