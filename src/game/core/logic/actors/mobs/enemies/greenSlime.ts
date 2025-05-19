import Mob from "../mob.ts";
import {txtList} from "../../../../config/lang.ts";
import {setMadBoarManager} from "../../../../graphics/static/managers.ts";


export default class GreenSlime extends Mob {
    constructor() {
        super();
        this.name = txtList().slime;
        this.image = setMadBoarManager();
        this.minDamage = 10;
        this.maxDamage = 20;
    }
}