import {QuestDecision, QuestDecisionData} from "./questDecision.ts";
import {QuestRequirement} from "./questRequirement.ts";
import {Reward, RewardData} from "./reward.ts";
import {QuestRequirementData} from "./quest.ts";
import {PlayerContext} from "./playerContext.ts";

export interface QuestNodeData {
    id: string;
    description: string;
    type: QuestNodeType;
    decisions: QuestDecisionData[];
    requirements: QuestRequirementData[];
    rewards: Record<string, RewardData>;
    isCompleted?: boolean;
    metadata?: Record<string, any>;
}
// Тип узла квеста
export enum QuestNodeType {
    DIALOGUE = 'DIALOGUE',
    BATTLE = 'BATTLE',
    PUZZLE = 'PUZZLE',
    COLLECTION = 'COLLECTION',
    DECISION = 'DECISION'
}


export class QuestNode {
    public readonly id: string;
    public readonly description: string;
    public readonly type: QuestNodeType;
    public readonly decisions: QuestDecision[];
    public readonly requirements: QuestRequirement[];
    public readonly rewards: Map<string, Reward>;
    public readonly metadata: Record<string, any>;
    private _isCompleted: boolean;

    constructor(data: QuestNodeData) {
        this.id = data.id;
        this.description = data.description;
        this.type = data.type;
        this.decisions = data.decisions.map(decision => new QuestDecision(decision));
        this.requirements = data.requirements.map(req => new QuestRequirement(req));
        this.rewards = new Map(
            Object.entries(data.rewards).map(([key, reward]) => [key, new Reward(reward)])
        );
        this.metadata = data.metadata || {};
        this._isCompleted = data.isCompleted || false;
    }

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    public markCompleted(): void {
        this._isCompleted = true;
    }

    public canAccess(playerContext: PlayerContext): boolean {
        return this.requirements.every(req => req.isMet(playerContext));
    }

    public updateDecisionAvailability(playerContext: PlayerContext): void {
        this.decisions.forEach(decision => {
            decision.checkAvailability(playerContext);
        });
    }

    public getAvailableDecisions(): QuestDecision[] {
        return this.decisions.filter(decision => decision.isAvailable);
    }

    public getRewardsList(): Reward[] {
        return Array.from(this.rewards.values());
    }

    public isTerminal(): boolean {
        return this.decisions.length === 0;
    }
}
