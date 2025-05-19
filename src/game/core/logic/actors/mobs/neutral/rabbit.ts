import Mob from "../mob.ts";
import {txtList} from "../../../../config/lang.ts";
import {setRabbitManager} from "../../../../graphics/static/managers.ts";

export default class Rabbit extends Mob {
    constructor() {
        super();
        this.name = txtList().say;
        this.image = setRabbitManager();
        this.minDamage = 0;
        this.maxDamage = 2;
    }
}