import { Vector2D } from "../../../../../../utils/math/2d.ts";
import {Nutrients, NutrientType} from "./nutrition.ts";

export abstract class Food {
    protected position: Vector2D;
    protected nutrients: Nutrients;
    protected size: number;
    protected color: string;
    protected shape: string = 'circle'; // default shape
    protected growthRate: number = 0;
    protected maxSize: number;

    constructor(x: number, y: number, size: number, maxSize: number, nutrients: Nutrients, color: string) {
        this.position = new Vector2D(x, y);
        this.nutrients = nutrients;
        this.size = size;
        this.maxSize = maxSize;
        this.color = color;
    }

    public getPosition(): Vector2D {
        return this.position.clone();
    }

    public getSize(): number {
        return this.size;
    }

    public consume(amount: number): Nutrients {
        // The amount requested is proportional to the size of the food
        const proportionRequested = Math.min(1, amount / this.size);

        // Calculate nutrients based on proportion
        const consumedNutrients = this.nutrients.multiply(proportionRequested);

        // Reduce the size of the food item
        this.size -= Math.min(this.size, amount);

        return consumedNutrients;
    }

    public update(dt: number, environmentConditions: any): void {
        // Basic growth if supported
        if (this.growthRate > 0 && this.size < this.maxSize) {
            // Growth affected by environmental conditions
            let growthFactor = this.calculateGrowthFactor(environmentConditions);
            this.size = Math.min(this.maxSize, this.size + (this.growthRate * growthFactor * dt));
        }
    }

    protected calculateGrowthFactor(environmentConditions: any): number {
        // Default implementation - subclasses can override
        return 1.0;
    }

    public isConsumed(): boolean {
        return this.size <= 0.1; // Threshold for considering food consumed
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;

        switch(this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y - this.size);
                ctx.lineTo(this.position.x - this.size * 0.866, this.position.y + this.size * 0.5);
                ctx.lineTo(this.position.x + this.size * 0.866, this.position.y + this.size * 0.5);
                ctx.closePath();
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(
                    this.position.x - this.size / 2,
                    this.position.y - this.size / 2,
                    this.size,
                    this.size
                );
                break;
            case 'hexagon':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const x = this.position.x + this.size * Math.cos(angle);
                    const y = this.position.y + this.size * Math.sin(angle);
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
        }
    }
}

// src/nutrition/specific-foods/OrganicDebris.ts

export class OrganicDebris extends Food {
    private decompositionRate: number;

    constructor(x: number, y: number, size: number) {
        // Create nutrients rich in organic matter, nitrogen, carbon
        const nutrients = new Nutrients();
        nutrients.addNutrient(NutrientType.ORGANIC_MATTER, size * 10);
        nutrients.addNutrient(NutrientType.NITROGEN, size * 3);
        nutrients.addNutrient(NutrientType.CARBON, size * 8);
        nutrients.addNutrient(NutrientType.PHOSPHORUS, size * 1);

        super(x, y, size, size, nutrients, '#8B4513'); // Brown color
        this.shape = 'irregular';
        this.decompositionRate = 0.01; // 1% per update
    }

    public update(dt: number, environmentConditions: any): void {
        // Organic debris decomposes over time
        // Higher temperature and moisture accelerate decomposition
        const temperatureFactor = Math.max(0.5, Math.min(2, environmentConditions.temperature / 25)); // optimal at 25°C
        const moistureFactor = Math.max(0.2, Math.min(2, environmentConditions.moisture / 60)); // optimal at 60% moisture

        const decompositionAmount = this.size * this.decompositionRate * temperatureFactor * moistureFactor * dt;
        this.size = Math.max(0, this.size - decompositionAmount);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Draw as irregular brown shape
        ctx.fillStyle = this.color;
        ctx.beginPath();

        // Create irregular shape
        const irregularity = 0.4; // How irregular the shape is
        const spikiness = 0.2;    // How spiky the shape is
        const points = 12;        // Number of points in the shape

        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const radius = this.size * (1 + (Math.random() * irregularity * 2 - irregularity) +
                Math.sin(i * spikiness * 5) * spikiness);
            const x = this.position.x + Math.cos(angle) * radius;
            const y = this.position.y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();
    }
}

// src/nutrition/specific-foods/Algae.ts

export class Algae extends Food {
    constructor(x: number, y: number, size: number) {
        // Create nutrients rich in carbohydrates and proteins
        const nutrients = new Nutrients();
        nutrients.addNutrient(NutrientType.CARBOHYDRATE, size * 8);
        nutrients.addNutrient(NutrientType.PROTEIN, size * 5);
        nutrients.addNutrient(NutrientType.WATER, size * 6);

        super(x, y, size, size * 3, nutrients, '#00AA00'); // Green color
        this.shape = 'irregular';
        this.growthRate = 0.02; // 2% growth per update
    }

    protected calculateGrowthFactor(environmentConditions: any): number {
        // Algae growth depends on light, temperature, and water
        const lightFactor = Math.min(2, environmentConditions.light / 50); // Optimal at 50+ light
        const tempFactor = Math.max(0, Math.min(1, 1 - Math.abs(environmentConditions.temperature - 25) / 15)); // Optimal at 25°C
        const waterFactor = environmentConditions.moisture > 90 ? 1 : 0.1; // Needs water

        return lightFactor * tempFactor * waterFactor;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Draw as algae colony - cluster of small green circles
        const baseColor = this.color;

        // Draw multiple small circles to represent algae colony
        const clusterRadius = this.size * 1.5;
        const smallCircleSize = this.size / 3;

        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * clusterRadius;
            const x = this.position.x + Math.cos(angle) * distance;
            const y = this.position.y + Math.sin(angle) * distance;

            // Vary the shade of green slightly
            const colorVariation = Math.floor(Math.random() * 40) - 20;
            const r = Math.max(0, parseInt(baseColor.substr(1, 2), 16) + colorVariation);
            const g = Math.max(0, parseInt(baseColor.substr(3, 2), 16) + colorVariation);
            const b = Math.max(0, parseInt(baseColor.substr(5, 2), 16) + colorVariation);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            ctx.arc(x, y, smallCircleSize * (0.7 + Math.random() * 0.6), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// src/nutrition/specific-foods/Minerals.ts

export class Minerals extends Food {
    constructor(x: number, y: number, size: number) {
        // Create nutrients rich in minerals
        const nutrients = new Nutrients();
        nutrients.addNutrient(NutrientType.NITROGEN, size * 3);
        nutrients.addNutrient(NutrientType.PHOSPHORUS, size * 6);
        nutrients.addNutrient(NutrientType.SULFUR, size * 4);

        super(x, y, size, size, nutrients, '#B0B0B0'); // Gray color
        this.shape = 'crystal';
        this.growthRate = 0; // Minerals don't grow
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Draw as crystalline structure
        ctx.fillStyle = this.color;
        ctx.beginPath();

        // Create crystalline shape
        const points = 6;
        const baseRadius = this.size;

        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const radius = baseRadius * (1 + (i % 2) * 0.5); // Alternating points to create crystal effect
            const x = this.position.x + Math.cos(angle) * radius;
            const y = this.position.y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();

        // Add some internal lines for crystal effect
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < points / 2; i++) {
            const angle1 = (Math.PI * 2 * i) / points;
            const angle2 = (Math.PI * 2 * (i + points / 2)) / points;

            const x1 = this.position.x + Math.cos(angle1) * baseRadius;
            const y1 = this.position.y + Math.sin(angle1) * baseRadius;
            const x2 = this.position.x + Math.cos(angle2) * baseRadius;
            const y2 = this.position.y + Math.sin(angle2) * baseRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}