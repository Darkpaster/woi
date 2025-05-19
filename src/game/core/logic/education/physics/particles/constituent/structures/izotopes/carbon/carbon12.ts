import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Carbon12 extends Atom {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Углерод-12: 6 протонов, 6 нейтронов, 6 электронов
        super(position, "¹²C", 6, 6, 6);
    }
}