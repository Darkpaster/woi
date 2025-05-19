import {Atom} from "../../atom.ts";
import {Vector2D} from "../../../../../../../../../../utils/math/2d.ts";

export class Helium4 extends Atom {
    constructor(position: Vector2D = new Vector2D(0, 0)) {
        // Гелий-4: 2 протона, 2 нейтрона, 2 электрона
        super(position, "⁴He", 2, 2, 2);
    }
}