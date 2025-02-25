import { AnimatedEffect } from "../../graphics/image.ts";
import { slash } from "../../graphics/paths.ts";
import { slashEffect } from "../../graphics/sprites.ts";
import { Player } from "../actors/player.ts";
import { Skill } from "./skill.ts";

interface SlashProps {
    owner: Player; // Replace 'any' with the appropriate type for owner
}

export class Slash extends Skill {
    icon: string;
    animation: AnimatedEffect;
    name: string;
    minDamage: number;
    maxDamage: number;
    description: string;

    constructor({ owner }: SlashProps) {
        super(owner);
        this.icon = slash;
        this.animation = slashEffect;
        this.name = "Slash";
        this.minDamage = 60;
        this.maxDamage = 85;
        this.description = `Hits enemy for ${this.minDamage} - ${this.maxDamage} damage.<br><br>Cooldown: ${this.cooldown / 1000}`;
    }
}