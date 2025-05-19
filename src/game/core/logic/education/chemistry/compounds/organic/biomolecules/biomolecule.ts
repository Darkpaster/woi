import {Compound, ElementCount} from "../../compound.ts";

export type BiomoleculeType =
    | 'protein'
    | 'carbohydrate'
    | 'lipid'
    | 'nucleic_acid'
    | 'enzyme'
    | 'hormone';

export class Biomolecule extends Compound {
    private biomoleculeType: BiomoleculeType;
    private biologicalFunction: string;
    private molecularWeight: number; // в дальтонах

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: number,
        composition: ElementCount[],
        biomoleculeType: BiomoleculeType,
        biologicalFunction: string,
        molecularWeight: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'aqueous',
        color: string = '#FFFFCC'
    ) {
        super(id, name, formula, molarMass, composition, state, 0, color);
        this.biomoleculeType = biomoleculeType;
        this.biologicalFunction = biologicalFunction;
        this.molecularWeight = molecularWeight;
    }

    public getBiomoleculeType(): BiomoleculeType {
        return this.biomoleculeType;
    }

    public getBiologicalFunction(): string {
        return this.biologicalFunction;
    }

    public getMolecularWeight(): number {
        return this.molecularWeight;
    }

    public getType(): string {
        return 'Biomolecule';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const { x, y } = this.position;

        // Визуализация биомолекулы
        ctx.font = '10px Arial';
        ctx.fillStyle = '#006633'; // Зеленый
        ctx.fillText(this.biomoleculeType, x, y - 20);

        // Сокращенное отображение молекулярной массы
        let weightDisplay = '';
        if (this.molecularWeight < 1000) {
            weightDisplay = `${this.molecularWeight.toFixed(1)} Da`;
        } else if (this.molecularWeight < 1000000) {
            weightDisplay = `${(this.molecularWeight / 1000).toFixed(1)} kDa`;
        } else {
            weightDisplay = `${(this.molecularWeight / 1000000).toFixed(1)} MDa`;
        }
        ctx.fillText(weightDisplay, x, y + 15);

        // Различные типы визуализации в зависимости от типа биомолекулы
        switch (this.biomoleculeType) {
            case 'protein':
                // Спиральная структура для белков
                ctx.beginPath();
                ctx.strokeStyle = '#006633';
                ctx.lineWidth = 2;
                for (let i = 0; i < 10; i++) {
                    ctx.arc(x - 20 + i * 5, y + 30, 5, 0, Math.PI);
                }
                ctx.stroke();
                break;
            case 'nucleic_acid':
                // Двойная спираль для ДНК/РНК
                ctx.beginPath();
                ctx.strokeStyle = '#006633';
                ctx.lineWidth = 1;
                for (let i = 0; i < 5; i++) {
                    ctx.moveTo(x - 20, y + 25 + i * 5);
                    ctx.bezierCurveTo(
                        x - 10, y + 25 + i * 5 - 5,
                        x + 10, y + 25 + i * 5 + 5,
                        x + 20, y + 25 + i * 5
                    );
                    ctx.moveTo(x - 20, y + 25 + i * 5 + 2);
                    ctx.bezierCurveTo(
                        x - 10, y + 25 + i * 5 - 3,
                        x + 10, y + 25 + i * 5 + 7,
                        x + 20, y + 25 + i * 5 + 2
                    );
                }
                ctx.stroke();
                break;
            case 'carbohydrate':
                // Структура кольца для углеводов
                ctx.beginPath();
                ctx.strokeStyle = '#006633';
                ctx.lineWidth = 1;
                ctx.moveTo(x - 15, y + 30);
                for (let i = 1; i <= 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    ctx.lineTo(
                        x - 15 + Math.cos(angle) * 10,
                        y + 30 + Math.sin(angle) * 10
                    );
                }
                ctx.stroke();
                break;
            case 'lipid':
                // Липидный слой
                ctx.beginPath();
                ctx.fillStyle = 'rgba(0, 102, 51, 0.3)';
                ctx.arc(x, y + 30, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x - 20, y + 30);
                ctx.lineTo(x + 20, y + 30);
                ctx.strokeStyle = '#006633';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
        }
    }
}
