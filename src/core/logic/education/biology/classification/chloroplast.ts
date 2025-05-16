import {Nutrients, NutrientType} from "./nutrition.ts";
import {CellComponent, CellComponentType} from "./cellComponent.ts";

export class Chloroplast extends CellComponent {
    private photosynthesisRate: number;

    constructor(photosynthesisRate: number = 1.5) {
        super(CellComponentType.CHLOROPLAST, {
            energyCost: 30,
            maintenanceCost: 1.2,
            buildTime: 15,
            size: 3
        });
        this.photosynthesisRate = photosynthesisRate;
    }

    public function(nutrients: Nutrients): { carbohydrates: number, oxygen: number } {
        // Convert sunlight, water, and carbon dioxide to glucose and oxygen
        const sunlight = nutrients.getNutrientAmount(NutrientType.SUNLIGHT);
        const water = nutrients.getNutrientAmount(NutrientType.WATER);
        const carbon = nutrients.getNutrientAmount(NutrientType.CARBON);

        // Limiting factor approach
        const limitingFactor = Math.min(sunlight / 5, water / 3, carbon / 2);

        // Production based on limiting factor
        const carbsProduced = limitingFactor * this.photosynthesisRate * this.getEfficiency();
        const oxygenProduced = carbsProduced * 0.8; // Oxygen is a byproduct

        // Consume inputs
        nutrients.removeNutrient(NutrientType.SUNLIGHT, limitingFactor * 5);
        nutrients.removeNutrient(NutrientType.WATER, limitingFactor * 3);
        nutrients.removeNutrient(NutrientType.CARBON, limitingFactor * 2);

        // Add outputs to nutrients
        nutrients.addNutrient(NutrientType.CARBOHYDRATE, carbsProduced);
        nutrients.addNutrient(NutrientType.OXYGEN, oxygenProduced);

        return { carbohydrates: carbsProduced, oxygen: oxygenProduced };
    }

    public getPhotosynthesisRate(): number {
        return this.photosynthesisRate * this.getEfficiency();
    }
}
