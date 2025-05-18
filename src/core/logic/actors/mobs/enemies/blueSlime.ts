import Mob from "../mob.ts";
import {txtList} from "../../../../config/lang.ts";
import {setBlueSlimeManager} from "../../../../graphics/static/managers.ts";


export default class BlueSlime extends Mob {
    constructor() {
        super();
        this.name = txtList().skime;
        this.description = txtList().skimeDescription;
        this.image = setBlueSlimeManager();
    }
}