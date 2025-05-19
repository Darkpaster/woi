import {SimulationObject} from "../simulations/simulation.ts";
import {RNAStrand, RNAType} from "../molecularBiology/rnaStrand.ts";
import {Point} from "../../../../../../utils/math/2d.ts";
import {Protein} from "../molecularBiology/protein.ts";
import {GeneticEvent, TranslationData} from "../genetics/genetics.ts";

export enum RibosomeState {
    INACTIVE = 'inactive',
    INITIATING = 'initiating',
    ELONGATING = 'elongating',
    TERMINATING = 'terminating'
}

export class Ribosome implements SimulationObject {
    public id: string;
    private position: Point;
    private size: number = 15;
    private color: string = '#8B4513'; // SaddleBrown
    private state: RibosomeState = RibosomeState.INACTIVE;
    private boundRNA: RNAStrand | null = null;
    private currentPosition: number = 0; // Position on mRNA
    private assemblingProtein: string = ''; // Amino acid sequence being built
    private translationSpeed: number = 5; // Codons per second
    private translationTimer: number = 0;
    private cell: any; // Reference to parent cell

    constructor(id: string, position: Point, cell: any) {
        this.id = id;
        this.position = position;
        this.cell = cell;
    }

    public update(deltaTime: number): void {
        // Handle ribosome movement when not bound to mRNA
        if (this.state === RibosomeState.INACTIVE) {
            // Random movement
            const movementSpeed = 1.0;
            this.position = new Point(
                this.position.x + (Math.random() - 0.5) * movementSpeed * deltaTime,
                this.position.y + (Math.random() - 0.5) * movementSpeed * deltaTime
            );

            // Try to find mRNA
            this.findAndBindMRNA();
        } else {
            // Process translation
            this.translateRNA(deltaTime);
        }
    }

    private findAndBindMRNA(): void {
        // This would interact with the cell to find available mRNA
        // Simplified implementation for now

        // In a full implementation, would get all mRNAs in the cell and find nearby ones
        const nearbyRNAs: RNAStrand[] = []; // Would be populated from cell

        // Check if any mRNAs are nearby and bind to one
        for (const rna of nearbyRNAs) {
            if (rna.getType() === RNAType.MESSENGER && rna.isFunctional()) {
                this.bindRNA(rna);
                break;
            }
        }
    }

    public bindRNA(rna: RNAStrand): void {
        if (rna.getType() !== RNAType.MESSENGER) {
            return; // Can only bind to mRNA
        }

        this.boundRNA = rna;
        this.state = RibosomeState.INITIATING;
        this.currentPosition = 0;
        this.assemblingProtein = '';

        // Move ribosome to RNA position
        this.position = new Point(
            rna.getPosition().x,
            rna.getPosition().y
        );
    }

    private translateRNA(deltaTime: number): void {
        if (!this.boundRNA) return;

        // Update translation timer
        this.translationTimer += deltaTime;

        // Only proceed if enough time has passed
        if (this.translationTimer < 1 / this.translationSpeed) {
            return;
        }

        // Reset timer
        this.translationTimer = 0;

        const rnaSequence = this.boundRNA.getSequence();

        switch (this.state) {
            case RibosomeState.INITIATING:
                // Look for start codon (AUG)
                let startIndex = rnaSequence.indexOf('AUG', this.currentPosition);

                if (startIndex !== -1) {
                    this.currentPosition = startIndex;
                    this.assemblingProtein = 'M'; // Methionine
                    this.state = RibosomeState.ELONGATING;
                    this.currentPosition += 3; // Move past start codon
                } else {
                    // No start codon found, release RNA
                    this.releaseRNA();
                }
                break;

            case RibosomeState.ELONGATING:
                // Check if we have enough sequence left to read a codon
                if (this.currentPosition + 2 < rnaSequence.length) {
                    const codon = rnaSequence.substring(
                        this.currentPosition,
                        this.currentPosition + 3
                    );

                    // Check for stop codon
                    if (codon === 'UAA' || codon === 'UAG' || codon === 'UGA') {
                        this.state = RibosomeState.TERMINATING;
                        return;
                    }

                    // Translate codon to amino acid
                    const aminoAcid = this.translateCodon(codon);
                    this.assemblingProtein += aminoAcid;

                    // Move to next codon
                    this.currentPosition += 3;

                    // Update position along the mRNA
                    const progress = this.currentPosition / rnaSequence.length;
                    this.position = new Point(
                        this.boundRNA.getPosition().x + progress * 30,
                        this.boundRNA.getPosition().y
                    );
                } else {
                    // End of RNA reached
                    this.state = RibosomeState.TERMINATING;
                }
                break;

            case RibosomeState.TERMINATING:
                // Complete protein synthesis
                if (this.assemblingProtein.length > 0) {
                    // Create new protein
                    const protein = new Protein(
                        `${this.boundRNA?.id}_protein`,
                        this.assemblingProtein,
                        this.boundRNA?.getOrganism()
                    );

                    // Add to cell
                    if (this.cell && this.cell.addProtein) {
                        this.cell.addProtein(protein);
                    }

                    // Notify about translation event
                    const translationData: TranslationData = {
                        rnaSequence: rnaSequence,
                        protein: protein
                    };

                    EventManager.getInstance().notify(GeneticEvent.TRANSLATION, translationData);
                }

                // Release RNA
                this.releaseRNA();
                break;
        }
    }

    private translateCodon(codon: string): string {
        // Genetic code mapping (simplified)
        const geneticCode: { [key: string]: string } = {
            'UUU': 'F', 'UUC': 'F', 'UUA': 'L', 'UUG': 'L',
            'CUU': 'L', 'CUC': 'L', 'CUA': 'L', 'CUG': 'L',
            'AUU': 'I', 'AUC': 'I', 'AUA': 'I', 'AUG': 'M',
            'GUU': 'V', 'GUC': 'V', 'GUA': 'V', 'GUG': 'V',
            'UCU': 'S', 'UCC': 'S', 'UCA': 'S', 'UCG': 'S',
            'CCU': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
            'ACU': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
            'GCU': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
            'UAU': 'Y', 'UAC': 'Y',
            'CAU': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
            'AAU': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
            'GAU': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
            'UGU': 'C', 'UGC': 'C', 'UGG': 'W',
            'CGU': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
            'AGU': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
            'GGU': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
        };

        return geneticCode[codon] || 'X'; // X for unknown codon
    }

    private releaseRNA(): void {
        this.boundRNA = null;
        this.state = RibosomeState.INACTIVE;
        this.currentPosition = 0;
        this.assemblingProtein = '';
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw the ribosome
        ctx.beginPath();

        // Draw different shapes based on state
        if (this.state === RibosomeState.INACTIVE) {
            // Draw a circle for inactive ribosome
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
        } else {
            // Draw a more complex shape for active ribosome (two subunits)
            ctx.arc(this.position.x - this.size/2, this.position.y, this.size * 0.7, 0, Math.PI * 2); // Small subunit
            ctx.arc(this.position.x + this.size/2, this.position.y, this.size * 0.9, 0, Math.PI * 2); // Large subunit

            // Different color based on state
            switch(this.state) {
                case RibosomeState.INITIATING:
                    ctx.fillStyle = '#A0522D'; // Sienna
                    break;
                case RibosomeState.ELONGATING:
                    ctx.fillStyle = '#CD853F'; // Peru
                    break;
                case RibosomeState.TERMINATING:
                    ctx.fillStyle = '#DEB887'; // BurlyWood
                    break;
                default:
                    ctx.fillStyle = this.color;
            }
        }

        ctx.fill();

        // Draw bound mRNA with codons
        if (this.boundRNA && this.state !== RibosomeState.INACTIVE) {
            this.renderBoundRNA(ctx);
        }

        // Draw assembling protein if in elongation or termination
        if (this.assemblingProtein && (this.state === RibosomeState.ELONGATING || this.state === RibosomeState.TERMINATING)) {
            this.renderAssemblingProtein(ctx);
        }
    }

    private renderBoundRNA(ctx: CanvasRenderingContext2D): void {
        if (!this.boundRNA) return;

        const rnaSequence = this.boundRNA.getSequence();
        const rnaStartX = this.boundRNA.getPosition().x - 50;
        const rnaY = this.boundRNA.getPosition().y + this.size * 2;

        // Draw RNA strand line
        ctx.beginPath();
        ctx.moveTo(rnaStartX, rnaY);
        ctx.lineTo(rnaStartX + rnaSequence.length, rnaY);
        ctx.strokeStyle = '#FFA07A'; // Light Salmon
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight current codon
        if (this.currentPosition < rnaSequence.length) {
            ctx.fillStyle = '#FF6347'; // Tomato
            ctx.fillRect(
                rnaStartX + this.currentPosition - 3,
                rnaY - 5,
                3, // Codon width
                10
            );
        }
    }

    private renderAssemblingProtein(ctx: CanvasRenderingContext2D): void {
        // Draw the assembling protein as a chain of amino acids
        const startX = this.position.x;
        const startY = this.position.y - this.size * 2;
        const radius = 3;

        ctx.fillStyle = '#32CD32'; // Lime Green

        for (let i = 0; i < this.assemblingProtein.length; i++) {
            const x = startX + (i - this.assemblingProtein.length/2) * radius * 2;
            ctx.beginPath();
            ctx.arc(x, startY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw lines connecting amino acids
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(x - radius * 2, startY);
                ctx.lineTo(x, startY);
                ctx.strokeStyle = '#228B22'; // Forest Green
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    public getPosition(): Point {
        return this.position;
    }

    public getSize(): number {
        return this.size;
    }

    public getState(): RibosomeState {
        return this.state;
    }

    public getBoundRNA(): RNAStrand | null {
        return this.boundRNA;
    }

    public getAssemblingProtein(): string {
        return this.assemblingProtein;
    }
}