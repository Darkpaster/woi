import {Environment} from "./environment.ts";
import {Cell, CellType} from "./cell.ts";
import {Algae, Food, Minerals, OrganicDebris} from "./food.ts";
import {Membrane} from "./membrane.ts";
import {Mitochondria} from "./mitochondria.ts";
import {Nucleus} from "./nucleus.ts";
import {Flagellum} from "../flagellum.ts";
import {Chloroplast} from "./chloroplast.ts";

export class LifeSimulation {
    private environment: Environment;
    private cells: Cell[] = [];
    private foods: Food[] = [];
    private width: number;
    private height: number;
    private elapsedTime: number = 0;

    public addFood(count: number): void {
        this.generateFood(count);
    }

    public adjustEnvironment(property: string, value: number): void {
        // This method would need to communicate with the Environment class
        // Implement a proper method in Environment to adjust global parameters
        switch (property) {
            case 'temperature':
                this.environment.setGlobalTemperature(value);
                break;
            case 'light':
                this.environment.setGlobalLight(value);
                break;
            case 'moisture':
                this.environment.setGlobalMoisture(value);
                break;
        }
    }

    public addCells(type: CellType, count: number, x = Math.random() * this.width,
                    y = Math.random() * this.height): void {
        for (let i = 0; i < count; i++) {

            let newCell: Cell;

            switch (type) {
                case CellType.PROKARYOTE:
                    newCell = new Cell(
                        x, y, CellType.PROKARYOTE, 6, 500,
                        [
                            new Membrane(0.7, 0.9),
                            new Mitochondria(1.5),
                            new Flagellum(0.8)
                        ]
                    );
                    break;

                case CellType.EUKARYOTE_PLANT:
                    newCell = new Cell(
                        x, y, CellType.EUKARYOTE_PLANT, 10, 800,
                        [
                            new Membrane(1.2, 0.6),
                            new Mitochondria(1.2),
                            new Chloroplast(2.0),
                            new Nucleus(1.0)
                        ]
                    );
                    break;

                case CellType.EUKARYOTE_ANIMAL:
                    newCell = new Cell(
                        x, y, CellType.EUKARYOTE_ANIMAL, 12, 600,
                        [
                            new Membrane(0.9, 1.0),
                            new Mitochondria(2.5),
                            new Nucleus(1.0),
                            new Flagellum(1.5)
                        ]
                    );
                    break;

                default:
                    newCell = new Cell(
                        x, y, CellType.PROKARYOTE, 6, 500,
                        [new Membrane(0.7, 0.9)]
                    );
            }

            this.cells.push(newCell);
        }
    }

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.environment = new Environment(width, height);

        this.initialize();
    }

    private initialize(): void {
        // Create initial food sources
        this.generateFood(50);

        // Create initial cells
        this.generateInitialCells();
    }

    private generateFood(count: number): void {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = 2 + Math.random() * 5;

            // Random food type
            const foodType = Math.random();
            if (foodType < 0.4) {
                this.foods.push(new OrganicDebris(x, y, size));
            } else if (foodType < 0.8) {
                this.foods.push(new Algae(x, y, size));
            } else {
                this.foods.push(new Minerals(x, y, size));
            }
        }
    }

    private generateInitialCells(): void {
        // Create initial bacterial cells
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            // Create bacterial cell
            const bacterial = new Cell(
                x, y, CellType.PROKARYOTE, 6, 500,
                [new Membrane(0.7, 0.9),
                    new Mitochondria(1.5),
                    new Flagellum(0.8)
                ]
            );
            this.cells.push(bacterial);
        }

        // Create initial plant cells
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            // Create plant cell
            const plant = new Cell(
                x, y, CellType.EUKARYOTE_PLANT, 10, 800,
                [
                    new Membrane(1.2, 0.6),
                    new Mitochondria(1.2),
                    new Chloroplast(2.0),
                    new Nucleus(1.0)
                ]
            );
            this.cells.push(plant);
        }

        // Create initial animal cells
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            // Create animal cell
            const animal = new Cell(
                x, y, CellType.EUKARYOTE_ANIMAL, 12, 600,
                [
                    new Membrane(0.9, 1.0),
                    new Mitochondria(2.5),
                    new Nucleus(1.0),
                    new Flagellum(1.5)
                ]
            );
            this.cells.push(animal);
        }
    }

    public update(dt: number): void {
        this.elapsedTime += dt;

        // Update environment
        this.environment.update(dt);

        // Update foods
        this.updateFoods(dt);

        // Update cells
        this.updateCells(dt);

        // Manage populations
        this.manageCellPopulation();
        this.manageFoodPopulation();
    }

    private updateFoods(dt: number): void {
        // Update each food item with environmental conditions
        this.foods.forEach(food => {
            const conditions = this.environment.getConditionsAt(
                food.getPosition().x,
                food.getPosition().y
            );
            food.update(dt, conditions);
        });

        // Remove consumed food
        this.foods = this.foods.filter(food => !food.isConsumed());
    }

    private updateCells(dt: number): void {
        // Update cells and collect new cells from reproduction
        const newCells: Cell[] = [];

        this.cells.forEach(cell => {
            // Update cell
            cell.update(dt, this.environment, this.foods);

            // Check for reproduction
            const offspring = cell.reproduce();
            if (offspring) {
                newCells.push(offspring);
            }
        });

        // Add new cells from reproduction
        this.cells = this.cells.concat(newCells);

        // Remove dead cells and create organic debris
        const deadCells = this.cells.filter(cell => !cell.isAlive());
        deadCells.forEach(cell => {
            const pos = cell.getPosition();
            this.foods.push(new OrganicDebris(pos.x, pos.y, cell.getSize() * 0.7));
        });

        // Keep only alive cells
        this.cells = this.cells.filter(cell => cell.isAlive());
    }

    private manageCellPopulation(): void {
        // If cell population gets too large, apply some environmental pressure
        const maxCells = 100;
        if (this.cells.length > maxCells) {
            // Apply some environmental pressure to weaker cells
            this.cells.sort((a, b) => a.getHealth() - b.getHealth());

            // Damage the weakest cells
            for (let i = 0; i < this.cells.length / 10; i++) {
                if (this.cells[i]) {
                    // Simulate harsh conditions for the weakest cells
                    const damageAmount = 10 + Math.random() * 20;
                    this.cells[i].damage(damageAmount);
                }
            }
        }
    }

    private manageFoodPopulation(): void {
        // Generate new food periodically
        if (this.foods.length < 30 && Math.random() < 0.05) {
            this.generateFood(5);
        }

        // Limit total number of food items
        const maxFood = 200;
        if (this.foods.length > maxFood) {
            this.foods = this.foods.slice(0, maxFood);
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw environment
        this.environment.draw(ctx);

        // Draw food
        this.foods.forEach(food => food.draw(ctx));

        // Draw cells
        this.cells.forEach(cell => cell.draw(ctx));

        // Draw stats overlay
        this.drawStats(ctx);
    }

    private drawStats(ctx: CanvasRenderingContext2D): void {
        // Display simulation stats
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 80);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(`Time: ${Math.floor(this.elapsedTime)} seconds`, 20, 30);
        ctx.fillText(`Cells: ${this.cells.length}`, 20, 50);
        ctx.fillText(`Food: ${this.foods.length}`, 20, 70);

        // Count cell types
        const cellTypes = {
            [CellType.PROKARYOTE]: 0,
            [CellType.EUKARYOTE_PLANT]: 0,
            [CellType.EUKARYOTE_ANIMAL]: 0,
            [CellType.EUKARYOTE_PROTIST]: 0,
            [CellType.EUKARYOTE_FUNGI]: 0
        };

        this.cells.forEach(cell => {
            cellTypes[cell.getCellType()]++;
        });

        ctx.fillText(`Bacteria: ${cellTypes[CellType.PROKARYOTE]}`, 120, 30);
        ctx.fillText(`Plants: ${cellTypes[CellType.EUKARYOTE_PLANT]}`, 120, 50);
        ctx.fillText(`Animals: ${cellTypes[CellType.EUKARYOTE_ANIMAL]}`, 120, 70);
    }
}
