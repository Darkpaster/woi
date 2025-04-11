import {Atom} from "../../atom.ts";
import {Vector2D} from "../../utils.ts";

export class Helium3 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Гелий-3: 2 протона, 1 нейтрон, 2 электрона
        super(position, "³He", 2, 1, 2);
    }
}