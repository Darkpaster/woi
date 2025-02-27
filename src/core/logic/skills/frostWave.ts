import { frostBall } from "../../graphics/static/paths.ts";
import { Skill } from "./skill.ts";

export class FrostWave extends Skill {
    range: number;

    constructor(owner: any) {
        super(owner);
        this.delay = 2000;
        this.cooldown = 20000;
        this.name = "Frost Wave";
        this.sprite = frostBall;
        this.minDamage = 20;
        this.maxDamage = 34;
        this.range = 6;
    }
}