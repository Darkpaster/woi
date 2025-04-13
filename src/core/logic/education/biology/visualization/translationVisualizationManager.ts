import { TranslationSystem, TranslationSite } from '../cellBiology/translationSystem';
import { Ribosome, RibosomeState } from '../cellBiology/ribosome';
import { Cell } from '../cellBiology/cell';
import {SimulationObject} from "../simulations/simulation.ts";
import {Point} from "../../../../../utils/math/2d.ts";
import {GeneticEvent} from "../genetics/genetics.ts";

export interface CodonVisualization {
    position: number;
    codon: string;
    aminoAcid: string;
    highlighted: boolean;
}

export class TranslationVisualizationManager implements SimulationObject {
    private id: string;
    private cell: Cell;
    private translationSystem: TranslationSystem;
    private selectedRibosome: Ribosome | null = null;
    private codonVisualizations: CodonVisualization[] = [];
    private showDetails: boolean = false;
    private infoBoxPosition: Point;
    private infoBoxSize: { width: number, height: number } = { width: 200, height: 150 };

    constructor(id: string, cell: Cell, translationSystem: TranslationSystem) {
        this.id = id;
        this.cell = cell;
        this.translationSystem = translationSystem;
        this.infoBoxPosition = new Position(
            cell.getPosition().x + cell.getSize() + 20,
            cell.getPosition().y
        );

        // Subscribe to events
        EventManager.getInstance().subscribe(GeneticEvent.TRANSLATION, this.handleTranslation.bind(this));
    }

    public update(deltaTime: number): void {
        // Check for user interaction to select a ribosome
        // This would be handled by the main simulations loop and event listeners

        // Update codon visualizations if a ribosome is selected
        if (this.selectedRibosome) {
            this.updateCodonVisualizations();
        }
    }

    private updateCodonVisualizations(): void {
        if (!this.selectedRibosome) return;

        const boundRNA = this.selectedRibosome.getBoundRNA();
        if (!boundRNA) {
            this.codonVisualizations = [];
            return;
        }

        const rnaSequence = boundRNA.getSequence();
        const currentPosition = this.selectedRibosome.getState() === RibosomeState.ELONGATING ?
            this.translationSystem.getTranslationSites().get(this.selectedRibosome.id)?.currentPosition || 0 : 0;

        // Create visualization for codons around the current position
        this.codonVisualizations = [];

        // Show 5 codons before and 5 after the current position
        const startCodon = Math.max(0, Math.floor(currentPosition / 3) - 5) * 3;
        const endCodon = Math.min(rnaSequence.length, Math.floor(currentPosition / 3) + 6) * 3;

        for (let i = startCodon; i < endCodon; i += 3) {
            if (i + 2 < rnaSequence.length) {
                const codon = rnaSequence.substring(i, i + 3);
                const aminoAcid = this.translateCodon(codon);

                this.codonVisualizations.push({
                    position: i,
                    codon: codon,
                    aminoAcid: aminoAcid,
                    highlighted: i === Math.floor(currentPosition / 3) * 3
                });
            }
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
            'GGU': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
            'UAA': '*', 'UAG': '*', 'UGA': '*' // Stop codons
        };

        return geneticCode[codon] || 'X'; // X for unknown codon
    }

    public handleTranslation(data: any): void {
        // Handle translation event, possibly show notification or animation
        // Could highlight the newly translated protein
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Render selection highlight if a ribosome is selected
        if (this.selectedRibosome) {
            this.renderSelectionHighlight(ctx);
        }

        // Render info box if details should be shown
        if (this.showDetails) {
            this.renderInfoBox(ctx);
        }
    }

    private renderSelectionHighlight(ctx: CanvasRenderingContext2D): void {
        if (!this.selectedRibosome) return;

        const pos = this.selectedRibosome.getPosition();
        const size = this.selectedRibosome.getSize() + 5;

        // Draw selection circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFF00'; // Yellow
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw line to info box if details shown
        if (this.showDetails) {
            ctx.beginPath();
            ctx.moveTo(pos.x + size, pos.y);
            ctx.lineTo(this.infoBoxPosition.x, this.infoBoxPosition.y + this.infoBoxSize.height / 2);
            ctx.strokeStyle = '#AAAAAA';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    private renderInfoBox(ctx: CanvasRenderingContext2D): void {
        if (!this.selectedRibosome) return;

        const pos = this.infoBoxPosition;
        const size = this.infoBoxSize;

        // Draw info box background
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(pos.x, pos.y, size.width, size.height);

        // Draw border
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y, size.width, size.height);

        // Draw title
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText('Ribosome Details', pos.x + 10, pos.y + 15);

        // Draw state
        ctx.font = '10px Arial';
        ctx.fillText(`State: ${this.selectedRibosome.getState()}`, pos.x + 10, pos.y + 35);

        // Draw protein being assembled
        const protein = this.selectedRibosome.getAssemblingProtein();
        if (protein) {
            ctx.fillText(`Protein: ${protein.length > 15 ? protein.substring(0, 12) + '...' : protein}`,
                pos.x + 10, pos.y + 50);
        }

        // Draw codon table
        if (this.codonVisualizations.length > 0) {
            ctx.fillText('mRNA Codons:', pos.x + 10, pos.y + 70);

            let y = pos.y + 85;
            for (let i = 0; i < Math.min(5, this.codonVisualizations.length); i++) {
                const viz = this.codonVisualizations[i];

                // Highlight current codon
                if (viz.highlighted) {
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                    ctx.fillRect(pos.x + 10, y - 10, size.width - 20, 12);
                    ctx.fillStyle = '#000000';
                }

                ctx.fillText(`${viz.position/3 + 1}: ${viz.codon} → ${viz.aminoAcid}`, pos.x + 10, y);
                y += 12;
            }
        }
    }

    public selectRibosome(ribosome: Ribosome | null): void {
        this.selectedRibosome = ribosome;
        if (ribosome) {
            this.updateCodonVisualizations();
            this.showDetails = true;
        } else {
            this.showDetails = false;
        }
    }

    public toggleDetails(): void {
        this.showDetails = !this.showDetails;
    }

    public getPosition(): Point {
        return this.cell.getPosition();
    }

    public getId(): string {
        return this.id;
    }
}