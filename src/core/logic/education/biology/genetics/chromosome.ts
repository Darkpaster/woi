import {Point} from "../../../../../utils/math/2d.ts";
import {SimulationObject} from "../simulations/simulation.ts";
import {Gene} from "./gene.ts";
import {DNAStrand} from "../molecularBiology/dnaStrand.ts";

export enum ChromosomeType {
    AUTOSOMAL = 'autosomal',
    SEX_X = 'sexX',
    SEX_Y = 'sexY',
    MITOCHONDRIAL = 'mitochondrial'
}

export class Chromosome implements SimulationObject {
    public id: string;
    private position: Point;
    private type: ChromosomeType;
    private length: number;
    private genes: Map<string, Gene> = new Map();
    private dnaStrand: DNAStrand;
    private color: string;
    private size: number = 100; // Default visual size
    private condensed: boolean = false; // Chromosome condensation state
    private centromerePosition: number; // Position of centromere as percentage (0-1)

    constructor(
        id: string,
        position: Point,
        type: ChromosomeType,
        length: number,
        dnaStrand: DNAStrand
    ) {
        this.id = id;
        this.position = position;
        this.type = type;
        this.length = length;
        this.dnaStrand = dnaStrand;
        this.centromerePosition = 0.4 + Math.random() * 0.2; // Between 0.4 and 0.6

        // Set color based on chromosome type
        switch (type) {
            case ChromosomeType.AUTOSOMAL:
                this.color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Random color
                break;
            case ChromosomeType.SEX_X:
                this.color = '#FF00FF'; // Magenta
                break;
            case ChromosomeType.SEX_Y:
                this.color = '#0000FF'; // Blue
                break;
            case ChromosomeType.MITOCHONDRIAL:
                this.color = '#00FF00'; // Green
                break;
        }
    }

    public update(deltaTime: number): void {
        // Update position if chromosome is moving (during cell division)

        // Handle chromosome condensation (during mitosis)
        if (this.condensed) {
            // Condensed state behaviors
        }

        // In a more complex simulations, we could model:
        // - DNA replication
        // - Crossing over during meiosis
        // - Chromosome damage and repair
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.condensed) {
            this.renderCondensedChromosome(ctx);
        } else {
            this.renderExtendedChromosome(ctx);
        }
    }

    private renderCondensedChromosome(ctx: CanvasRenderingContext2D): void {
        // Render chromosome as X-shaped structure (metaphase)
        const armLength = this.size / 2;

        // Calculate centromere position
        const centerX = this.position.x;
        const centerY = this.position.y;

        // Set line properties
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.color;

        // Draw the chromosome arms
        ctx.beginPath();

        // Draw first chromatid
        ctx.moveTo(centerX - armLength, centerY - armLength);
        ctx.lineTo(centerX, centerY);
        ctx.lineTo(centerX - armLength, centerY + armLength);

        // Draw second chromatid
        ctx.moveTo(centerX + armLength, centerY - armLength);
        ctx.lineTo(centerX, centerY);
        ctx.lineTo(centerX + armLength, centerY + armLength);

        ctx.stroke();

        // Draw centromere
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw chromosome ID
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.id, centerX, centerY - armLength - 10);
    }

    private renderExtendedChromosome(ctx: CanvasRenderingContext2D): void {
        // Render chromosome as a curved line (interphase)
        const chrLength = this.size * 1.5;

        // Set line properties
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;

        // Draw chromosome as a wavy line
        ctx.beginPath();

        const amplitude = 15;
        const frequency = 0.05;

        ctx.moveTo(this.position.x - chrLength / 2, this.position.y);

        for (let x = -chrLength / 2; x <= chrLength / 2; x += 1) {
            const y = Math.sin(x * frequency) * amplitude;
            ctx.lineTo(this.position.x + x, this.position.y + y);
        }

        ctx.stroke();

        // Render genes as small markers
        this.renderGenes(ctx);
    }

    private renderGenes(ctx: CanvasRenderingContext2D): void {
        const chrLength = this.size * 1.5;
        const startX = this.position.x - chrLength / 2;

        // Draw each gene as a small colored rectangle
        this.genes.forEach(gene => {
            const geneStartPosition = gene.getExons()[0][0] / this.length;
            const geneEndPosition = gene.getExons()[gene.getExons().length - 1][1] / this.length;

            const geneStartX = startX + geneStartPosition * chrLength;
            const geneLength = (geneEndPosition - geneStartPosition) * chrLength;

            // Draw gene
            ctx.fillStyle = gene.getExpressed() ? '#00FF00' : '#FF0000';
            ctx.fillRect(geneStartX, this.position.y - 4, geneLength, 8);
        });
    }

    public addGene(gene: Gene): void {
        this.genes.set(gene.getId(), gene);
    }

    public getGene(geneId: string): Gene | undefined {
        return this.genes.get(geneId);
    }

    public getAllGenes(): Gene[] {
        return Array.from(this.genes.values());
    }

    public condense(): void {
        this.condensed = true;
    }

    public decondense(): void {
        this.condensed = false;
    }

    public mutate(position: number, mutationEvent: MutationEvent): boolean {
        // Forward mutation to the DNA strand
        return this.dnaStrand.mutate(position, mutationEvent);
    }

    public getDNAStrand(): DNAStrand {
        return this.dnaStrand;
    }

    public getType(): ChromosomeType {
        return this.type;
    }

    public getLength(): number {
        return this.length;
    }
}