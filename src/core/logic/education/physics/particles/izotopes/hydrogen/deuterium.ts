import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Deuterium extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Дейтерий: 1 протон, 1 нейтрон, 1 электрон
        super(position, "²H (D)", 1, 1, 1);
    }
}