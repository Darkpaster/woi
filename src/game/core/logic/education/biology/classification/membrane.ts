import {CellComponent, CellComponentType} from "./cellComponent.ts";
import {Nutrients} from "./nutrition.ts";

export class Membrane extends CellComponent {
    private permeability: number;
    private strength: number;

    constructor(strength: number = 1.0, permeability: number = 0.7) {
        super(CellComponentType.MEMBRANE, {
            energyCost: 10,
            maintenanceCost: 0.5,
            buildTime: 5,
            size: 1
        });
        this.strength = strength;
        this.permeability = permeability;
    }

    public function(nutrients: Nutrients): { protection: number, absorption: number } {
        // Return protection and absorption capability
        const effectiveEfficiency = this.getEfficiency();
        return {
            protection: this.strength * effectiveEfficiency,
            absorption: this.permeability * effectiveEfficiency
        };
    }

    public getPermeability(): number {
        return this.permeability * this.getEfficiency();
    }

    public getStrength(): number {
        return this.strength * this.getEfficiency();
    }
}
