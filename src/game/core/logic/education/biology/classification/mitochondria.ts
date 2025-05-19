import {Nutrients, NutrientType} from "./nutrition.ts";
import {CellComponent, CellComponentType} from "./cellComponent.ts";

export class Mitochondria extends CellComponent {
    private energyProductionRate: number;

    constructor(energyProductionRate: number = 2.0) {
        super(CellComponentType.MITOCHONDRIA, {
            energyCost: 25,
            maintenanceCost: 1.5,
            buildTime: 10,
            size: 2
        });
        this.energyProductionRate = energyProductionRate;
    }

    public function(nutrients: Nutrients): number {
        // Convert glucose (carbohydrates) and oxygen to energy (ATP)
        const carbs = nutrients.getNutrientAmount(NutrientType.CARBOHYDRATE);
        const oxygen = nutrients.getNutrientAmount(NutrientType.OXYGEN);

        const carbohydrateConsumed = Math.min(carbs, 5);
        const oxygenConsumed = Math.min(oxygen, carbohydrateConsumed * 2);

        // Limit energy production if oxygen is insufficient
        const efficiency = Math.min(1, oxygenConsumed / (carbohydrateConsumed * 2));

        // Calculate energy produced
        const energyProduced = carbohydrateConsumed * this.energyProductionRate * this.getEfficiency() * efficiency;

        // Consume nutrients
        nutrients.removeNutrient(NutrientType.CARBOHYDRATE, carbohydrateConsumed);
        nutrients.removeNutrient(NutrientType.OXYGEN, oxygenConsumed);

        return energyProduced;
    }

    public getEnergyProductionRate(): number {
        return this.energyProductionRate * this.getEfficiency();
    }
}