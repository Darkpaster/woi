import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Oxygen17 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Кислород-17: 8 протонов, 9 нейтронов, 8 электронов
        super(position, "¹⁷O", 8, 9, 8);
    }
}