export enum NutrientType {
    CARBON = 'carbon',
    NITROGEN = 'nitrogen',
    PHOSPHORUS = 'phosphorus',
    SULFUR = 'sulfur',
    WATER = 'water',
    OXYGEN = 'oxygen',
    SUNLIGHT = 'sunlight',
    ORGANIC_MATTER = 'organicMatter',
    PROTEIN = 'protein',
    LIPID = 'lipid',
    CARBOHYDRATE = 'carbohydrate'
}

export class Nutrients {
    private nutrients: Map<NutrientType, number> = new Map();

    constructor(initialNutrients?: Map<NutrientType, number>) {
        if (initialNutrients) {
            this.nutrients = new Map(initialNutrients);
        } else {
            // Initialize with zero values
            Object.values(NutrientType).forEach(type => {
                this.nutrients.set(type as NutrientType, 0);
            });
        }
    }

    public addNutrient(type: NutrientType, amount: number): void {
        const current = this.nutrients.get(type) || 0;
        this.nutrients.set(type, current + amount);
    }

    public removeNutrient(type: NutrientType, amount: number): number {
        const current = this.nutrients.get(type) || 0;
        const available = Math.min(current, amount);
        this.nutrients.set(type, current - available);
        return available; // Return how much was actually taken
    }

    public getNutrientAmount(type: NutrientType): number {
        return this.nutrients.get(type) || 0;
    }

    public clone(): Nutrients {
        return new Nutrients(new Map(this.nutrients));
    }

    public multiply(factor: number): Nutrients {
        const result = new Nutrients();
        this.nutrients.forEach((value, key) => {
            result.nutrients.set(key, value * factor);
        });
        return result;
    }
}