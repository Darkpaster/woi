import { Atom } from './atom';
import { Vector2D } from './utils';

interface AtomWithBond {
    atom: Atom;
    bondType: number; // 1 = одинарная, 2 = двойная, 3 = тройная связь
}

export class Molecule {
    private atoms: Map<Atom, AtomWithBond[]>;
    private position: Vector2D;
    private velocity: Vector2D;
    private name: string;

    constructor(name: string, position: Vector2D, atoms?: Atom[]) {
        this.atoms = new Map();
        this.position = { ...position };
        this.velocity = { x: 0, y: 0 };
        this.name = name;
        if (atoms) {
            for (const atom of atoms) {
                this.addAtom(atom);
            }
        }
    }

    addAtom(atom: Atom, bonds: { atom: Atom, bondType: number }[] = []): void {
        this.atoms.set(atom, bonds);

        // Обновляем связи в обратном направлении
        for (const bond of bonds) {
            if (this.atoms.has(bond.atom)) {
                const atomBonds = this.atoms.get(bond.atom) || [];

                // Проверяем, существует ли уже связь с текущим атомом
                const existingBond = atomBonds.find(b => b.atom === atom);

                if (!existingBond) {
                    atomBonds.push({ atom, bondType: bond.bondType });
                    this.atoms.set(bond.atom, atomBonds);
                }
            }
        }
    }

    update(deltaTime: number): void {
        // Обновляем положение молекулы
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Вычисляем центр масс
        let totalMass = 0;
        const centerOfMass = { x: 0, y: 0 };

        for (const atom of this.atoms.keys()) {
            const pos = atom.getPosition();
            const mass = atom.mass;

            centerOfMass.x += pos.x * mass;
            centerOfMass.y += pos.y * mass;
            totalMass += mass;
        }

        if (totalMass > 0) {
            centerOfMass.x /= totalMass;
            centerOfMass.y /= totalMass;
        } else {
            centerOfMass.x = this.position.x;
            centerOfMass.y = this.position.y;
        }

        // Вычисляем смещение от центра масс к новой позиции
        const offsetX = this.position.x - centerOfMass.x;
        const offsetY = this.position.y - centerOfMass.y;

        // Обновляем все атомы
        for (const atom of this.atoms.keys()) {
            const pos = atom.getPosition();
            atom.setPosition({
                x: pos.x + offsetX,
                y: pos.y + offsetY
            });

            atom.update(deltaTime);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Сначала рисуем все связи
        for (const [atom, bonds] of this.atoms.entries()) {
            const atomPos = atom.getPosition();

            for (const bond of bonds) {
                const connectedAtomPos = bond.atom.getPosition();

                // Рисуем связь
                ctx.beginPath();

                switch (bond.bondType) {
                    case 1: // Одинарная связь
                        ctx.moveTo(atomPos.x, atomPos.y);
                        ctx.lineTo(connectedAtomPos.x, connectedAtomPos.y);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        break;

                    case 2: // Двойная связь
                        const angle = Math.atan2(connectedAtomPos.y - atomPos.y, connectedAtomPos.x - atomPos.x);
                        const perpX = Math.cos(angle + Math.PI/2) * 3;
                        const perpY = Math.sin(angle + Math.PI/2) * 3;

                        ctx.moveTo(atomPos.x + perpX, atomPos.y + perpY);
                        ctx.lineTo(connectedAtomPos.x + perpX, connectedAtomPos.y + perpY);
                        ctx.moveTo(atomPos.x - perpX, atomPos.y - perpY);
                        ctx.lineTo(connectedAtomPos.x - perpX, connectedAtomPos.y - perpY);

                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                        break;

                    case 3: // Тройная связь
                        const angle3 = Math.atan2(connectedAtomPos.y - atomPos.y, connectedAtomPos.x - atomPos.x);

                        ctx.moveTo(atomPos.x, atomPos.y);
                        ctx.lineTo(connectedAtomPos.x, connectedAtomPos.y);

                        const perp3X1 = Math.cos(angle3 + Math.PI/2) * 4;
                        const perp3Y1 = Math.sin(angle3 + Math.PI/2) * 4;
                        ctx.moveTo(atomPos.x + perp3X1, atomPos.y + perp3Y1);
                        ctx.lineTo(connectedAtomPos.x + perp3X1, connectedAtomPos.y + perp3Y1);

                        ctx.moveTo(atomPos.x - perp3X1, atomPos.y - perp3Y1);
                        ctx.lineTo(connectedAtomPos.x - perp3X1, connectedAtomPos.y - perp3Y1);

                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        break;
                }
            }
        }

        // Теперь рисуем все атомы
        for (const atom of this.atoms.keys()) {
            atom.draw(ctx);
        }

        // Рисуем название молекулы
        ctx.font = '14px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.position.x, this.position.y - 40);
    }

    applyForce(force: Vector2D): void {
        // Вычисляем общую массу молекулы
        let totalMass = 0;
        for (const atom of this.atoms.keys()) {
            totalMass += atom.mass;
        }

        const acceleration = {
            x: force.x / totalMass,
            y: force.y / totalMass
        };

        this.velocity.x += acceleration.x;
        this.velocity.y += acceleration.y;
    }

    getPosition(): Vector2D {
        return { ...this.position };
    }

    setPosition(position: Vector2D): void {
        const deltaX = position.x - this.position.x;
        const deltaY = position.y - this.position.y;

        // Перемещаем молекулу, обновляя позицию каждого атома
        for (const atom of this.atoms.keys()) {
            const pos = atom.getPosition();
            atom.setPosition({
                x: pos.x + deltaX,
                y: pos.y + deltaY
            });
        }

        this.position = { ...position };
    }

    getVelocity(): Vector2D {
        return { ...this.velocity };
    }

    setVelocity(velocity: Vector2D): void {
        this.velocity = { ...velocity };
    }

    getName(): string {
        return this.name;
    }

    // Фабричный метод для создания общих молекул
    static createWater(position: Vector2D): Molecule {
        const water = new Molecule('H₂O', position);

        const oxygen = new Atom({ x: position.x, y: position.y }, 'O', 8, 8, 8);
        const hydrogen1 = new Atom({ x: position.x - 25, y: position.y - 10 }, 'H', 1, 0, 1);
        const hydrogen2 = new Atom({ x: position.x + 25, y: position.y - 10 }, 'H', 1, 0, 1);

        water.addAtom(oxygen, [
            { atom: hydrogen1, bondType: 1 },
            { atom: hydrogen2, bondType: 1 }
        ]);

        water.addAtom(hydrogen1, [
            { atom: oxygen, bondType: 1 }
        ]);

        water.addAtom(hydrogen2, [
            { atom: oxygen, bondType: 1 }
        ]);

        return water;
    }

    static createCarbonDioxide(position: Vector2D): Molecule {
        const co2 = new Molecule('CO₂', position);

        const carbon = new Atom({ x: position.x, y: position.y }, 'C', 6, 6, 6);
        const oxygen1 = new Atom({ x: position.x - 30, y: position.y }, 'O', 8, 8, 8);
        const oxygen2 = new Atom({ x: position.x + 30, y: position.y }, 'O', 8, 8, 8);

        co2.addAtom(carbon, [
            { atom: oxygen1, bondType: 2 },
            { atom: oxygen2, bondType: 2 }
        ]);

        co2.addAtom(oxygen1, [
            { atom: carbon, bondType: 2 }
        ]);

        co2.addAtom(oxygen2, [
            { atom: carbon, bondType: 2 }
        ]);

        return co2;
    }
}