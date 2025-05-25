import Item from "./logic/items/item.ts";
import {Actor} from "./logic/actors/actor.ts";
import {Skill} from "./logic/skills/skill.ts";
import {AnimatedImageManager} from "./graphics/image.ts";
import {Buff} from "../ui/widgets/actor/target/BuffsList.tsx";

export type RarityTypes = "none" | "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike";

export type EntityType = Item | Actor | Skill | Buff;

export type RenderStateType = "idle"|"walk"|"run"|"jump"|"hurt"|"death"|"attack1"|"attack2"|"attack3";

export type EquipmentType = 'head' | 'shoulders' | 'body' | 'cape' | 'braces' | 'weapon1' | 'weapon2' | 'weapon1&2' | 'gloves' | 'belt' | 'legs' | 'boots' | 'ring' | 'accessory' | 'none';

export interface EntityUIInfoType {
    // id: string;
    name: string;
    image?: AnimatedImageManager | null;
    icon?: string | null;
    description: string;
    note?: string;
    rarity: RarityTypes;
}

// export type PositionType = {
//     entityId: number, x: number, y: number, renderState: string
// }

export type ActorDTO = {
    actorId: number;
    name: string,
    x: number;
    y: number;
    renderState: RenderStateType;
    health: number;
    // buffs: Buff;
}

// export type ItemPositionType = {
//     itemId: number,
//     x: number,
//     y: number,
//     itemType: string
// }

export type ItemDTO = {
    id: number,
    x: number,
    y: number,
    name: string,
    equipmentSlot: EquipmentType,
    inventorySlot: number,
}


// export type MobDTOType = {
//     id: number,
//     x: number,
//     y: number,
//     health: number,
//     target: {x: number, y: number, entityId: number},
//     renderState: string
// }

export type DamageDTOType = {
    value: number,
    target: {
        targetId: number,
        targetType: string
    }
}