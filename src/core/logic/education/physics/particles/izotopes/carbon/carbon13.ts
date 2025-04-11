import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Carbon13 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Углерод-13: 6 протонов, 7 нейтронов, 6 электронов
        super(position, "¹³C", 6, 7, 6);
    }
}