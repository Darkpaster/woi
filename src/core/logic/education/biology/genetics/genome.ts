import {Gene, GeneType} from "./gene.ts";
import {Chromosome, ChromosomeType} from "./chromosome.ts";
import {DNAStrand} from "../molecularBiology/dnaStrand.ts";
import {Point} from "../../../../../utils/math/2d.ts";
import {Cell} from "../cellBiology/cell.ts";
import {SimulationObject} from "../simulations/simulation.ts";

export enum SpeciesGenome {
    HUMAN = 'human',         // 46 chromosomes (23 pairs)
    MOUSE = 'mouse',         // 40 chromosomes (20 pairs)
    FRUIT_FLY = 'fruitFly',  // 8 chromosomes (4 pairs)
    E_COLI = 'eColi',        // 1 circular chromosome
    YEAST = 'yeast'          // 16 chromosomes
}

export interface GenomeConfiguration {
    species: SpeciesGenome;
    chromosomeCount: number;
    hasSexChromosomes: boolean;
    isHaploid: boolean;
    avgGenesPerChromosome: number;
    mitochondrial: boolean;
}

export class Genome implements SimulationObject {
    public id: string;
    private chromosomes: Chromosome[] = [];
    private species: SpeciesGenome;
    private cell: Cell;
    private position: Point;
    private isHaploid: boolean;
    private geneticTraits: Map<string, any> = new Map();

    constructor(
        id: string,
        position: Point,
        config: GenomeConfiguration,
        cell: Cell
    ) {
        this.id = id;
        this.position = position;
        this.species = config.species;
        this.cell = cell;
        this.isHaploid = config.isHaploid;

        // Initialize chromosomes
        this.initializeChromosomes(config);
    }

    private initializeChromosomes(config: GenomeConfiguration): void {
        const chromosomeCount = this.isHaploid
            ? config.chromosomeCount
            : config.chromosomeCount * 2; // Diploid has pairs

        // Generate autosomal chromosomes
        const autosomalCount = config.hasSexChromosomes
            ? chromosomeCount - 2
            : chromosomeCount;

        for (let i = 0; i < autosomalCount; i++) {
            const chrId = `${this.id}_chr_${i+1}`;
            const chrPos = new Point(
                this.position.x + (Math.random() - 0.5) * 50,
                this.position.y + (Math.random() - 0.5) * 50
            );

            // Create DNA strand for this chromosome
            const dnaLength = 10000 + Math.floor(Math.random() * 90000); // 10k-100k bp
            const dnaStrand = new DNAStrand(
                `${chrId}_dna`,
                this.generateRandomDNA(dnaLength),
                this.cell.getOrganism()
            );

            // Create chromosome
            const chromosome = new Chromosome(
                chrId,
                chrPos,
                ChromosomeType.AUTOSOMAL,
                dnaLength,
                dnaStrand
            );

            // Add genes to chromosome
            this.generateGenes(chromosome, config.avgGenesPerChromosome);

            this.chromosomes.push(chromosome);
        }

        // Add sex chromosomes if needed
        if (config.hasSexChromosomes) {
            // Determine sex (for simplicity, 50% chance of male)
            const isMale = Math.random() > 0.5;

            // Create X chromosome
            const xChrId = `${this.id}_chr_X`;
            const xChrPos = new Point(
                this.position.x + (Math.random() - 0.5) * 50,
                this.position.y + (Math.random() - 0.5) * 50
            );

            const xDnaLength = 155000000; // Approx. human X chromosome length
            const xDnaStrand = new DNAStrand(
                `${xChrId}_dna`,
                this.generateRandomDNA(xDnaLength),
                this.cell.getOrganism()
            );

            const xChromosome = new Chromosome(
                xChrId,
                xChrPos,
                ChromosomeType.SEX_X,
                xDnaLength,
                xDnaStrand
            );

            this.generateGenes(xChromosome, config.avgGenesPerChromosome * 1.2);
            this.chromosomes.push(xChromosome);

            // Create second sex chromosome (X or Y)
            if (isMale) {
                // Y chromosome
                const yChrId = `${this.id}_chr_Y`;
                const yChrPos = new Point(
                    this.position.x + (Math.random() - 0.5) * 50,
                    this.position.y + (Math.random() - 0.5) * 50
                );

                const yDnaLength = 57000000; // Approx. human Y chromosome length
                const yDnaStrand = new DNAStrand(
                    `${yChrId}_dna`,
                    this.generateRandomDNA(yDnaLength),
                    this.cell.getOrganism()
                );

                const yChromosome = new Chromosome(
                    yChrId,
                    yChrPos,
                    ChromosomeType.SEX_Y,
                    yDnaLength,
                    yDnaStrand
                );

                this.generateGenes(yChromosome, config.avgGenesPerChromosome * 0.3);
                this.chromosomes.push(yChromosome);
            } else {
                // Second X chromosome
                const x2ChrId = `${this.id}_chr_X2`;
                const x2ChrPos = new Point(
                    this.position.x + (Math.random() - 0.5) * 50,
                    this.position.y + (Math.random() - 0.5) * 50
                );

                const x2DnaLength = 155000000; // Approx. human X chromosome length
                const x2DnaStrand = new DNAStrand(
                    `${x2ChrId}_dna`,
                    this.generateRandomDNA(x2DnaLength),
                    this.cell.getOrganism()
                );

                const x2Chromosome = new Chromosome(
                    x2ChrId,
                    x2ChrPos,
                    ChromosomeType.SEX_X,
                    x2DnaLength,
                    x2DnaStrand
                );

                this.generateGenes(x2Chromosome, config.avgGenesPerChromosome * 1.2);
                this.chromosomes.push(x2Chromosome);
            }
        }

        // Add mitochondrial DNA if needed
        if (config.mitochondrial) {
            const mtChrId = `${this.id}_chr_mt`;
            const mtChrPos = new Point(
                this.position.x + (Math.random() - 0.5) * 50,
                this.position.y + (Math.random() - 0.5) * 50
            );

            const mtDnaLength = 16569; // Human mitochondrial DNA length
            const mtDnaStrand = new DNAStrand(
                `${mtChrId}_dna`,
                this.generateRandomDNA(mtDnaLength),
                this.cell.getOrganism()
            );

            const mtChromosome = new Chromosome(
                mtChrId,
                mtChrPos,
                ChromosomeType.MITOCHONDRIAL,
                mtDnaLength,
                mtDnaStrand
            );

            this.generateGenes(mtChromosome, 37); // Human mtDNA has 37 genes
            this.chromosomes.push(mtChromosome);
        }
    }

    private generateRandomDNA(length: number): string {
        const bases = ['A', 'T', 'G', 'C'];
        let dnaSequence = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * 4);
            dnaSequence += bases[randomIndex];
        }

        return dnaSequence;
    }

    private generateGenes(chromosome: Chromosome, avgGeneCount: number): void {
        const geneCount = Math.max(1, Math.floor(avgGeneCount + (Math.random() - 0.5) * 5));
        const chromosomeLength = chromosome.getLength();
        const dnaStrand = chromosome.getDNAStrand();

        // Distribute genes along the chromosome
        const geneTypes = Object.values(GeneType);

        for (let i = 0; i < geneCount; i++) {
            // Random gene length between 500 and 10000 base pairs
            const geneLength = 500 + Math.floor(Math.random() * 9500);

            // Random position (avoiding chromosome ends)
            const margin = Math.max(100, chromosomeLength * 0.01);
            const maxStart = chromosomeLength - geneLength - margin;

            if (maxStart <= margin) continue; // Chromosome too small

            const startPosition = margin + Math.floor(Math.random() * (maxStart - margin));
            const endPosition = startPosition + geneLength;

            // Random gene type
            const randomTypeIndex = Math.floor(Math.random() * geneTypes.length);
            const geneType = geneTypes[randomTypeIndex] as GeneType;

            // Create gene
            const geneId = `${chromosome.id}_gene_${i}`;
            const geneName = `Gene_${i}_${geneType.substring(0, 3)}`;

            const gene = new Gene(
                geneId,
                geneName,
                startPosition,
                endPosition,
                dnaStrand,
                geneType
            );

            // Add gene to chromosome
            chromosome.addGene(gene);
        }
    }

    public update(deltaTime: number): void {
        // Update all chromosomes
        this.chromosomes.forEach(chromosome => chromosome.update(deltaTime));

        // Gene expression regulation would happen here
        // This could be based on cell state, external signals, etc.

        // In a more complex simulations, we might:
        // - Update gene expression based on cell signals
        // - Model epigenetic changes
        // - Handle DNA replication during cell cycle
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Render all chromosomes
        this.chromosomes.forEach(chromosome => chromosome.render(ctx));

        // Render genome information
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${this.species} genome (${this.chromosomes.length} chromosomes)`,
            this.position.x,
            this.position.y - 70
        );
    }

    public getChromosomes(): Chromosome[] {
        return this.chromosomes;
    }

    public getSpecies(): SpeciesGenome {
        return this.species;
    }

    public getGeneByName(name: string): Gene | undefined {
        for (const chromosome of this.chromosomes) {
            for (const gene of chromosome.getAllGenes()) {
                if (gene.getName() === name) {
                    return gene;
                }
            }
        }
        return undefined;
    }

    public expressGene(geneId: string): void {
        for (const chromosome of this.chromosomes) {
            const gene = chromosome.getGene(geneId);
            if (gene) {
                gene.express();
                return;
            }
        }
    }

    public repressGene(geneId: string): void {
        for (const chromosome of this.chromosomes) {
            const gene = chromosome.getGene(geneId);
            if (gene) {
                gene.repress();
                return;
            }
        }
    }

    public isHaploidGenome(): boolean {
        return this.isHaploid;
    }
}