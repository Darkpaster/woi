/**
 * Базовый класс для всех математических объектов
 */
export abstract class MathObject {
    protected id: string;
    protected name: string;
    protected description?: string;

    constructor(name: string, description?: string) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.description = description;
    }

    getId(): string {
        return this.id;
    }

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