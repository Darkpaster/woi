import {Compound, ElementCount} from "../../compound.ts";

export class Salt extends Compound {
    private solubility: number; // г/100мл воды при 25°C

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: number,
        composition: ElementCount[],
        solubility: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'solid',
        color: string = '#FFFFFF'
    ) {
        super(id, name, formula, molarMass, composition, state, 0, color);
        this.solubility = solubility;
    }

    public getSolubility(): number {
        return this.solubility;
    }

    public isSoluble(): boolean {
        return this.solubility > 1; // Условное значение для определения растворимости
    }

    public getType(): string {
        return 'Salt';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        // Дополнительные элементы для визуализации соли
        const { x, y } = this.position;

        // Кристаллическая структура для солей
        if (this.state === 'solid') {
            ctx.beginPath();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;

            // Рисуем кристаллическую решетку
            const size = 10;
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    if (Math.abs(i) === 2 || Math.abs(j) === 2) {
                        ctx.strokeRect(x + i * size, y + j * size, size, size);
                    }
                }
            }
        }

        // Индикатор растворимости
        ctx.font = '10px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(`Sol: ${this.solubility.toFixed(1)} g/100ml`, x, y + 20);
    }
}
