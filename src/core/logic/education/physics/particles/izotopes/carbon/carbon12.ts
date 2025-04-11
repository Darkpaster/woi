import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Carbon12 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Углерод-12: 6 протонов, 6 нейтронов, 6 электронов
        super(position, "¹²C", 6, 6, 6);
    }
}