import {Point} from "../../../../../utils/math/2d.ts";
import {Protein} from "./protein.ts";
import {SimulationObject} from "../simulation/simulation.ts";

export enum RNAType {
    MESSENGER = 'mRNA',
    TRANSFER = 'tRNA',
    RIBOSOMAL = 'rRNA',
    MICRO = 'miRNA',
    SMALL_NUCLEAR = 'snRNA',
    SMALL_INTERFERING = 'siRNA'
}

export class RNAStrand implements SimulationObject {
    public id: string;
    private sequence: string;
    private type: RNAType;
    private organism: Organism;
    private position: Point = new Point(0, 0);
    private size: number = 10;
    private color: string = '#88FF88'; // Light green
    private age: number = 0;
    private maxAge: number = 100; // Lifespan before degradation
    private isCapped: boolean = false;
    private isPolyadenylated: boolean = false;

    constructor(
        id: string,
        sequence: string,
        organism: Organism,
        type: RNAType = RNAType.MESSENGER
    ) {
        this.id = id;
        this.sequence = sequence;
        this.organism = organism;
        this.type = type;

        // Set position randomly near cell nucleus
        if (organism && organism.getPosition()) {
            this.position = new Point(
                organism.getPosition().x + (Math.random() - 0.5) * 30,
                organism.getPosition().y + (Math.random() - 0.5) * 30
            );
        }

        // Set properties based on RNA type
        switch (type) {
            case RNAType.MESSENGER:
                this.color = '#88FF88'; // Light green
                this.maxAge = 100;
                break;
            case RNAType.TRANSFER:
                this.color = '#FFFF88'; // Light yellow
                this.size = 8;
                this.maxAge = 200;
                break;
            case RNAType.RIBOSOMAL:
                this.color = '#FF8888'; // Light red
                this.size = 15;
                this.maxAge = 300;
                break;
            case RNAType.MICRO:
            case RNAType.SMALL_NUCLEAR:
            case RNAType.SMALL_INTERFERING:
                this.color = '#88FFFF'; // Light cyan
                this.size = 6;
                this.maxAge = 150;
                break;
        }

        // Process the RNA if it's mRNA
        if (type === RNAType.MESSENGER) {
            this.processMRNA();
        }
    }

    private processMRNA(): void {
        // Add 5' cap if not present
        if (!this.sequence.startsWith('G')) {
            this.sequence = 'G' + this.sequence;
        }
        this.isCapped = true;

        // Add poly-A tail if not present
        if (!this.sequence.endsWith('AAAAAAAAAAAAAAAAAAAA')) {
            this.sequence = this.sequence + 'AAAAAAAAAAAAAAAAAAAA';
        }
        this.isPolyadenylated = true;
    }

    public update(deltaTime: number): void {
        // Age the RNA
        this.age += deltaTime * 0.1;

        // RNA movement
        const movementSpeed = 1.0;
        this.position = new Point(
            this.position.x + (Math.random() - 0.5) * movementSpeed * deltaTime,
            this.position.y + (Math.random() - 0.5) * movementSpeed * deltaTime
        );

        // Degrade RNA over time
        if (this.age >= this.maxAge) {
            // RNA degradation
            // In a complete implementation, this would remove the RNA from the simulation
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw RNA as a small chain
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        const length = Math.min(this.sequence.length, 100); // Cap length for visualization
        const scale = 0.5;

        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);

        // Draw a curvy line
        for (let i = 1; i < length; i++) {
            const segment = i / length;
            const amplitude = 5;
            const frequency = 10;

            const x = this.position.x + segment * this.size * scale * length;
            const y = this.position.y + Math.sin(segment * frequency) * amplitude;

            ctx.lineTo(x, y);
        }

        ctx.stroke();

        // Draw bases as small dots along the line
        ctx.fillStyle = '#FFFFFF';

        for (let i = 0; i < Math.min(this.sequence.length, 20); i++) {
            const segment = i / Math.min(this.sequence.length, 20);
            const x = this.position.x + segment * this.size * scale * length;
            const y = this.position.y + Math.sin(segment * 10) * 5;

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label RNA type
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type, this.position.x, this.position.y - 10);
    }

    public translate(): Protein | null {
        if (this.type !== RNAType.MESSENGER) {
            return null; // Only mRNA can be translated
        }

        // Find start codon
        const startIndex = this.sequence.indexOf('AUG');

        if (startIndex === -1) {
            return null; // No start codon found
        }

        let proteinSequence = '';
        let currentIndex = startIndex;

        // Translate codons until stop codon or end of sequence
        while (currentIndex + 2 < this.sequence.length) {
            const codon = this.sequence.substring(currentIndex, currentIndex + 3);

            // Check for stop codons
            if (codon === 'UAA' || codon === 'UAG' || codon === 'UGA') {
                break;
            }

            // Translate codon to amino acid
            const aminoAcid = this.translateCodon(codon);
            proteinSequence += aminoAcid;

            // Move to next codon
            currentIndex += 3;
        }

        if (proteinSequence.length === 0) {
            return null; // No protein produced
        }

        // Create new protein
        return new Protein(
            `${this.id}_protein`,
            proteinSequence,
            this.organism
        );
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
            'UAU': 'Y', 'UAC': 'Y', 'UAA': '*', 'UAG': '*',
            'CAU': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
            'AAU': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
            'GAU': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
            'UGU': 'C', 'UGC': 'C', 'UGA': '*', 'UGG': 'W',
            'CGU': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
            'AGU': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
            'GGU': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
        };

        return geneticCode[codon] || 'X'; // 'X' for unknown codons
    }

    public getSequence(): string {
        return this.sequence;
    }

    public getType(): RNAType {
        return this.type;
    }

    public getOrganism(): Organism {
        return this.organism;
    }

    public getPosition(): Point {
        return this.position;
    }

    public setPosition(position: Point): void {
        this.position = position;
    }

    public getAge(): number {
        return this.age;
    }

    public isFunctional(): boolean {
        return this.age < this.maxAge;
    }

    // RNA processing functions

    public addCap(): void {
        if (!this.isCapped) {
            this.sequence = 'G' + this.sequence;
            this.isCapped = true;
        }
    }

    public addPolyATail(): void {
        if (!this.isPolyadenylated) {
            this.sequence = this.sequence + 'AAAAAAAAAAAAAAAAAAAA';
            this.isPolyadenylated = true;
        }
    }

    public splice(introns: Array<[number, number]>): void {
        // Sort introns in reverse order to remove from end to beginning
        const sortedIntrons = [...introns].sort((a, b) => b[0] - a[0]);

        // Remove each intron
        for (const [start, end] of sortedIntrons) {
            if (start >= 0 && end < this.sequence.length && start < end) {
                this.sequence =
                    this.sequence.substring(0, start) +
                    this.sequence.substring(end + 1);
            }
        }
    }
}