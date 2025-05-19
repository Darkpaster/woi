import {settings} from "../../game/core/config/settings.ts";

export function scaledTileSize(): number {
    return settings.tileSize * settings.defaultTileScale;
}

/**
 * Базовый класс для всех математических объектов
 */
export abstract class MathObject {
    // get id(): string {
    //     return this._id;
    // }
    // private _id: string;
    protected name: string;
    protected description?: string;

    constructor(name: string, description?: string) {
        // this._id = randomUUID;
        this.name = name;
        this.description = description;
    }

    // getId(): string {
    //     return this._id;
    // }

    getName(): string {
        return this.name;
    }

    getDescription(): string | undefined {
        return this.description;
    }

    setName(name: string): void {
        this.name = name;
    }

    setDescription(description: string): void {
        this.description = description;
    }
}