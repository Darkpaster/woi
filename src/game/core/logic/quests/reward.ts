
export interface RewardData {
    id: string;
    type: RewardType;
    amount: number;
    metadata?: Record<string, any>;
}
// Тип награды
export enum RewardType {
    EXPERIENCE = 'EXPERIENCE',
    GOLD = 'GOLD',
    ITEM = 'ITEM',
    REPUTATION = 'REPUTATION'
}

export class Reward {
    public readonly id: string;
    public readonly type: RewardType;
    public readonly amount: number;
    public readonly metadata: Record<string, any>;

    constructor(data: RewardData) {
        this.id = data.id;
        this.type = data.type;
        this.amount = data.amount;
        this.metadata = data.metadata || {};
    }

    public getDisplayText(): string {
        switch (this.type) {
            case RewardType.EXPERIENCE:
                return `+${this.amount} опыта`;
            case RewardType.GOLD:
                return `+${this.amount} золота`;
            case RewardType.ITEM:
                return `${this.id} x${this.amount}`;
            case RewardType.REPUTATION:
                return `+${this.amount} репутации`;
            default:
                return `${this.id}: ${this.amount}`;
        }
    }
}
