import { frostBall } from "../../graphics/paths.ts";
import { Skill } from "./skill.ts";

export class FrostWave extends Skill {
    name: string;
    icon: string; 
    minDamage: number;
    maxDamage: number;
    range: number;

    constructor(owner: any) {
        super(owner);
        this.delay = 2000;
        this.cooldown = 20000;
        this.name = "Frost Wave";
        this.icon = frostBall;
        this.minDamage = 20;
        this.maxDamage = 34;
        this.range = 6;
    }
}