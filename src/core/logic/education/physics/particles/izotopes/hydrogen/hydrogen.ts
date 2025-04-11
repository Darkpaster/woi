import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Hydrogen extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Обычный водород: 1 протон, 0 нейтронов, 1 электрон
        super(position, "H", 1, 0, 1);
    }
}