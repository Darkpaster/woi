import {Charge, MolarMass} from "../../types.ts";
import {Ion} from "../ion.ts";

export class Cation extends Ion {
    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: MolarMass,
        charge: Charge,
        sourceElement: Element | null = null,
        color: string = '#FF9999'
    ) {
        super(id, name, formula, molarMass, charge, sourceElement, color);

        if (charge <= 0) {
            throw new Error('Cation must have a positive charge');
        }
    }

    public getType(): string {
        return 'Cation';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        // Добавляем визуальное обозначение для катиона
        const { x, y } = this.position;
        const radius = 25;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Стрелки, указывающие наружу (отдача электронов)
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            const startX = x + Math.cos(angle) * (radius - 5);
            const startY = y + Math.sin(angle) * (radius - 5);
            const endX = x + Math.cos(angle) * (radius + 5);
            const endY = y + Math.sin(angle) * (radius + 5);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Наконечник стрелки
            const arrowSize = 3;
            const angleOffset = Math.PI / 6;

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle - angleOffset),
                endY - arrowSize * Math.sin(angle - angleOffset)
            );
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle + angleOffset),
                endY - arrowSize * Math.sin(angle + angleOffset)
            );
            ctx.closePath();
            ctx.fillStyle = '#FF0000';
            ctx.fill();
        }
    }
}