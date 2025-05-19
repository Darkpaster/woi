import {CellComponent, CellComponentType} from "./cellComponent.ts";
import {Vector, Vector2D} from "../../../../../../utils/math/2d.ts";
import {Flagellum} from "../flagellum.ts";
import {Chloroplast} from "./chloroplast.ts";
import {Nucleus} from "./nucleus.ts";
import {Mitochondria} from "./mitochondria.ts";
import {Membrane} from "./membrane.ts";
import {Nutrients, NutrientType} from "./nutrition.ts";
import {Food} from "./food.ts";
import {Environment, EnvironmentConditions} from "./environment.ts";

export enum CellType {
    PROKARYOTE = 'prokaryote',
    EUKARYOTE_PLANT = 'eukaryotePlant',
    EUKARYOTE_ANIMAL = 'eukaryoteAnimal',
    EUKARYOTE_PROTIST = 'eukaryoteProtist',
    EUKARYOTE_FUNGI = 'eukaryoteFungi'
}

export class Cell {
    private position: Vector2D;
    private direction: number = 0; // Direction in radians
    private components: Map<CellComponentType, CellComponent> = new Map();
    private internalNutrients: Nutrients;
    private cellType: CellType;
    private size: number;
    private energy: number;
    private maxEnergy: number;
    private health: number = 100;
    private age: number = 0;
    private lifespan: number;
    private reproductionCooldown: number = 0;
    private readyToReproduce: boolean = false;

    constructor(
        x: number,
        y: number,
        cellType: CellType,
        size: number = 10,
        lifespan: number = 1000,
        initialComponents: CellComponent[] = []
    ) {
        this.position = new Vector2D(x, y);
        this.cellType = cellType;
        this.size = size;
        this.maxEnergy = size * 10;
        this.energy = this.maxEnergy / 2;
        this.lifespan = lifespan;
        this.internalNutrients = new Nutrients();

        // Add initial components
        initialComponents.forEach(component => {
            this.components.set(component.getType(), component);
        });

        // Ensure cell has a membrane
        if (!this.components.has(CellComponentType.MEMBRANE)) {
            this.components.set(CellComponentType.MEMBRANE, new Membrane());
        }
    }

    public getCellType(): CellType {
        return this.cellType;
    }

    // Add damage method
    public damage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
    }

    public update(dt: number, environment: Environment, foods: Food[]): void {
        // Get environment conditions at current position
        const environmentConditions = environment.getConditionsAt(this.position.x, this.position.y);

        // Age the cell
        this.age += dt;
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown -= dt;
        }

        // Process environment interaction
        this.interactWithEnvironment(environmentConditions, dt);

        // Process food consumption
        this.consumeFood(foods, dt);

        // Process internal cell functions
        this.processInternalFunctions(dt);

        // Move the cell
        this.move(dt);

        // Update health based on energy levels
        this.updateHealth(dt);

        // Check if cell can reproduce
        this.checkReproduction();
    }

    private interactWithEnvironment(conditions: EnvironmentConditions, dt: number): void {
        // Add ambient nutrients based on environment
        this.internalNutrients.addNutrient(NutrientType.OXYGEN, conditions.oxygen * 0.1 * dt);

        // Add light based on environment (for photosynthesis)
        if (this.cellType === CellType.EUKARYOTE_PLANT || this.cellType === CellType.EUKARYOTE_PROTIST) {
            this.internalNutrients.addNutrient(NutrientType.SUNLIGHT, conditions.light * 0.2 * dt);
        }

        // Temperature affects metabolism
        if (conditions.temperature < 5 || conditions.temperature > 40) {
            this.energy -= dt * Math.abs(conditions.temperature - 25) * 0.1;
        }

        // pH affects cell health
        if (conditions.pH < 5 || conditions.pH > 9) {
            const pHdamage = Math.abs(conditions.pH - 7) * 0.5 * dt;
            this.health -= pHdamage;
        }
    }

    private consumeFood(foods: Food[], dt: number): void {
        // Only consume food if cell has membrane
        const membrane = this.components.get(CellComponentType.MEMBRANE) as Membrane;
        if (!membrane) return;

        // Find nearby food
        const nearbyFoods = foods.filter(food =>
            Vector.distance(this.position, food.getPosition()) < this.size + food.getSize()
        );

        if (nearbyFoods.length > 0) {
            // Sort by distance
            nearbyFoods.sort((a, b) =>
                Vector.distance(this.position, a.getPosition()) -
                Vector.distance(this.position, b.getPosition())
            );

            // Try to consume closest food
            const closestFood = nearbyFoods[0];
            const consumeAmount = this.size * 0.5 * dt * membrane.getPermeability();

            const consumedNutrients = closestFood.consume(consumeAmount);

            // Add nutrients to internal store
            Object.values(NutrientType).forEach(type => {
                const amount = consumedNutrients.getNutrientAmount(type as NutrientType);
                if (amount > 0) {
                    this.internalNutrients.addNutrient(type as NutrientType, amount);
                }
            });
        }
    }

    private processInternalFunctions(dt: number): void {
        // Process energy production (mitochondria)
        const mitochondria = this.components.get(CellComponentType.MITOCHONDRIA) as Mitochondria;
        if (mitochondria) {
            const energyProduced = mitochondria.function(this.internalNutrients);
            this.energy = Math.min(this.maxEnergy, this.energy + energyProduced);
        }

        // Process photosynthesis (chloroplast)
        const chloroplast = this.components.get(CellComponentType.CHLOROPLAST) as Chloroplast;
        if (chloroplast) {
            chloroplast.function(this.internalNutrients);
        }

        // Process nucleus functions
        const nucleus = this.components.get(CellComponentType.NUCLEUS) as Nucleus;
        if (nucleus) {
            nucleus.function(this.internalNutrients);
        }

        // Maintenance cost for all components
        let totalMaintenanceCost = 0;
        this.components.forEach(component => {
            totalMaintenanceCost += component.getMaintenanceCost() * dt;
        });

        // Base metabolism cost
        const baseCost = this.size * 0.1 * dt;
        totalMaintenanceCost += baseCost;

        // Deduct energy
        this.energy = Math.max(0, this.energy - totalMaintenanceCost);
    }

    private move(dt: number): void {
        // Movement requires flagellum
        const flagellum = this.components.get(CellComponentType.FLAGELLUM) as Flagellum;
        if (!flagellum) return;

        // Get movement capability from flagellum
        const movementSpeed = flagellum.function(this.internalNutrients);

        // Adjust direction slightly for realistic movement
        this.direction += (Math.random() - 0.5) * 0.5 * dt;

        // Calculate new position
        const moveX = Math.cos(this.direction) * movementSpeed * dt;
        const moveY = Math.sin(this.direction) * movementSpeed * dt;

        this.position.x += moveX;
        this.position.y += moveY;
    }

    private updateHealth(dt: number): void {
        // Energy starvation damages health
        if (this.energy < this.maxEnergy * 0.1) {
            this.health -= dt * 5;
        }

        // Age affects health
        if (this.age > this.lifespan * 0.8) {
            const agingFactor = (this.age - this.lifespan * 0.8) / (this.lifespan * 0.2);
            this.health -= dt * agingFactor * 2;
        }

        // Health regeneration when energy is abundant
        if (this.energy > this.maxEnergy * 0.7 && this.health < 100) {
            this.health = Math.min(100, this.health + dt * 0.5);
        }
    }

    private checkReproduction(): void {
        if (this.reproductionCooldown > 0) return;

        const nucleus = this.components.get(CellComponentType.NUCLEUS) as Nucleus;
        if (!nucleus || !nucleus.canReproduce()) return;

        if (this.energy > this.maxEnergy * 0.7 && this.health > 70) {
            // Cell is ready to reproduce
            this.readyToReproduce = true;
        }
    }

    public reproduce(): Cell | null {
        if (!this.readyToReproduce) return null;

        // Reset reproduction progress
        const nucleus = this.components.get(CellComponentType.NUCLEUS) as Nucleus;
        nucleus.resetReproductionProgress();

        // Create offspring with slight variations
        const childComponents: CellComponent[] = [];
        this.components.forEach(component => {
            // Clone components with possible mutations
            switch(component.getType()) {
                case CellComponentType.MEMBRANE:
                    const membraneOriginal = component as Membrane;
                    childComponents.push(new Membrane(
                        membraneOriginal.getStrength() * this.mutate(0.9, 1.1),
                        membraneOriginal.getPermeability() * this.mutate(0.9, 1.1)
                    ));
                    break;
                case CellComponentType.MITOCHONDRIA:
                    const mitoOriginal = component as Mitochondria;
                    childComponents.push(new Mitochondria(
                        mitoOriginal.getEnergyProductionRate() * this.mutate(0.9, 1.1)
                    ));
                    break;
                case CellComponentType.CHLOROPLAST:
                    const chloroOriginal = component as Chloroplast;
                    childComponents.push(new Chloroplast(
                        chloroOriginal.getPhotosynthesisRate() * this.mutate(0.9, 1.1)
                    ));
                    break;
                case CellComponentType.NUCLEUS:
                    const nucleusOriginal = component as Nucleus;
                    childComponents.push(new Nucleus(
                        nucleusOriginal.getDnaIntegrity() * this.mutate(0.95, 1.05)
                    ));
                    break;
                case CellComponentType.FLAGELLUM:
                    const flagOriginal = component as Flagellum;
                    childComponents.push(new Flagellum(
                        flagOriginal.getMovementSpeed() * this.mutate(0.9, 1.1)
                    ));
                    break;
            }
        });

        // Consume energy for reproduction
        this.energy *= 0.6;
        this.health -= 10;
        this.reproductionCooldown = 50;
        this.readyToReproduce = false;

        // Create child cell with slight position offset
        const offsetX = (Math.random() - 0.5) * this.size * 2;
        const offsetY = (Math.random() - 0.5) * this.size * 2;

        return new Cell(
            this.position.x + offsetX,
            this.position.y + offsetY,
            this.cellType,
            this.size * this.mutate(0.9, 1.05),
            this.lifespan * this.mutate(0.95, 1.05),
            childComponents
        );
    }

    private mutate(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }

    public getPosition(): Vector2D {
        return this.position.clone();
    }

    public getSize(): number {
        return this.size;
    }

    public getHealth(): number {
        return this.health;
    }

    public getEnergy(): number {
        return this.energy;
    }

    public isAlive(): boolean {
        return this.health > 0;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Base cell color depends on type
        let baseColor: string;
        switch(this.cellType) {
            case CellType.PROKARYOTE:
                baseColor = '#9370DB'; // Medium purple
                break;
            case CellType.EUKARYOTE_PLANT:
                baseColor = '#32CD32'; // Lime green
                break;
            case CellType.EUKARYOTE_ANIMAL:
                baseColor = '#FF6347'; // Tomato
                break;
            case CellType.EUKARYOTE_PROTIST:
                baseColor = '#4169E1'; // Royal blue
                break;
            case CellType.EUKARYOTE_FUNGI:
                baseColor = '#F4A460'; // Sandy brown
                break;
            default:
                baseColor = '#888888'; // Gray
        }

        // Adjust color based on health
        const healthFactor = this.health / 100;
        const energyFactor = this.energy / this.maxEnergy;

        // Calculate RGB components
        const baseRGB = this.hexToRgb(baseColor);
        if (!baseRGB) return;

        const r = Math.floor(baseRGB.r * healthFactor);
        const g = Math.floor(baseRGB.g * healthFactor);
        const b = Math.floor(baseRGB.b * healthFactor);

        // Draw cell body
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw cell membrane
        ctx.strokeStyle = `rgba(${r + 30}, ${g + 30}, ${b + 30}, 0.7)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.stroke();

        // Draw organelles
        this.drawOrganelles(ctx);

        // Draw health/energy indicators
        this.drawStatusIndicators(ctx);
    }

    private drawOrganelles(ctx: CanvasRenderingContext2D): void {
        // Draw different organelles based on components

        // Nucleus (if present)
        if (this.components.has(CellComponentType.NUCLEUS)) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Chloroplasts (if present)
        if (this.components.has(CellComponentType.CHLOROPLAST)) {
            ctx.fillStyle = '#00AA00';
            const count = 3;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const x = this.position.x + Math.cos(angle) * this.size * 0.5;
                const y = this.position.y + Math.sin(angle) * this.size * 0.5;
                ctx.beginPath();
                ctx.ellipse(x, y, this.size * 0.25, this.size * 0.15, angle, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Mitochondria (if present)
        if (this.components.has(CellComponentType.MITOCHONDRIA)) {
            ctx.fillStyle = '#FF4500';
            const count = 4;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + 0.4;
                const x = this.position.x + Math.cos(angle) * this.size * 0.35;
                const y = this.position.y + Math.sin(angle) * this.size * 0.35;
                ctx.beginPath();
                ctx.ellipse(x, y, this.size * 0.15, this.size * 0.1, angle + Math.PI/2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Flagellum (if present)
        if (this.components.has(CellComponentType.FLAGELLUM)) {
            ctx.strokeStyle = '#AAAAAA';
            ctx.lineWidth = 2;

            // Draw wavy flagellum in the direction of movement
            ctx.beginPath();
            const startX = this.position.x + Math.cos(this.direction) * this.size;
            const startY = this.position.y + Math.sin(this.direction) * this.size;
            ctx.moveTo(startX, startY);

            const flagellumLength = this.size * 2;
            const waveAmplitude = this.size * 0.3;
            const waveFrequency = 3;

            for (let i = 0; i <= 10; i++) {
                const t = i / 10;
                const waveOffset = Math.sin(t * Math.PI * waveFrequency) * waveAmplitude;

                // Calculate perpendicular direction for wave
                const perpX = Math.cos(this.direction + Math.PI/2) * waveOffset;
                const perpY = Math.sin(this.direction + Math.PI/2) * waveOffset;

                const x = startX + Math.cos(this.direction) * (flagellumLength * t) + perpX;
                const y = startY + Math.sin(this.direction) * (flagellumLength * t) + perpY;

                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    private drawStatusIndicators(ctx: CanvasRenderingContext2D): void {
        // Draw health bar
        const barWidth = this.size * 2;
        const barHeight = 3;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 10;

        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health bar fill
        const healthWidth = (this.health / 100) * barWidth;
        ctx.fillStyle = this.health > 70 ? '#00FF00' : this.health > 30 ? '#FFFF00' : '#FF0000';
        ctx.fillRect(barX, barY, healthWidth, barHeight);

        // Energy bar
        const energyBarY = barY + barHeight + 2;

        // Energy bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, energyBarY, barWidth, barHeight);

        // Energy bar fill
        const energyWidth = (this.energy / this.maxEnergy) * barWidth;
        ctx.fillStyle = '#00AAFF';
        ctx.fillRect(barX, energyBarY, energyWidth, barHeight);
    }

    private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}