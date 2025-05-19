import {BiologicalEntity, EntityType} from "../simulations/biologicalEntity.ts";
import {CellOrganelle, Organelle} from "./organelle.ts";
import {Protein} from "../molecularBiology/protein.ts";
import {Molecule, MoleculeType} from "../molecularBiology/molecule.ts";
import {Point} from "../../../../../../utils/math/2d.ts";

export enum CellType {
    PROKARYOTIC,  // Bacteria, no nucleus
    EUKARYOTIC,   // Plants, animals, fungi, protists, with nucleus
    PLANT,        // Plant cells with cell wall and chloroplasts
    ANIMAL        // Animal cells
}

export enum CellPhase {
    INTERPHASE_G1,   // Growth phase 1
    INTERPHASE_S,    // DNA Synthesis
    INTERPHASE_G2,   // Growth phase 2
    MITOSIS_PROPHASE,
    MITOSIS_METAPHASE,
    MITOSIS_ANAPHASE,
    MITOSIS_TELOPHASE,
    CYTOKINESIS
}

export class Cell extends BiologicalEntity {
    private cellType: CellType;
    private organelles: Map<CellOrganelle, Organelle[]> = new Map();
    private energy: number = 100;
    private molecules: Molecule[] = [];
    private proteins: Protein[] = [];
    private phase: CellPhase = CellPhase.INTERPHASE_G1;
    private phaseProgress: number = 0;
    private dividing: boolean = false;
    private age: number = 0;
    private maxAge: number;

    constructor(
        id: string,
        position: Point,
        cellType: CellType,
        size: number = 30
    ) {
        // Set cell color based on type
        let color = '#FFFFFF';
        switch (cellType) {
            case CellType.PROKARYOTIC: color = '#A9A9A9'; break; // DarkGray
            case CellType.EUKARYOTIC: color = '#F5DEB3'; break;  // Wheat
            case CellType.PLANT: color = '#90EE90'; break;       // LightGreen
            case CellType.ANIMAL: color = '#FFA07A'; break;      // LightSalmon
        }

        super(id, position, EntityType.CELL, size, color);

        this.cellType = cellType;
        this.maxAge = 100 + Math.random() * 50; // Random max age

        // Initialize organelles based on cell type
        this.initializeOrganelles();
    }

    private initializeOrganelles(): void {
        const nucleusSize = this.size * 0.3;
        const smallOrganelleSize = this.size * 0.15;

        // Create organelles based on cell type
        switch (this.cellType) {
            case CellType.PROKARYOTIC:
                // Prokaryotes have no nucleus or membrane-bound organelles
                this.addOrganelle(CellOrganelle.CELL_MEMBRANE, 1);
                this.addOrganelle(CellOrganelle.RIBOSOME, 8);
                break;

            case CellType.EUKARYOTIC:
                this.addOrganelle(CellOrganelle.NUCLEUS, 1);
                this.addOrganelle(CellOrganelle.MITOCHONDRIA, 4);
                this.addOrganelle(CellOrganelle.ENDOPLASMIC_RETICULUM, 1);
                this.addOrganelle(CellOrganelle.GOLGI_APPARATUS, 1);
                this.addOrganelle(CellOrganelle.LYSOSOME, 3);
                this.addOrganelle(CellOrganelle.CELL_MEMBRANE, 1);
                this.addOrganelle(CellOrganelle.RIBOSOME, 12);
                this.addOrganelle(CellOrganelle.CYTOSKELETON, 1);
                break;

            case CellType.PLANT:
                this.addOrganelle(CellOrganelle.NUCLEUS, 1);
                this.addOrganelle(CellOrganelle.MITOCHONDRIA, 2);
                this.addOrganelle(CellOrganelle.CHLOROPLAST, 6);
                this.addOrganelle(CellOrganelle.ENDOPLASMIC_RETICULUM, 1);
                this.addOrganelle(CellOrganelle.GOLGI_APPARATUS, 1);
                this.addOrganelle(CellOrganelle.VACUOLE, 1); // Large central vacuole
                this.addOrganelle(CellOrganelle.CELL_MEMBRANE, 1);
                this.addOrganelle(CellOrganelle.CELL_WALL, 1);
                this.addOrganelle(CellOrganelle.RIBOSOME, 10);
                this.addOrganelle(CellOrganelle.CYTOSKELETON, 1);
                break;

            case CellType.ANIMAL:
                this.addOrganelle(CellOrganelle.NUCLEUS, 1);
                this.addOrganelle(CellOrganelle.MITOCHONDRIA, 6);
                this.addOrganelle(CellOrganelle.ENDOPLASMIC_RETICULUM, 1);
                this.addOrganelle(CellOrganelle.GOLGI_APPARATUS, 1);
                this.addOrganelle(CellOrganelle.LYSOSOME, 4);
                this.addOrganelle(CellOrganelle.VACUOLE, 2); // Small vacuoles
                this.addOrganelle(CellOrganelle.CELL_MEMBRANE, 1);
                this.addOrganelle(CellOrganelle.RIBOSOME, 15);
                this.addOrganelle(CellOrganelle.CYTOSKELETON, 1);
                break;
        }
    }

    private addOrganelle(type: CellOrganelle, count: number): void {
        if (!this.organelles.has(type)) {
            this.organelles.set(type, []);
        }

        const organelleList = this.organelles.get(type)!;

        for (let i = 0; i < count; i++) {
            // Calculate size based on organelle type
            let size = this.size * 0.15; // Default

            switch (type) {
                case CellOrganelle.NUCLEUS:
                    size = this.size * 0.3;
                    break;
                case CellOrganelle.VACUOLE:
                    if (this.cellType === CellType.PLANT && count === 1) {
                        // Large central vacuole for plant cells
                        size = this.size * 0.4;
                    }
                    break;
                case CellOrganelle.RIBOSOME:
                    size = this.size * 0.05;
                    break;
                case CellOrganelle.CELL_MEMBRANE:
                case CellOrganelle.CELL_WALL:
                case CellOrganelle.CYTOSKELETON:
                    // These aren't rendered as discrete organelles
                    continue;
            }

            // Generate random position inside cell
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (this.size - size) * 0.7;

            const position = new Point(
                this.position.x + Math.cos(angle) * distance,
                this.position.y + Math.sin(angle) * distance
            );

            // Create organelle
            const organelle = new Organelle(
                `${this.id}_${type}_${i}`,
                type,
                position,
                size,
                this
            );

            organelleList.push(organelle);
        }
    }

    public update(deltaTime: number): void {
        // Age the cell
        this.age += deltaTime * 0.1;
        if (this.age >= this.maxAge) {
            // Cell death (apoptosis)
            this.energy = 0;
            return;
        }

        // Cell movement (if not plant)
        if (this.cellType !== CellType.PLANT) {
            const movementSpeed = 5.0 * (this.size / 30) * (this.energy / 100);
            this.velocity = new Point(
                (Math.random() - 0.5) * movementSpeed * deltaTime,
                (Math.random() - 0.5) * movementSpeed * deltaTime
            );

            this.position = this.position.add(this.velocity);
        }

        // Energy metabolism
        this.metabolizeEnergy(deltaTime);

        // Update cell cycle
        this.updateCellCycle(deltaTime);

        // Update all organelles
        for (const [type, organelleList] of this.organelles) {
            for (const organelle of organelleList) {
                organelle.update(deltaTime);
            }
        }

        // Update internal molecules and proteins
        this.molecules.forEach(molecule => molecule.update(deltaTime));
        this.proteins.forEach(protein => protein.update(deltaTime));

        // Remove dead molecules (ones with no energy)
        this.molecules = this.molecules.filter(molecule => molecule.getEnergy() > 0);
    }

    private metabolizeEnergy(deltaTime: number): void {
        // Consume energy over time
        const baseConsumption = 1.0 * deltaTime;

        // Plants produce energy via photosynthesis
        if (this.cellType === CellType.PLANT) {
            // Find chloroplasts
            const chloroplasts = this.organelles.get(CellOrganelle.CHLOROPLAST) || [];

            // Energy production based on number of active chloroplasts
            let energyProduction = 0;
            chloroplasts.forEach(chloroplast => {
                energyProduction += chloroplast.getActivity() * 2.0 * deltaTime;
            });

            this.energy += energyProduction - baseConsumption;
        } else {
            // Consume energy (find glucose molecules and use them)
            const glucoseMolecules = this.molecules.filter(
                molecule => molecule.getMoleculeType() === MoleculeType.GLUCOSE
            );

            if (glucoseMolecules.length > 0) {
                // Remove a glucose molecule
                this.molecules.splice(this.molecules.indexOf(glucoseMolecules[0]), 1);

                // Gain energy
                this.energy += 20;
            } else {
                // Consume energy without glucose
                this.energy -= baseConsumption;
            }

            // Find mitochondria
            const mitochondria = this.organelles.get(CellOrganelle.MITOCHONDRIA) || [];

            // Energy production based on number of active mitochondria
            mitochondria.forEach(mitochondrion => {
                // Cellular respiration
                const energyProduction = mitochondrion.getActivity() * 1.0 * deltaTime;
                this.energy += energyProduction;
            });
        }

        // Ensure energy stays within bounds
        if (this.energy < 0) this.energy = 0;
        if (this.energy > 200) this.energy = 200;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // First, render cell membrane/wall
        if (this.cellType === CellType.PLANT) {
            // Plant cells have cell walls
            ctx.strokeStyle = '#006400'; // DarkGreen
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Cell body
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7; // Semi-transparent
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Cell membrane
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1.0;

        // Render all organelles
        for (const [type, organelleList] of this.organelles) {
            for (const organelle of organelleList) {
                organelle.render(ctx);
            }
        }

        // Render molecules inside the cell
        for (const molecule of this.molecules) {
            molecule.render(ctx);
        }

        // Render proteins inside the cell
        for (const protein of this.proteins) {
            protein.render(ctx);
        }

        // If cell is dividing, show division visualization
        if (this.dividing) {
            this.renderDivision(ctx);
        }

        // Show cell stats
        this.renderCellStats(ctx);
    }

    private renderCellStats(ctx: CanvasRenderingContext2D): void {
        // Energy bar
        const barWidth = this.size * 1.5;
        const barHeight = 3;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 10;

        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Energy level
        const energyWidth = (this.energy / 200) * barWidth;
        ctx.fillStyle = this.energy > 50 ? '#00FF00' : '#FF0000';
        ctx.fillRect(barX, barY, energyWidth, barHeight);

        // Cell phase indicator
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            CellPhase[this.phase].replace('INTERPHASE_', ''),
            this.position.x,
            barY - 5
        );
    }

    private renderDivision(ctx: CanvasRenderingContext2D): void {
        // Visualize cell division
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);

        ctx.beginPath();
        ctx.moveTo(this.position.x - this.size, this.position.y);
        ctx.lineTo(this.position.x + this.size, this.position.y);
        ctx.stroke();

        ctx.setLineDash([]);
    }

    private updateCellCycle(deltaTime: number): void {
        if (this.energy < 30) {
            // Not enough energy to progress in cell cycle
            return;
        }

        // Progress through cell cycle phases
        this.phaseProgress += deltaTime * 0.05;

        if (this.phaseProgress >= 1.0) {
            this.phaseProgress = 0;

            // Move to next phase
            switch (this.phase) {
                case CellPhase.INTERPHASE_G1:
                    this.phase = CellPhase.INTERPHASE_S;
                    break;
                case CellPhase.INTERPHASE_S:
                    this.phase = CellPhase.INTERPHASE_G2;
                    break;
                case CellPhase.INTERPHASE_G2:
                    this.phase = CellPhase.MITOSIS_PROPHASE;
                    this.dividing = true;
                    break;
                case CellPhase.MITOSIS_PROPHASE:
                    this.phase = CellPhase.MITOSIS_METAPHASE;
                    break;
                case CellPhase.MITOSIS_METAPHASE:
                    this.phase = CellPhase.MITOSIS_ANAPHASE;
                    break;
                case CellPhase.MITOSIS_ANAPHASE:
                    this.phase = CellPhase.MITOSIS_TELOPHASE;
                    break;
                case CellPhase.MITOSIS_TELOPHASE:
                    this.phase = CellPhase.CYTOKINESIS;
                    break;
                case CellPhase.CYTOKINESIS:
                    // Complete cell division
                    this.divideCellAndReset();
                    break;
            }
        }
    }

    private divideCellAndReset(): void {
        this.dividing = false;
        this.phase = CellPhase.INTERPHASE_G1;

        // In a full implementation, would create a new cell here and distribute organelles
        // Reset the current cell
        this.energy = this.energy / 2; // Energy divided between parent and daughter

        // For simplicity, we'll just reset the current cell in this demo
    }

    // Methods for interacting with the cell

    public addMolecule(molecule: Molecule): void {
        this.molecules.push(molecule);
    }

    public addProtein(protein: Protein): void {
        this.proteins.push(protein);
    }

    public getCellType(): CellType {
        return this.cellType;
    }

    public getEnergy(): number {
        return this.energy;
    }

    public getPhase(): CellPhase {
        return this.phase;
    }

    public getAge(): number {
        return this.age;
    }
}