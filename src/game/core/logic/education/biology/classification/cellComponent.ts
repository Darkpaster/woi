import {Nutrients} from "./nutrition.ts";

export enum CellComponentType {
    MEMBRANE = 'membrane',
    NUCLEUS = 'nucleus',
    MITOCHONDRIA = 'mitochondria',
    CHLOROPLAST = 'chloroplast',
    RIBOSOME = 'ribosome',
    VACUOLE = 'vacuole',
    FLAGELLUM = 'flagellum',
    CELL_WALL = 'cellWall',
    PILUS = 'pilus',
    CAPSULE = 'capsule'
}

export interface CellComponentProperty {
    energyCost: number;
    maintenanceCost: number;
    buildTime: number;
    size: number;
}

export abstract class CellComponent {
    protected type: CellComponentType;
    protected properties: CellComponentProperty;
    protected health: number;
    protected efficiency: number;

    constructor(type: CellComponentType, properties: CellComponentProperty) {
        this.type = type;
        this.properties = properties;
        this.health = 100;
        this.efficiency = 1.0;
    }

    public getType(): CellComponentType {
        return this.type;
    }

    public getHealth(): number {
        return this.health;
    }

    public getEfficiency(): number {
        return this.efficiency * (this.health / 100);
    }

    public getProperties(): CellComponentProperty {
        return this.properties;
    }

    public damage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
    }

    public repair(amount: number): void {
        this.health = Math.min(100, this.health + amount);
    }

    public getMaintenanceCost(): number {
        return this.properties.maintenanceCost * (this.health < 50 ? 2 : 1);
    }

    abstract function(nutrients: Nutrients): any;
}
