import {CellComponent, CellComponentType} from "./classification/cellComponent.ts";
import {Nutrients, NutrientType} from "./classification/nutrition.ts";

export class Flagellum extends CellComponent {
    private movementSpeed: number;

    constructor(movementSpeed: number = 1.0) {
        super(CellComponentType.FLAGELLUM, {
            energyCost: 15,
            maintenanceCost: 1.8,
            buildTime: 8,
            size: 2
        });
        this.movementSpeed = movementSpeed;
    }

    public function(nutrients: Nutrients): number {
        // Convert energy (ATP) to movement
        const energy = nutrients.getNutrientAmount(NutrientType.CARBOHYDRATE);

        // Efficiency based on available energy
        const energyRequired = this.properties.maintenanceCost * 2;
        const efficiencyFactor = Math.min(1, energy / energyRequired);

        // Consume energy
        nutrients.removeNutrient(NutrientType.CARBOHYDRATE, energyRequired * efficiencyFactor);

        // Return movement capability
        return this.movementSpeed * this.getEfficiency() * efficiencyFactor;
    }

    public getMovementSpeed(): number {
        return this.movementSpeed * this.getEfficiency();
    }
}
