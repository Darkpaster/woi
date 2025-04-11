import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Oxygen18 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Кислород-18: 8 протонов, 10 нейтронов, 8 электронов
        super(position, "¹⁸O", 8, 10, 8);
    }
}