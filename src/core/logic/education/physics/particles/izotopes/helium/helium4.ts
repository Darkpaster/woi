import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Helium4 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Гелий-4: 2 протона, 2 нейтрона, 2 электрона
        super(position, "⁴He", 2, 2, 2);
    }
}