import {Compound, ElementCount} from "../../compound.ts";

export type FunctionalGroupType =
    | 'alcohol'
    | 'aldehyde'
    | 'ketone'
    | 'carboxylic_acid'
    | 'ester'
    | 'amine'
    | 'amide'
    | 'ether';

export class FunctionalGroup extends Compound {
    private groupType: FunctionalGroupType;
    private reactivity: number; // Шкала от 0 до 10

    constructor(
        id: string,
        name: string,
        formula: string,
        molarMass: number,
        composition: ElementCount[],
        groupType: FunctionalGroupType,
        reactivity: number,
        state: 'solid' | 'liquid' | 'gas' | 'aqueous' = 'liquid',
        color: string = '#FFCCFF'
    ) {
        super(id, name, formula, molarMass, composition, state, 0, color);
        this.groupType = groupType;
        this.reactivity = Math.max(0, Math.min(10, reactivity)); // Ограничиваем значение от 0 до 10
    }

    public getGroupType(): FunctionalGroupType {
        return this.groupType;
    }

    public getReactivity(): number {
        return this.reactivity;
    }

    public getType(): string {
        return 'FunctionalGroup';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const { x, y } = this.position;

        // Визуализация функциональной группы
        ctx.font = '10px Arial';
        ctx.fillStyle = '#800080'; // Purple

        // Отображаем структуру функциональной группы
        let structure = '';
        switch (this.groupType) {
            case 'alcohol':
                structure = '-OH';
                break;
            case 'aldehyde':
                structure = '-CHO';
                break;
            case 'ketone':
                structure = '-C=O';
                break;
            case 'carboxylic_acid':
                structure = '-COOH';
                break;
            case 'ester':
                structure = '-COOR';
                break;
            case 'amine':
                structure = '-NH2';
                break;
            case 'amide':
                structure = '-CONH2';
                break;
            case 'ether':
                structure = '-O-';
                break;
        }

        ctx.fillText(structure, x, y - 20);
        ctx.fillText(`Reactivity: ${this.reactivity}/10`, x, y + 15);

        // Графическое представление функциональной группы
        const radius = 15;
        ctx.beginPath();
        switch (this.groupType) {
            case 'alcohol':
                // Рисуем OH группу
                ctx.arc(x + 20, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#FF0000'; // Красный для кислорода
                ctx.fill();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 15, y);
                break;
            case 'carboxylic_acid':
                // Рисуем COOH группу
                ctx.arc(x + 15, y - 10, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#FF0000'; // Красный для кислорода
                ctx.fill();
                ctx.arc(x + 25, y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 15, y);
                break;
            case 'amine':
                // Рисуем NH2 группу
                ctx.arc(x + 20, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#0000FF'; // Синий для азота
                ctx.fill();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 15, y);
                break;
            default:
                // Для других групп просто обозначаем область
                ctx.arc(x + 20, y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = '#800080'; // Purple
                ctx.lineWidth = 1;
                ctx.stroke();
        }
    }
}
