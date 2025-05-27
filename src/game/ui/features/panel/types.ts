// types/panelTypes.ts
import { Skill } from "../../../core/logic/skills/skill.ts";

export interface PanelSlot {
    skill?: Skill;
    windowType?: WindowType;
    isEmpty?: boolean;
}

export type WindowType = 'professionsWindow' | 'settingsWindow' | 'inventoryWindow' | 'characterWindow' | 'questsWindow' | "friendsWindow" | "achievementsWindow" | "spellBookWindow" | "talentsWindow";

export interface PanelConfig {
    type: 'skills' | 'windows';
    orientation: 'horizontal' | 'vertical';
    length: number;
    position?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
    className?: string;
}

export interface SkillPanelProps extends PanelConfig {
    type: 'skills';
    spellBook: (Skill | null)[];
    onSkillUse: (skill: Skill) => void;
    onSkillReorder: (sourceIndex: number, targetIndex: number) => void;
}

export interface WindowPanelProps extends PanelConfig {
    type: 'windows';
    windows: WindowConfig[];
    onWindowOpen: (windowType: WindowType) => void;
}

export interface WindowConfig {
    type: WindowType;
    icon: string;
    name: string;
    hotkey?: string;
}