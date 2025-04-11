import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Tritium extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Тритий: 1 протон, 2 нейтрона, 1 электрон
        super(position, "³H (T)", 1, 2, 1);
    }
}