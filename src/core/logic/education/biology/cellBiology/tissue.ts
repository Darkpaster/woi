import {Cell, CellType} from "./cell.ts";
import {Point} from "../../../../../utils/math/2d.ts";
import {SimulationObject} from "../simulations/simulation.ts";

export class Tissue implements SimulationObject {
    public id: string;
    private cells: Cell[] = [];
    private position: Point;
    private size: number;
    private tissueType: string;
    private color: string;

    constructor(
        id: string,
        position: Point,
        size: number,
        tissueType: string,
        cellType: CellType
    ) {
        this.id = id;
        this.position = position;
        this.size = size;
        this.tissueType = tissueType;

        // Set color based on tissue type
        switch (tissueType) {
            case 'epithelial': this.color = '#FFC0CB'; break; // Pink
            case 'connective': this.color = '#F5DEB3'; break; // Wheat
            case 'muscle': this.color = '#FF6347'; break;     // Tomato
            case 'nervous': this.color = '#B0C4DE'; break;    // LightSteelBlue
            default: this.color = '#DDDDDD'; break;           // Light Gray
        }

        // Generate cells
        this.generateCells(cellType);
    }

    private generateCells(cellType: CellType): void {
        const cellCount = Math.floor(this.size / 10);
        const margin = this.size * 0.9;

        for (let i = 0; i < cellCount; i++) {
            // Calculate grid-like position
            const row = Math.floor(i / Math.sqrt(cellCount));
            const col = i % Math.floor(Math.sqrt(cellCount));

            const spacing = margin / Math.sqrt(cellCount);
            const offset = margin / 2;

            const x = this.position.x - offset + col * spacing;
            const y = this.position.y - offset + row * spacing;

            // Add jitter for more natural placement
            const jitter = spacing * 0.2;
            const jitterX = (Math.random() - 0.5) * jitter;
            const jitterY = (Math.random() - 0.5) * jitter;

            const cellPosition = new Point(x + jitterX, y + jitterY);

            // Create cell
            const cell = new Cell(
                `${this.id}_cell_${i}`,
                cellPosition,
                cellType,
                spacing * 0.4
            );

            this.cells.push(cell);
        }
    }

    public update(deltaTime: number): void {
        // Update all cells
        this.cells.forEach(cell => cell.update(deltaTime));

        // Remove dead cells (no energy)
        this.cells = this.cells.filter(cell => cell.getEnergy() > 0);

        // Tissue-level behaviors could be added here
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Render tissue background
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.globalAlpha = 1.0;

        // Render all cells
        this.cells.forEach(cell => cell.render(ctx));
    }

    public getCells(): Cell[] {
        return this.cells;
    }

    public getTissueType(): string {
        return this.tissueType;
    }
}