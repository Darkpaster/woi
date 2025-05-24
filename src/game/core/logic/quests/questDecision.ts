import {QuestRequirementData} from "./quest.ts";
import {QuestRequirement} from "./questRequirement.ts";
import {PlayerContext} from "./playerContext.ts";


export interface QuestDecisionData {
    id: string;
    text: string;
    nextNodeId: string;
    isAvailable?: boolean;
    requirements?: QuestRequirementData[];
}


export class QuestDecision {
    public readonly id: string;
    public readonly text: string;
    public readonly nextNodeId: string;
    public readonly requirements: QuestRequirement[];
    private _isAvailable: boolean;

    constructor(data: QuestDecisionData) {
        this.id = data.id;
        this.text = data.text;
        this.nextNodeId = data.nextNodeId;
        this.requirements = (data.requirements || []).map(req => new QuestRequirement(req));
        this._isAvailable = data.isAvailable !== false;
    }

    get isAvailable(): boolean {
        return this._isAvailable;
    }

    public checkAvailability(playerContext: PlayerContext): boolean {
        this._isAvailable = this.requirements.every(req => req.isMet(playerContext));
        return this._isAvailable;
    }

    public getTooltip(): string {
        if (this._isAvailable) return '';

        const unmetRequirements = this.requirements
            .filter(req => !req.isMet)
            .map(req => req.description);

        return `Требования: ${unmetRequirements.join(', ')}`;
    }
}
