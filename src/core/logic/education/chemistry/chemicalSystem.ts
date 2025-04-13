import {Pressure, Temperature} from "./types.ts";
import {ChemicalEntity} from "./chemicalEntity.ts";
import {pH} from "./types.ts";

export class ChemicalSystem {
    private entities: Map<string, ChemicalEntity>;
    private temperature: Temperature;
    private pressure: Pressure;
    private pH: pH;
    private volume: number;

    constructor(
        temperature: Temperature = 298.15, // 25°C в Кельвинах
        pressure: Pressure = 101325, // 1 атм в Паскалях
        pH: pH = 7.0,
        volume: number = 1.0 // в литрах
    ) {
        this.entities = new Map<string, ChemicalEntity>();
        this.temperature = temperature;
        this.pressure = pressure;
        this.pH = pH;
        this.volume = volume;
    }

    public addEntity(entity: ChemicalEntity): void {
        this.entities.set(entity.getId(), entity);
    }

    public removeEntity(id: string): boolean {
        return this.entities.delete(id);
    }

    public getEntity(id: string): ChemicalEntity | undefined {
        return this.entities.get(id);
    }

    public getAllEntities(): ChemicalEntity[] {
        return Array.from(this.entities.values());
    }

    public getTemperature(): Temperature {
        return this.temperature;
    }

    public setTemperature(temperature: Temperature): void {
        this.temperature = temperature;
    }

    public getPressure(): Pressure {
        return this.pressure;
    }

    public setPressure(pressure: Pressure): void {
        this.pressure = pressure;
    }

    public getPH(): pH {
        return this.pH;
    }

    public setPH(pH: pH): void {
        this.pH = pH;
    }

    public getVolume(): number {
        return this.volume;
    }

    public setVolume(volume: number): void {
        this.volume = volume;
    }

    public update(deltaTime: number): void {
        for (const entity of this.entities.values()) {
            entity.update(deltaTime);
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        for (const entity of this.entities.values()) {
            if (entity.isVisible()) {
                entity.render(ctx);
            }
        }
    }
}