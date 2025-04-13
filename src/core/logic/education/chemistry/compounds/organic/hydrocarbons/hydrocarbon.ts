import {Compound, ElementCount} from "../../compound.ts";

export type HydrocarbonType = 'alkane' | 'alkene' | 'alkyne' | 'aromatic' | 'cyclic';

export class Hydrocarbon extends Compound {
    private hydrocarbonType: HydrocarbonType;
    private carbonCount: number;
    private hydrogenCount: number;

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: number,
        composition: ElementCount[],
        hydrocarbonType: HydrocarbonType,
        carbonCount: number,
        hydrogenCount: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'liquid',
        color: string = '#CCFFCC'
    ) {
        super(id, name, formula, molarMass, composition, state, 0, color);
        this.hydrocarbonType = hydrocarbonType;
        this.carbonCount = carbonCount;
        this.hydrogenCount = hydrogenCount;
    }

    public getHydrocarbonType(): HydrocarbonType {
        return this.hydrocarbonType;
    }

    public getCarbonCount(): number {
        return this.carbonCount;
    }

    public getHydrogenCount(): number {
        return this.hydrogenCount;
    }

    public getType(): string {
        return 'Hydrocarbon';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const { x, y } = this.position;

        // Рисуем углеродную цепь в упрощенном виде
        const startX = x - 30;
        const carbonSpacing = 60 / (this.carbonCount - 1 || 1);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // Рисуем скелет молекулы углеводорода
        ctx.beginPath();
        if (this.hydrocarbonType === 'cyclic' || this.hydrocarbonType === 'aromatic') {
            // Рисуем кольцевую структуру
            ctx.beginPath();
            const radius = 20;
            ctx.arc(x, y, radius, 0, Math.PI * 2);

            // Для ароматических соединений рисуем внутренний круг
            if (this.hydrocarbonType === 'aromatic') {
                ctx.moveTo(x + radius * 0.7, y);
                ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
            }
        } else {
            // Рисуем линейную структуру
            ctx.moveTo(startX, y);

            // Рисуем линии в зависимости от типа
            if (this.hydrocarbonType === 'alkane') {
                // Одинарная связь
                // Одинарная связь
                for (let i = 0; i < this.carbonCount - 1; i++) {
                    ctx.lineTo(startX + (i + 1) * carbonSpacing, y);
                }
            } else if (this.hydrocarbonType === 'alkene') {
                // Двойная связь
                for (let i = 0; i < this.carbonCount - 1; i++) {
                    ctx.lineTo(startX + (i + 1) * carbonSpacing, y);

                    // Рисуем вторую линию для двойной связи для первого сегмента
                    if (i === 0) {
                        ctx.moveTo(startX, y - 3);
                        ctx.lineTo(startX + carbonSpacing, y - 3);
                        ctx.moveTo(startX + carbonSpacing, y);
                    }
                }
            } else if (this.hydrocarbonType === 'alkyne') {
                // Тройная связь
                for (let i = 0; i < this.carbonCount - 1; i++) {
                    ctx.lineTo(startX + (i + 1) * carbonSpacing, y);

                    // Рисуем дополнительные линии для тройной связи для первого сегмента
                    if (i === 0) {
                        ctx.moveTo(startX, y - 3);
                        ctx.lineTo(startX + carbonSpacing, y - 3);
                        ctx.moveTo(startX, y + 3);
                        ctx.lineTo(startX + carbonSpacing, y + 3);
                        ctx.moveTo(startX + carbonSpacing, y);
                    }
                }
            }
        }
        ctx.stroke();

        // Добавляем обозначение типа углеводорода
        ctx.font = '10px Arial';
        ctx.fillStyle = '#006600';
        ctx.fillText(this.hydrocarbonType, x, y - 25);
    }
}