import {Nutrients, NutrientType} from "./nutrition.ts";
import {CellComponent, CellComponentType} from "./cellComponent.ts";

export class Nucleus extends CellComponent {
    private dnaIntegrity: number;
    private reproductionProgress: number = 0;
    private reproductionThreshold: number = 100;

    constructor(dnaIntegrity: number = 1.0) {
        super(CellComponentType.NUCLEUS, {
            energyCost: 50,
            maintenanceCost: 2.0,
            buildTime: 20,
            size: 4
        });
        this.dnaIntegrity = dnaIntegrity;
    }

    public function(nutrients: Nutrients): { proteinProduction: number, reproductionProgress: number } {
        // Process nitrogen and phosphorus for protein synthesis and DNA replication
        const nitrogen = nutrients.getNutrientAmount(NutrientType.NITROGEN);
        const phosphorus = nutrients.getNutrientAmount(NutrientType.PHOSPHORUS);
        const energy = nutrients.getNutrientAmount(NutrientType.CARBOHYDRATE);

        // Protein production requires nitrogen
        const proteinProductionCapacity = Math.min(nitrogen, energy / 2) * this.getEfficiency();

        // DNA replication requires phosphorus
        const replicationCapacity = Math.min(phosphorus, energy / 3) * this.getEfficiency();

        // Consume resources
        nutrients.removeNutrient(NutrientType.NITROGEN, proteinProductionCapacity);
        nutrients.removeNutrient(NutrientType.PHOSPHORUS, replicationCapacity);
        nutrients.removeNutrient(NutrientType.CARBOHYDRATE,
            proteinProductionCapacity * 2 + replicationCapacity * 3);

        // Add proteins to the cell
        nutrients.addNutrient(NutrientType.PROTEIN, proteinProductionCapacity * this.dnaIntegrity);

        // Update reproduction progress
        this.reproductionProgress += replicationCapacity * this.dnaIntegrity;

        return {
            proteinProduction: proteinProductionCapacity * this.dnaIntegrity,
            reproductionProgress: this.reproductionProgress
        };
    }

    public getDnaIntegrity(): number {
        return this.dnaIntegrity * this.getEfficiency();
    }

    public getReproductionProgress(): number {
        return this.reproductionProgress;
    }

    public canReproduce(): boolean {
        return this.reproductionProgress >= this.reproductionThreshold;
    }

    public resetReproductionProgress(): void {
        this.reproductionProgress = 0;
    }
}