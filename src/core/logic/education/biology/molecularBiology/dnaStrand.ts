import {Point} from "../../../../../utils/math/2d.ts";
import {BiologicalEntity, EntityType} from "../simulation/biologicalEntity.ts";

export class DNAStrand extends BiologicalEntity {
    private nucleotides: string; // A sequence of A, T, G, C
    private isUnwinding: boolean = false;
    private unwoundPercentage: number = 0;

    constructor(id: string, position: Point, nucleotides: string) {
        super(id, position, EntityType.MOLECULE, 10, '#9370DB'); // Medium purple color
        this.nucleotides = nucleotides;
    }

    public startUnwinding(): void {
        this.isUnwinding = true;
    }

    public stopUnwinding(): void {
        this.isUnwinding = false;
    }

    public update(deltaTime: number): void {
        if (this.isUnwinding && this.unwoundPercentage < 1) {
            this.unwoundPercentage += 0.1 * deltaTime;
            if (this.unwoundPercentage > 1) this.unwoundPercentage = 1;
        } else if (!this.isUnwinding && this.unwoundPercentage > 0) {
            this.unwoundPercentage -= 0.1 * deltaTime;
            if (this.unwoundPercentage < 0) this.unwoundPercentage = 0;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw DNA double helix
        const length = this.nucleotides.length * 5;
        const width = 20;
        const helixRadius = 10;
        const centerX = this.position.x;
        const centerY = this.position.y;

        // Draw the double helix backbone
        for (let strand = 0; strand < 2; strand++) {
            ctx.beginPath();
            for (let i = 0; i <= length; i += 1) {
                const progress = i / length;
                const unwoundPoint = length * this.unwoundPercentage;

                // For unwinding effect
                let currentRadius = helixRadius;
                if (progress * length > unwoundPoint) {
                    currentRadius = helixRadius * (1 - (progress * length - unwoundPoint) / (length - unwoundPoint) * 0.8);
                }

                const angle = progress * Math.PI * 10;
                const x = centerX + Math.sin(angle + (strand ? Math.PI : 0)) * currentRadius;
                const y = centerY - length / 2 + progress * length;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.strokeStyle = strand ? '#0000FF' : '#FF0000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw base pairs
        const baseColors = {
            'A': '#00FF00', // Green for Adenine
            'T': '#FF0000', // Red for Thymine
            'G': '#0000FF', // Blue for Guanine
            'C': '#FFFF00'  // Yellow for Cytosine
        };

        for (let i = 0; i < this.nucleotides.length; i++) {
            const progress = i / this.nucleotides.length;
            const unwoundPoint = this.nucleotides.length * this.unwoundPercentage;

            // Skip drawing base pairs in unwound regions
            if (i > unwoundPoint) {
                const angle = progress * Math.PI * 10;
                const x1 = centerX + Math.sin(angle) * helixRadius;
                const y1 = centerY - length / 2 + progress * length;
                const x2 = centerX + Math.sin(angle + Math.PI) * helixRadius;
                const y2 = centerY - length / 2 + progress * length;

                // Get complementary base
                const base = this.nucleotides[i];
                let complementaryBase = '';
                switch (base) {
                    case 'A': complementaryBase = 'T'; break;
                    case 'T': complementaryBase = 'A'; break;
                    case 'G': complementaryBase = 'C'; break;
                    case 'C': complementaryBase = 'G'; break;
                }

                // Draw base pair line
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Draw base indicators
                ctx.fillStyle = baseColors[base] || '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x1, y1, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = baseColors[complementaryBase] || '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x2, y2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    public getNucleotides(): string {
        return this.nucleotides;
    }

    public getComplementaryStrand(): string {
        return this.nucleotides.split('').map(base => {
            switch (base) {
                case 'A': return 'T';
                case 'T': return 'A';
                case 'G': return 'C';
                case 'C': return 'G';
                default: return 'N'; // For any undefined nucleotides
            }
        }).join('');
    }
}