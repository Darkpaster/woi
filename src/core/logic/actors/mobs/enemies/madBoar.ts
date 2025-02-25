import { madBoarManager } from "../../../../graphics/animations.ts";
import { scaledTileSize } from "../../../../../utils/math.ts";
import { Mob } from "../mob.ts";

export class madBoar extends Mob {
    name: string;
    image: typeof madBoarManager;
    minDamage: number;
    maxDamage: number;

    constructor() {
        super();
        this.name = "Mad boar";
        this.image = madBoarManager;
        this.minDamage = 10;
        this.maxDamage = 20;
        // this.spellBook.push(new FrostWave(this));
    }
}