import { RNAStrand, RNAType } from '../molecularBiology/rnaStrand';
import {SimulationObject} from "../simulations/simulation.ts";
import {Cell} from "./cell.ts";
import {Ribosome} from "./ribosome.ts";
import {GeneticEvent} from "../genetics/genetics.ts";

export class TranslationComplexManager implements SimulationObject {
    private id: string;
    private cell: Cell;
    private ribosomes: Ribosome[] = [];
    private mRNAs: RNAStrand[] = [];
    private ribosomeSpawnInterval: number = 5; // Seconds between spawning ribosomes
    private ribosomeSpawnTimer: number = 0;
    private maxRibosomes: number = 10;

    constructor(id: string, cell: Cell) {
        this.id = id;
        this.cell = cell;

        // Subscribe to events
        EventManager.getInstance().subscribe(GeneticEvent.TRANSCRIPTION, this.handleTranscription.bind(this));
    }

    public update(deltaTime: number): void {
        // Update all ribosomes
        this.ribosomes.forEach(ribosome => ribosome.update(deltaTime));

        // Manage ribosome population
        this.manageRibosomePopulation(deltaTime);

        // Update mRNA list from cell
        this.updateMRNAList();

        // Assign free mRNAs to inactive ribosomes
        this.assignMRNAsToRibosomes();
    }

    private manageRibosomePopulation(deltaTime: number): void {
        // Create new ribosomes based on cell needs and energy
        this.ribosomeSpawnTimer += deltaTime;

        // Only spawn if we're under the cap and enough time has passed
        if (this.ribosomes.length < this.maxRibosomes && this.ribosomeSpawnTimer >= this.ribosomeSpawnInterval) {
            this.ribosomeSpawnTimer = 0;
            this.createNewRibosome();
        }
    }

    private createNewRibosome(): void {
        // Create a new ribosome at a random location in the cell
        const centerX = this.cell.getPosition().x;
        const centerY = this.cell.getPosition().y;
        const radius = this.cell.getSize() * 0.6; // Within cell bounds

        // Random position within cell
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        const ribosome = new Ribosome(
            `ribosome_${this.ribosomes.length + 1}`,
            new Position(x, y),
            this.cell
        );

        this.ribosomes.push(ribosome);

        // Notify about ribosome creation
        EventManager.getInstance().notify(GeneticEvent.RIBOSOME_CREATED, { ribosome });
    }

    private updateMRNAList(): void {
        // Get updated list of mRNAs from cell
        // In a real implementation, would get from cell components
        this.mRNAs = this.cell.getRNAs().filter(rna => rna.getType() === RNAType.MESSENGER);
    }

    private assignMRNAsToRibosomes(): void {
        // Find inactive ribosomes
        const inactiveRibosomes = this.ribosomes.filter(
            r => r.getState() === 'inactive'
        );

        // Find unbound mRNAs
        const boundRNAs = new Set(
            this.ribosomes
                .map(r => r.getBoundRNA())
                .filter(rna => rna !== null)
                .map(rna => rna?.id)
        );

        const unboundMRNAs = this.mRNAs.filter(
            rna => !boundRNAs.has(rna.id) && rna.isFunctional()
        );

        // Assign mRNAs to free ribosomes
        let mRNAIndex = 0;
        for (const ribosome of inactiveRibosomes) {
            if (mRNAIndex >= unboundMRNAs.length) break;

            const mRNA = unboundMRNAs[mRNAIndex++];
            ribosome.bindRNA(mRNA);
        }
    }

    public handleTranscription(data: any): void {
        // Handle new mRNA creation event
        if (data && data.rna && data.rna.getType() === RNAType.MESSENGER) {
            // New mRNA is available for translation
            this.mRNAs.push(data.rna);
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Render each ribosome
        this.ribosomes.forEach(ribosome => ribosome.render(ctx));
    }

    public getRibosomes(): Ribosome[] {
        return this.ribosomes;
    }

    public getId(): string {
        return this.id;
    }

    public getPosition(): Position {
        // Return cell position as this component is cell-wide
        return this.cell.getPosition();
    }
}