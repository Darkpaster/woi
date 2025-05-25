export enum AchievementType {
    COMBAT = 'combat',
    EXPLORATION = 'exploration',
    COLLECTION = 'collection',
    STORY = 'story',
    SOCIAL = 'social',
    CRAFTING = 'crafting'
}

export enum AchievementRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    ELITE = 'elite',
    LEGENDARY = 'legendary',
    GODLIKE = 'godlike'
}

export interface IAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: AchievementType;
    rarity: AchievementRarity;
    isUnlocked: boolean;
    unlockedDate?: Date;
    progress?: number;
    maxProgress?: number;
    isHidden?: boolean;
    reward?: string;
}

export class Achievement implements IAchievement {
    public id: string;
    public name: string;
    public description: string;
    public icon: string;
    public type: AchievementType;
    public rarity: AchievementRarity;
    public isUnlocked: boolean;
    public unlockedDate?: Date;
    public progress: number;
    public maxProgress: number;
    public isHidden: boolean;
    public reward?: string;

    constructor(data: Partial<IAchievement> & { id: string; name: string; description: string }) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.icon = data.icon || '🏆';
        this.type = data.type || AchievementType.STORY;
        this.rarity = data.rarity || AchievementRarity.COMMON;
        this.isUnlocked = data.isUnlocked || false;
        this.unlockedDate = data.unlockedDate;
        this.progress = data.progress || 0;
        this.maxProgress = data.maxProgress || 1;
        this.isHidden = data.isHidden || false;
        this.reward = data.reward;
    }

    public unlock(): void {
        if (!this.isUnlocked) {
            this.isUnlocked = true;
            this.unlockedDate = new Date();
            this.progress = this.maxProgress;
        }
    }

    public updateProgress(value: number): void {
        if (!this.isUnlocked) {
            this.progress = Math.min(value, this.maxProgress);
            if (this.progress >= this.maxProgress) {
                this.unlock();
            }
        }
    }

    public getProgressPercentage(): number {
        return Math.round((this.progress / this.maxProgress) * 100);
    }

    public isCompleted(): boolean {
        return this.isUnlocked;
    }

    public canBeDisplayed(): boolean {
        return !this.isHidden || this.isUnlocked;
    }
}