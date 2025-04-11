import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Oxygen16 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Кислород-16: 8 протонов, 8 нейтронов, 8 электронов
        super(position, "¹⁶O", 8, 8, 8);
    }
}