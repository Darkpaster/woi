import { Mob } from "../mob.ts";
import {rabbitManager} from "../../../../graphics/static/managers.ts";
import {txtList} from "../../../../config/lang.ts";

export class Rabbit extends Mob {
    constructor() {
        super();
        this.name = txtList().copper;
        this.image = rabbitManager;
        this.minDamage = 0;
        this.maxDamage = 2;
        // this.spellBook.push(new FrostWave(this));
    }
}