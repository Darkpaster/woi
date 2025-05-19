import {MathObject} from "../mathObject.ts";

export namespace Algebra {

    // ---- Abstract Algebra (абстрактная алгебра) ----

    /**
     * Абстрактный класс для алгебраических структур
     */
    export abstract class AlgebraicStructure<T> extends MathObject {
        abstract operate(a: T, b: T): T;

        abstract identity(): T;

        abstract inverse(a: T): T;
    }

    /**
     * Класс представляющий группу
     */
    export class Group<T> extends AlgebraicStructure<T> {
        private elements: T[];
        private operationFn: (a: T, b: T) => T;
        private identityElement: T;
        private inverseFn: (a: T) => T;

        constructor(
            name: string,
            elements: T[],
            operationFn: (a: T, b: T) => T,
            identityElement: T,
            inverseFn: (a: T) => T,
            description?: string
        ) {
            super(name, description);
            this.elements = elements;
            this.operationFn = operationFn;
            this.identityElement = identityElement;
            this.inverseFn = inverseFn;
        }

        operate(a: T, b: T): T {
            return this.operationFn(a, b);
        }

        identity(): T {
            return this.identityElement;
        }

        inverse(a: T): T {
            return this.inverseFn(a);
        }

        getElements(): T[] {
            return [...this.elements];
        }

        // Проверка свойств группы
        isClosedUnderOperation(): boolean {
            for (const a of this.elements) {
                for (const b of this.elements) {
                    const result = this.operate(a, b);
                    if (!this.elements.some(e => this.areEqual(e, result))) {
                        return false;
                    }
                }
            }
            return true;
        }

        isAssociative(): boolean {
            for (const a of this.elements) {
                for (const b of this.elements) {
                    for (const c of this.elements) {
                        const ab_c = this.operate(this.operate(a, b), c);
                        const a_bc = this.operate(a, this.operate(b, c));
                        if (!this.areEqual(ab_c, a_bc)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        hasIdentity(): boolean {
            for (const e of this.elements) {
                if (this.elements.every(a =>
                    this.areEqual(this.operate(a, e), a) &&
                    this.areEqual(this.operate(e, a), a)
                )) {
                    return true;
                }
            }
            return false;
        }

        hasInverses(): boolean {
            for (const a of this.elements) {
                let hasInverse = false;
                for (const b of this.elements) {
                    if (this.areEqual(this.operate(a, b), this.identityElement) &&
                        this.areEqual(this.operate(b, a), this.identityElement)) {
                        hasInverse = true;
                        break;
                    }
                }
                if (!hasInverse) return false;
            }
            return true;
        }

        isGroup(): boolean {
            return this.isClosedUnderOperation() &&
                this.isAssociative() &&
                this.hasIdentity() &&
                this.hasInverses();
        }

        // По умолчанию сравнение через ===, но можно переопределить
        protected areEqual(a: T, b: T): boolean {
            return a === b;
        }
    }
}