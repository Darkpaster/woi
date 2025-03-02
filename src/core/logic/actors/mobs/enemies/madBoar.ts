import { madBoarManager } from "../../../../graphics/static/managers.ts";
import { Mob } from "../mob.ts";
import {txtList} from "../../../../config/lang.ts";

export class MadBoar extends Mob {
    constructor() {
        super();
        this.name = txtList().madBoar;
        this.image = madBoarManager;
        this.minDamage = 10;
        this.maxDamage = 20;
        // this.spellBook.push(new FrostWave(this));
    }
}