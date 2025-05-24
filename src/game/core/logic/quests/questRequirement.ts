import {PlayerContext} from "./playerContext.ts";
import {QuestRequirementData} from "./quest.ts";

// Тип требования
export enum RequirementType {
    LEVEL = 'LEVEL',
    ITEM = 'ITEM',
    QUEST_COMPLETION = 'QUEST_COMPLETION',
    STAT = 'STAT'
}

export class QuestRequirement {
    public readonly type: RequirementType;
    public readonly description: string;
    public readonly level?: number;
    public readonly itemId?: string;
    public readonly quantity?: number;
    public readonly questId?: string;
    public readonly statName?: string;
    public readonly statValue?: number;

    constructor(data: QuestRequirementData) {
        this.type = data.type;
        this.description = data.description;
        this.level = data.level;
        this.itemId = data.itemId;
        this.quantity = data.quantity;
        this.questId = data.questId;
        this.statName = data.statName;
        this.statValue = data.statValue;
    }

    public isMet(playerContext: PlayerContext): boolean {
        switch (this.type) {
            case RequirementType.LEVEL:
                return playerContext.getStat('level') >= (this.level || 0);

            case RequirementType.ITEM:
                return playerContext.hasItem(this.itemId || '', this.quantity || 0);

            case RequirementType.QUEST_COMPLETION:
                return playerContext.hasCompletedQuest(this.questId || '');

            case RequirementType.STAT:
                return playerContext.getStat(this.statName || '') >= (this.statValue || 0);

            default:
                return false;
        }
    }
}
