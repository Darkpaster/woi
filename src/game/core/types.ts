import Item from "./logic/items/item.ts";
import { Actor } from "./logic/actors/actor.ts";
import { Skill } from "./logic/skills/skill.ts";
import { AnimatedImageManager } from "./graphics/image.ts";
import { Buff } from "../ui/widgets/actor/target/BuffsList.tsx";

export type RarityType =
    | "none"
    | "common"
    | "uncommon"
    | "rare"
    | "epic"
    | "legendary"
    | "godlike";

export type EntityType = Item | Actor | Skill | Buff;

export type RenderStateType =
    | "idle"
    | "walk"
    | "run"
    | "jump"
    | "hurt"
    | "death"
    | "attack1"
    | "attack2"
    | "attack3";

export type EquipmentSlotType =
    | "head"
    | "shoulders"
    | "body"
    | "cape"
    | "braces"
    | "weapon1"
    | "weapon2"
    | "weapon1&2"
    | "gloves"
    | "belt"
    | "legs"
    | "boots"
    | "ring"
    | "accessory"
    | "none";

export interface EntityUIInfo {
    name: string;
    image?: AnimatedImageManager | null;
    icon?: string | null;
    description: string;
    note?: string;
    rarity: RarityType;
}

export interface ActorDTO {
    actorId: number;
    name: string;
    x: number;
    y: number;
    renderState: RenderStateType;
    health: number;
}

export interface ItemDTO {
    id: number;
    x: number;
    y: number;
    name: string;
    equipmentSlot: EquipmentSlotType;
    inventorySlot: number;
}

export interface DamageDTO {
    value: number;
    target: {
        targetId: number;
        targetType: string;
    };
}