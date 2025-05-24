// Типы для различных категорий баффов
export enum BuffType {
    BENEFICIAL = 'beneficial',    // Положительные эффекты
    DETRIMENTAL = 'detrimental', // Отрицательные эффекты (дебаффы)
    NEUTRAL = 'neutral'          // Нейтральные эффекты
}

// Типы эффектов баффов
export enum BuffEffect {
    STAT_MODIFIER = 'stat_modifier',     // Модификация характеристик
    DAMAGE_OVER_TIME = 'damage_over_time', // Урон со временем
    HEAL_OVER_TIME = 'heal_over_time',   // Лечение со временем
    SHIELD = 'shield',                   // Щит
    IMMUNITY = 'immunity',               // Иммунитет
    STUN = 'stun',                      // Оглушение
    SILENCE = 'silence',                // Заглушение
    ROOT = 'root',                      // Корень (обездвиживание)
    CUSTOM = 'custom'                   // Кастомный эффект
}

// Интерфейс для данных баффа с сервера
export interface BuffData {
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    type: BuffType;
    effect: BuffEffect;
    duration: number;        // Длительность в миллисекундах
    startTime: number;       // Время начала (timestamp)
    stackCount?: number;     // Количество стаков
    maxStacks?: number;      // Максимальное количество стаков
    sourceId?: string;       // ID источника баффа (игрок/монстр/предмет)
    value?: number;          // Значение эффекта (урон, хил, модификатор и т.д.)
    metadata?: Record<string, any>; // Дополнительные данные
}

// Базовый класс для баффов
export class Buff {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly iconUrl: string;
    public readonly type: BuffType;
    public readonly effect: BuffEffect;
    public readonly duration: number;
    public readonly startTime: number;
    public readonly maxStacks: number;
    public readonly sourceId?: string;
    public readonly value?: number;
    public readonly metadata: Record<string, any>;

    private _stackCount: number;
    private _isActive: boolean;

    constructor(data: BuffData) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.iconUrl = data.iconUrl || '';
        this.type = data.type;
        this.effect = data.effect;
        this.duration = data.duration;
        this.startTime = data.startTime;
        this.maxStacks = data.maxStacks || 1;
        this.sourceId = data.sourceId;
        this.value = data.value;
        this.metadata = data.metadata || {};

        this._stackCount = Math.max(1, data.stackCount || 1);
        this._isActive = true;
    }

    // Геттеры для инкапсуляции
    get stackCount(): number {
        return this._stackCount;
    }

    get isActive(): boolean {
        return this._isActive && !this.isExpired();
    }

    // Проверка на истечение времени
    public isExpired(): boolean {
        if (this.duration <= 0) return false; // Бесконечный бафф
        return Date.now() >= this.startTime + this.duration;
    }

    // Получение оставшегося времени в миллисекундах
    public getRemainingTime(): number {
        if (this.duration <= 0) return Infinity;
        const remaining = (this.startTime + this.duration) - Date.now();
        return Math.max(0, remaining);
    }

    // Получение оставшегося времени в секундах
    public getRemainingTimeSeconds(): number {
        const remaining = this.getRemainingTime();
        return remaining === Infinity ? Infinity : Math.ceil(remaining / 1000);
    }

    // Получение прогресса (0-1)
    public getProgress(): number {
        if (this.duration <= 0) return 1;
        const elapsed = Date.now() - this.startTime;
        return Math.min(1, elapsed / this.duration);
    }

    // Обновление количества стаков (вызывается при получении данных с сервера)
    public updateStackCount(newCount: number): void {
        this._stackCount = Math.min(Math.max(1, newCount), this.maxStacks);
    }

    // Деактивация баффа
    public deactivate(): void {
        this._isActive = false;
    }

    // Проверка на положительный эффект
    public isBeneficial(): boolean {
        return this.type === BuffType.BENEFICIAL;
    }

    // Проверка на отрицательный эффект
    public isDetrimental(): boolean {
        return this.type === BuffType.DETRIMENTAL;
    }

    // Проверка на возможность стакинга
    public canStack(): boolean {
        return this.maxStacks > 1;
    }

    // Получение отформатированного времени для UI
    public getFormattedRemainingTime(): string {
        const seconds = this.getRemainingTimeSeconds();

        if (seconds === Infinity) return '∞';
        if (seconds < 60) return `${seconds}с`;

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes < 60) {
            return remainingSeconds > 0 ? `${minutes}м ${remainingSeconds}с` : `${minutes}м`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${hours}ч ${remainingMinutes}м`;
    }

    // Создание копии баффа с обновленными данными
    public clone(updates: Partial<BuffData> = {}): Buff {
        return new Buff({
            id: this.id,
            name: this.name,
            description: this.description,
            iconUrl: this.iconUrl,
            type: this.type,
            effect: this.effect,
            duration: this.duration,
            startTime: this.startTime,
            stackCount: this._stackCount,
            maxStacks: this.maxStacks,
            sourceId: this.sourceId,
            value: this.value,
            metadata: this.metadata,
            ...updates
        });
    }

    // Преобразование в объект для сериализации
    public toJSON(): BuffData {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            iconUrl: this.iconUrl,
            type: this.type,
            effect: this.effect,
            duration: this.duration,
            startTime: this.startTime,
            stackCount: this._stackCount,
            maxStacks: this.maxStacks,
            sourceId: this.sourceId,
            value: this.value,
            metadata: this.metadata
        };
    }

    // Статический метод для создания баффа из JSON
    public static fromJSON(data: BuffData): Buff {
        return new Buff(data);
    }
}
