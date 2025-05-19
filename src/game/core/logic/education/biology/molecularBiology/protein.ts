import {BiologicalEntity, EntityType} from "../simulations/biologicalEntity.ts";
import {Point} from "../../../../../../utils/math/2d.ts";

export class Protein extends BiologicalEntity {
    private aminoAcidSequence: string;
    private foldingState: number = 0; // 0 = primary, 1 = fully folded (tertiary/quaternary)
    private function: string;

    constructor(id: string, position: Point, aminoAcidSequence: string, proteinFunction: string) {
        super(id, position, EntityType.MOLECULE, 8, '#FF6347'); // Tomato color
        this.aminoAcidSequence = aminoAcidSequence;
        this.function = proteinFunction;
    }

    public update(deltaTime: number): void {
        // Implement protein folding over time
        if (this.foldingState < 1) {
            this.foldingState += 0.05 * deltaTime;
            if (this.foldingState > 1) this.foldingState = 1;
        }

        // Random movement
        const movementFactor = 0.5 * (1 - this.foldingState); // Less movement when folded
        this.velocity = new Point(
            (Math.random() - 0.5) * movementFactor,
            (Math.random() - 0.5) * movementFactor
        );

        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.foldingState < 0.3) {
            // Primary structure (chain of amino acids)
            this.renderPrimaryStructure(ctx);
        } else if (this.foldingState < 0.7) {
            // Secondary structure (alpha helices and beta sheets)
            this.renderSecondaryStructure(ctx);
        } else {
            // Tertiary/quaternary structure (fully folded)
            this.renderTertiaryStructure(ctx);
        }
    }

    private renderPrimaryStructure(ctx: CanvasRenderingContext2D): void {
        const length = this.aminoAcidSequence.length;
        const startX = this.position.x - length * 3;
        const y = this.position.y;

        // Draw the amino acid chain
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + length * 6, y);
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw amino acid circles
        for (let i = 0; i < length; i++) {
            const x = startX + i * 6;

            // Different amino acids get different colors
            const charCode = this.aminoAcidSequence.charCodeAt(i) % 4;
            switch (charCode) {
                case 0: ctx.fillStyle = '#FF0000'; break; // Red
                case 1: ctx.fillStyle = '#00FF00'; break; // Green
                case 2: ctx.fillStyle = '#0000FF'; break; // Blue
                case 3: ctx.fillStyle = '#FFFF00'; break; // Yellow
            }

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private renderSecondaryStructure(ctx: CanvasRenderingContext2D): void {
        const centerX = this.position.x;
        const centerY = this.position.y;
        const radius = this.size * 2;

        // Draw alpha helix spiral
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius + angle * 2;

            if (angle === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw beta sheets (simplified as parallel lines)
        const sheetX = centerX - radius * 2;
        const sheetY = centerY - radius;
        const sheetWidth = radius * 4;
        const sheetHeight = radius * 2;

        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(sheetX, sheetY + i * (sheetHeight / 4));
            ctx.lineTo(sheetX + sheetWidth, sheetY + i * (sheetHeight / 4));
            ctx.strokeStyle = '#4682B4'; // Steel blue
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    private renderTertiaryStructure(ctx: CanvasRenderingContext2D): void {
        // Draw a complex globular protein
        const centerX = this.position.x;
        const centerY = this.position.y;

        // Draw main globular structure
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw domain structures
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * this.size;
            const y = centerY + Math.sin(angle) * this.size;

            ctx.fillStyle = '#B22222'; // Firebrick
            ctx.beginPath();
            ctx.arc(x, y, this.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw active site
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(centerX + this.size * 0.5, centerY - this.size * 0.5, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    public getAminoAcidSequence(): string {
        return this.aminoAcidSequence;
    }

    public getFoldingState(): number {
        return this.foldingState;
    }

    public getFunction(): string {
        return this.function;
    }
}