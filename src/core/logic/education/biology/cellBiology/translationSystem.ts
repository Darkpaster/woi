import { RNAStrand, RNAType } from '../molecularBiology/rnaStrand';
import {Ribosome} from "./ribosome.ts";
import {TRNA} from "./trna.ts";
import {SimulationObject} from "../simulation/simulation.ts";
import {Cell} from "./cell.ts";
import {TRNAPool} from "./trnaPool.ts";
import {GeneticEvent} from "../genetics/genetics.ts";

export interface TranslationSite {
    ribosome: Ribosome;
    mRNA: RNAStrand;
    currentPosition: number;
    boundTRNA: TRNA | null;
    eef1Complex: boolean; // Elongation factor 1
    eef2Complex: boolean; // Elongation factor 2
    amioacylTRNA: TRNA | null;
}

export class TranslationSystem implements SimulationObject {
    private id: string;
    private cell: Cell;
    private ribosomes: Ribosome[] = [];
    private tRNAPool: TRNAPool;
    private translationSites: Map<string, TranslationSite> = new Map();
    private aaSynthetaseEnergy: number = 100; // ATP for charging tRNAs
    private elongationFactorEnergy: number = 100; // GTP for elongation factors

    constructor(id: string, cell: Cell) {
        this.id = id;
        this.cell = cell;
        this.tRNAPool = new TRNAPool(`${id}_tRNAPool`, cell);

        // Subscribe to events
        EventManager.getInstance().subscribe(GeneticEvent.RIBOSOME_CREATED, this.handleRibosomeCreated.bind(this));
    }

    public update(deltaTime: number): void {
        // Update tRNA pool
        this.tRNAPool.update(deltaTime);

        // Update all ribosomes
        this.ribosomes.forEach(ribosome => ribosome.update(deltaTime));

        // Process active translation sites
        this.processTranslationSites(deltaTime);

        // Replenish energy (simplified metabolism)
        this.replenishEnergy(deltaTime);
    }

    private processTranslationSites(deltaTime: number): void {
        // Process each translation site
        for (const [id, site] of this.translationSites.entries()) {
            const ribosome = site.ribosome;

            // Only process if ribosome is in elongation state
            if (ribosome.getState() !== RibosomeState.ELONGATING) continue;

            const rnaSequence = site.mRNA.getSequence();
            const currentPosition = ribosome.getBoundRNA() ?
                ribosome.getPosition().x - site.mRNA.getPosition().x : 0;

            // 1. Get current codon
            if (currentPosition + 2 < rnaSequence.length) {
                const codon = rnaSequence.substring(
                    currentPosition,
                    currentPosition + 3
                );

                // 2. If no tRNA bound, find matching tRNA
                if (!site.boundTRNA && this.elongationFactorEnergy > 5) {
                    // Find appropriate tRNA
                    const tRNA = this.tRNAPool.findMatchingTRNA(codon, true);

                    if (tRNA) {
                        // Bind tRNA to ribosome
                        const ribosomePos = ribosome.getPosition();
                        tRNA.bindToRibosome(ribosome, new Position(
                            ribosomePos.x,
                            ribosomePos.y
                        ));

                        site.boundTRNA = tRNA;

                        // Use elongation factor energy (GTP)
                        this.elongationFactorEnergy -= 5;

                        // Set EF1 complex active
                        site.eef1Complex = true;
                    }
                }
                // 3. If tRNA bound and EF1 active, activate EF2
                else if (site.boundTRNA && site.eef1Complex && this.elongationFactorEnergy > 5) {
                    site.eef1Complex = false;
                    site.eef2Complex = true;

                    // Use more elongation factor energy (GTP)
                    this.elongationFactorEnergy -= 5;
                }
                // 4. If EF2 active, add amino acid to peptide and release tRNA
                else if (site.boundTRNA && site.eef2Complex) {
                    // Add amino acid to protein
                    const aminoAcid = site.boundTRNA.getAminoAcid();

                    if (aminoAcid) {
                        // Discharge tRNA
                        site.boundTRNA.discharge();

                        // Move tRNA away from ribosome
                        site.boundTRNA.releaseFromRibosome();

                        // Clear site
                        site.boundTRNA = null;
                        site.eef1Complex = false;
                        site.eef2Complex = false;

                        // Move ribosome to next codon
                        // This is handled by the ribosome itself
                    }
                }
            }
        }
    }

    private replenishEnergy(deltaTime: number): void {
        // Simplistic energy metabolism
        const replenishRate = 2 * deltaTime; // ATP/GTP per second

        this.aaSynthetaseEnergy = Math.min(100, this.aaSynthetaseEnergy + replenishRate);
        this.elongationFactorEnergy = Math.min(100, this.elongationFactorEnergy + replenishRate);
    }

    public handleRibosomeCreated(data: any): void {
        if (data && data.ribosome) {
            this.ribosomes.push(data.ribosome);

            // Create a translation site for this ribosome
            this.translationSites.set(data.ribosome.id, {
                ribosome: data.ribosome,
                mRNA: null as any, // Will be populated when ribosome binds to mRNA
                currentPosition: 0,
                boundTRNA: null,
                eef1Complex: false,
                eef2Complex: false,
                amioacylTRNA: null
            });
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Render tRNA pool
        this.tRNAPool.render(ctx);

        // Render translation sites
        this.renderTranslationSites(ctx);

        // Render energy levels
        this.renderEnergyLevels(ctx);
    }

    private renderTranslationSites(ctx: CanvasRenderingContext2D): void {
        // Visualize active translation sites
        for (const [id, site] of this.translationSites.entries()) {
            if (site.ribosome.getState() === RibosomeState.ELONGATING) {
                const pos = site.ribosome.getPosition();

                // Draw connection lines for active factors
                if (site.eef1Complex) {
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(pos.x + 15, pos.y + 10);
                    ctx.strokeStyle = '#FF4500'; // OrangeRed
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Draw EF1 as small circle
                    ctx.beginPath();
                    ctx.arc(pos.x + 15, pos.y + 10, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#FF4500';
                    ctx.fill();
                    ctx.fillText('EF1', pos.x + 10, pos.y + 20);
                }

                if (site.eef2Complex) {
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(pos.x - 15, pos.y + 10);
                    ctx.strokeStyle = '#4169E1'; // RoyalBlue
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Draw EF2 as small circle
                    ctx.beginPath();
                    ctx.arc(pos.x - 15, pos.y + 10, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#4169E1';
                    ctx.fill();
                    ctx.fillText('EF2', pos.x - 20, pos.y + 20);
                }
            }
        }
    }

    private renderEnergyLevels(ctx: CanvasRenderingContext2D): void {
        const cellPos = this.cell.getPosition();
        const x = cellPos.x - 50;
        const y = cellPos.y - this.cell.getSize() - 20;

        // Draw energy bars
        ctx.fillStyle = '#DDDDDD';
        ctx.fillRect(x, y, 100, 5); // ATP bar background
        ctx.fillRect(x, y + 8, 100, 5); // GTP bar background

        // Fill with current energy levels
        ctx.fillStyle = '#FFFF00'; // Yellow for ATP
        ctx.fillRect(x, y, this.aaSynthetaseEnergy, 5);

        ctx.fillStyle = '#00FF00'; // Green for GTP
        ctx.fillRect(x, y + 8, this.elongationFactorEnergy, 5);

        // Labels
        ctx.font = '8px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('ATP', x - 20, y + 5);
        ctx.fillText('GTP', x - 20, y + 13);
    }

    public getTRNAPool(): TRNAPool {
        return this.tRNAPool;
    }

    public getRibosomes(): Ribosome[] {
        return this.ribosomes;
    }

    public getTranslationSites(): Map<string, TranslationSite> {
        return this.translationSites;
    }

    public getPosition(): Position {
        return this.cell.getPosition();
    }

    public getId(): string {
        return this.id;
    }
}