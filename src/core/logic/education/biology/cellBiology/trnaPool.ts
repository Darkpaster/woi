import {TRNA, TRNAState} from "./trna.ts";
import {Point} from "../../../../../utils/math/2d.ts";
import {SimulationObject} from "../simulation/simulation.ts";

export class TRNAPool implements SimulationObject {
    private id: string;
    private tRNAs: TRNA[] = [];
    private cell: any;
    private aminoacylSynthetases: Map<string, string> = new Map(); // Maps anticodons to amino acids

    constructor(id: string, cell: any) {
        this.id = id;
        this.cell = cell;
        this.initializeAminoacylSynthetases();
        this.createInitialTRNAs();
    }

    private initializeAminoacylSynthetases(): void {
        // Set up the enzymes that charge tRNAs with amino acids
        // For each anticodon, specify which amino acid it gets charged with

        // Example mapping (simplified from actual genetic code)
        this.aminoacylSynthetases.set('AAA', 'F'); // Phenylalanine
        this.aminoacylSynthetases.set('AAG', 'F');
        this.aminoacylSynthetases.set('AAU', 'L'); // Leucine
        this.aminoacylSynthetases.set('AAC', 'L');
        this.aminoacylSynthetases.set('GAA', 'L');
        this.aminoacylSynthetases.set('GAG', 'L');
        this.aminoacylSynthetases.set('GAU', 'L');
        this.aminoacylSynthetases.set('GAC', 'L');
        this.aminoacylSynthetases.set('UAA', 'I'); // Isoleucine
        this.aminoacylSynthetases.set('UAG', 'I');
        this.aminoacylSynthetases.set('UAU', 'I');
        this.aminoacylSynthetases.set('UAC', 'M'); // Methionine
        // And so on for all 20 amino acids...
    }

    private createInitialTRNAs(): void {
        // Create initial set of tRNAs
        const centerX = this.cell.getPosition().x;
        const centerY = this.cell.getPosition().y;
        const radius = this.cell.getSize() * 0.8;

        // Create several tRNAs for each anticodon
        for (const [anticodon, aminoAcid] of this.aminoacylSynthetases.entries()) {
            // Create multiple copies of each tRNA
            const count = 3; // 3 copies of each tRNA type

            for (let i = 0; i < count; i++) {
                // Random position within cell
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * radius;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;

                const tRNA = new TRNA(
                    `tRNA_${anticodon}_${i}`,
                    new Point(x, y),
                    anticodon
                );

                // Randomly charge some tRNAs
                if (Math.random() < 0.5) {
                    tRNA.charge(aminoAcid);
                }

                this.tRNAs.push(tRNA);
            }
        }
    }

    public update(deltaTime: number): void {
        // Update all tRNAs
        this.tRNAs.forEach(tRNA => tRNA.update(deltaTime));

        // Charge uncharged tRNAs
        this.chargeTRNAs(deltaTime);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Render all tRNAs
        this.tRNAs.forEach(tRNA => tRNA.render(ctx));
    }

    private chargeTRNAs(deltaTime: number): void {
        // Randomly charge free tRNAs based on a probability
        const chargeProb = 0.02 * deltaTime; // 2% chance per second

        for (const tRNA of this.tRNAs) {
            if (tRNA.getState() === TRNAState.FREE && Math.random() < chargeProb) {
                const anticodon = tRNA.getAnticodon();
                const aminoAcid = this.aminoacylSynthetases.get(anticodon);

                if (aminoAcid) {
                    tRNA.charge(aminoAcid);
                }
            }
        }
    }

    public findMatchingTRNA(codon: string, preferCharged: boolean = true): TRNA | null {
        // Find a tRNA that matches the given codon
        // First try to find charged tRNAs if preferred

        // We need to reverse complement the codon to get the anticodon
        let anticodon = '';
        for (let i = codon.length - 1; i >= 0; i--) {
            switch (codon[i]) {
                case 'A': anticodon += 'U'; break;
                case 'U': anticodon += 'A'; break;
                case 'G': anticodon += 'C'; break;
                case 'C': anticodon += 'G'; break;
                default: anticodon += 'N';
            }
        }

        // First try to find charged tRNAs
        if (preferCharged) {
            const chargedMatches = this.tRNAs.filter(
                t => t.getAnticodon() === anticodon &&
                    t.getState() === TRNAState.CHARGED
            );

            if (chargedMatches.length > 0) {
                return chargedMatches[0];
            }
        }

        // Then try any free tRNAs
        const freeMatches = this.tRNAs.filter(
            t => t.getAnticodon() === anticodon &&
                (t.getState() === TRNAState.FREE || t.getState() === TRNAState.CHARGED)
        );

        if (freeMatches.length > 0) {
            return freeMatches[0];
        }

        return null;
    }

    public getTRNAs(): TRNA[] {
        return this.tRNAs;
    }

    public getPosition(): Point {
        // Return cell position as this component is cell-wide
        return this.cell.getPosition();
    }

    public getId(): string {
        return this.id;
    }
}