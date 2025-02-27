import { madBoarManager } from "../../../../graphics/static/managers.ts";
import { Mob } from "../mob.ts";

export class madBoar extends Mob {
    constructor() {
        super();
        this.name = "Mad boar";
        this.image = madBoarManager;
        this.minDamage = 10;
        this.maxDamage = 20;
        // this.spellBook.push(new FrostWave(this));
    }
}