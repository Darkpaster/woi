// Вспомогательные классы для симуляции деления ядра урана
import {Atom} from "../atom.ts";
import {Vector2D} from "../utils.ts";

export class Krypton92 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Криптон-92: 36 протонов, 56 нейтронов, 36 электронов
        super(position, "⁹²Kr", 36, 56, 36);
    }
}

export class Barium141 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Барий-141: 56 протонов, 85 нейтронов, 56 электронов
        super(position, "¹⁴¹Ba", 56, 85, 56);
    }
}

// Вспомогательные классы для симуляции деления ядра плутония
export class Xenon134 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Ксенон-134: 54 протона, 80 нейтронов, 54 электрона
        super(position, "¹³⁴Xe", 54, 80, 54);
    }
}

export class Strontium104 extends Atom {
    constructor(position: Vector2D = { x: 0, y: 0 }) {
        // Стронций-104: 38 протонов, 66 нейтронов, 38 электронов
        super(position, "¹⁰⁴Sr", 38, 66, 38);
    }
}