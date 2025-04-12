import {GeneticEvent, TranscriptionData} from "./genetics.ts";

export enum GeneType {
    STRUCTURAL = 'structural',   // Codes for proteins that form structures
    REGULATORY = 'regulatory',   // Controls expression of other genes
    ENZYMATIC = 'enzymatic',     // Codes for enzymes
    TRANSPORT = 'transport',     // Codes for transport proteins
    RECEPTOR = 'receptor',       // Codes for receptor proteins
    HOUSEKEEPING = 'housekeeping' // Essential for basic cell functions
}

export class Gene {
    private id: string;
    private name: string;
    private startPosition: number;
    private endPosition: number;
    private strand: DNAStrand;
    private type: GeneType;
    private isExpressed: boolean = false;
    private promoterSequence: string;
    private exons: Array<[number, number]> = []; // Start and end positions of exons
    private introns: Array<[number, number]> = []; // Start and end positions of introns

    constructor(
        id: string,
        name: string,
        startPosition: number,
        endPosition: number,
        strand: DNAStrand,
        type: GeneType
    ) {
        this.id = id;
        this.name = name;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.strand = strand;
        this.type = type;
        this.promoterSequence = this.generatePromoterSequence();
        this.initializeExonsAndIntrons();
    }

    private generatePromoterSequence(): string {
        // Simplified promoter sequence generation
        // Real promoters have specific consensus sequences like TATA box
        return "TATAAT"; // Simplified prokaryotic promoter (Pribnow box)
    }

    private initializeExonsAndIntrons(): void {
        // For simplicity, create a basic exon-intron structure
        // In reality, this would be much more complex and gene-specific
        const geneLength = this.endPosition - this.startPosition;

        if (geneLength < 300) {
            // Small gene - single exon
            this.exons.push([this.startPosition, this.endPosition]);
        } else {
            // Create multiple exons and introns
            let currentPos = this.startPosition;
            const numberOfExons = Math.floor(Math.random() * 3) + 2; // 2-4 exons

            for (let i = 0; i < numberOfExons; i++) {
                const exonLength = Math.floor(Math.random() * 200) + 100; // 100-300 bp exons
                const exonEnd = Math.min(currentPos + exonLength, this.endPosition);

                this.exons.push([currentPos, exonEnd]);

                currentPos = exonEnd + 1;

                // Add intron if not at the end
                if (currentPos < this.endPosition && i < numberOfExons - 1) {
                    const intronLength = Math.floor(Math.random() * 500) + 100; // 100-600 bp introns
                    const intronEnd = Math.min(currentPos + intronLength, this.endPosition - 100);

                    this.introns.push([currentPos, intronEnd]);
                    currentPos = intronEnd + 1;
                }
            }
        }
    }

    public transcribe(): RNAStrand {
        // First, extract the DNA sequence for this gene
        const geneSequence = this.strand.getSequence(this.startPosition, this.endPosition);

        // Transcribe to pre-mRNA
        let preRNA = this.createPreMRNA(geneSequence);

        // Process RNA (splice out introns)
        const mRNA = this.spliceRNA(preRNA);

        // Create RNA strand object
        const rnaStrand = new RNAStrand(
            `${this.id}_mRNA`,
            mRNA,
            this.strand.getOrganism()
        );

        // Notify about transcription event
        const transcriptionData: TranscriptionData = {
            geneId: this.id,
            startPosition: this.startPosition,
            endPosition: this.endPosition,
            strand: this.strand,
            rnaSequence: mRNA
        };

        EventManager.getInstance().notify(GeneticEvent.TRANSCRIPTION, transcriptionData);

        return rnaStrand;
    }

    private createPreMRNA(dnaSequence: string): string {
        // Convert DNA to RNA (replace T with U)
        return dnaSequence
            .split('')
            .map(base => base === 'T' ? 'U' : base)
            .join('');
    }

    private spliceRNA(preRNA: string): string {
        // In a real implementation, this would be more complex
        // We would remove introns and join exons

        // For simplicity, let's assume our exons/introns are already mapped to the RNA
        let mRNA = '';

        // Add 5' cap
        mRNA += 'G';

        // Add exons (simplified)
        for (const [start, end] of this.exons) {
            const relativeStart = start - this.startPosition;
            const relativeEnd = end - this.startPosition;

            // Ensure we stay within bounds
            if (relativeStart < 0 || relativeEnd >= preRNA.length) continue;

            mRNA += preRNA.substring(relativeStart, relativeEnd + 1);
        }

        // Add poly-A tail
        mRNA += 'AAAAAAAAAAAAAAAAAAAA';

        return mRNA;
    }

    public express(): void {
        this.isExpressed = true;

        // In a complete implementation, this would:
        // 1. Transcribe the gene to mRNA
        // 2. Translate mRNA to protein
        // 3. Potentially trigger cellular effects based on the protein

        const mRNA = this.transcribe();
        // Translation would happen here, typically in the ribosome
    }

    public repress(): void {
        this.isExpressed = false;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): GeneType {
        return this.type;
    }

    public getExpressed(): boolean {
        return this.isExpressed;
    }

    public getSequence(): string {
        return this.strand.getSequence(this.startPosition, this.endPosition);
    }

    public getStrand(): DNAStrand {
        return this.strand;
    }

    public getExons(): Array<[number, number]> {
        return this.exons;
    }

    public getIntrons(): Array<[number, number]> {
        return this.introns;
    }
}