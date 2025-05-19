import {AtomicNumber, Color, ElementSymbol, MolarMass} from "../types.ts";
import {ChemicalEntity} from "../chemicalEntity.ts";

export class Element extends ChemicalEntity {
    private atomicNumber: AtomicNumber;
    private symbol: ElementSymbol;
    private electronegativity: number;
    private groupNumber: number;
    private periodNumber: number;
    private valenceElectrons: number;
    private electronConfiguration: string;
    private radius: number; // Атомный радиус в пикометрах

    constructor(
        id: string,
        name: string,
        symbol: ElementSymbol,
        atomicNumber: AtomicNumber,
        molarMass: MolarMass,
        electronegativity: number,
        groupNumber: number,
        periodNumber: number,
        valenceElectrons: number,
        electronConfiguration: string,
        radius: number,
        color: Color
    ) {
        super(id, name, symbol, molarMass, 0, color);
        this.atomicNumber = atomicNumber;
        this.symbol = symbol;
        this.electronegativity = electronegativity;
        this.groupNumber = groupNumber;
        this.periodNumber = periodNumber;
        this.valenceElectrons = valenceElectrons;
        this.electronConfiguration = electronConfiguration;
        this.radius = radius;
    }

    public getAtomicNumber(): AtomicNumber {
        return this.atomicNumber;
    }

    public getSymbol(): ElementSymbol {
        return this.symbol;
    }

    public getElectronegativity(): number {
        return this.electronegativity;
    }

    public getGroupNumber(): number {
        return this.groupNumber;
    }

    public getPeriodNumber(): number {
        return this.periodNumber;
    }

    public getValenceElectrons(): number {
        return this.valenceElectrons;
    }

    public getElectronConfiguration(): string {
        return this.electronConfiguration;
    }

    public getRadius(): number {
        return this.radius;
    }

    public getType(): string {
        return 'Element';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const { x, y } = this.position;
        const radius = 20; // Размер отображения элемента

        // Рисуем круг
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Добавляем символ элемента
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, x, y);

        // Номер элемента
        ctx.font = '10px Arial';
        ctx.fillText(this.atomicNumber.toString(), x, y - radius * 0.6);
    }
}