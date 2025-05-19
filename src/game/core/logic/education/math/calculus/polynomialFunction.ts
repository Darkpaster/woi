import {Calculus} from "./calculus.ts";
import MathFunction = Calculus.MathFunction;

export class PolynomialFunction extends MathFunction {
    private coefficients: number[];

    constructor(coefficients: number[], name: string = "P(x)", description?: string) {
        super(name, description);
        // Коэффициенты хранятся от младшей степени к старшей: [a0, a1, a2, ...] для a0 + a1*x + a2*x^2 + ...
        this.coefficients = [...coefficients];

        // Удаляем ведущие нули
        while (this.coefficients.length > 1 && Math.abs(this.coefficients[this.coefficients.length - 1]) < 1e-10) {
            this.coefficients.pop();
        }
    }

    getCoefficients(): number[] {
        return [...this.coefficients];
    }

    getDegree(): number {
        return this.coefficients.length - 1;
    }

    evaluate(x: number): number {
        // Используем схему Горнера для эффективного вычисления значения полинома
        let result = 0;
        for (let i = this.coefficients.length - 1; i >= 0; i--) {
            result = result * x + this.coefficients[i];
        }
        return result;
    }

    // Аналитическая производная полинома (возвращает новый полином)
    analyticDerivative(): PolynomialFunction {
        if (this.coefficients.length <= 1) {
            // Производная константы равна нулю
            return new PolynomialFunction([0], `d${this.getName()}/dx`);
        }

        const derivativeCoefficients: number[] = [];

        for (let i = 1; i < this.coefficients.length; i++) {
            derivativeCoefficients.push(i * this.coefficients[i]);
        }

        return new PolynomialFunction(derivativeCoefficients, `d${this.getName()}/dx`);
    }

    // Аналитическое интегрирование полинома (возвращает новый полином), C = 0
    analyticIntegral(): PolynomialFunction {
        const integralCoefficients: number[] = [0]; // Константа интегрирования

        for (let i = 0; i < this.coefficients.length; i++) {
            integralCoefficients.push(this.coefficients[i] / (i + 1));
        }

        return new PolynomialFunction(integralCoefficients, `∫${this.getName()}dx`);
    }

    // Операции над полиномами
    add(other: PolynomialFunction): PolynomialFunction {
        const resultCoefficients: number[] = [];
        const maxDegree = Math.max(this.coefficients.length, other.coefficients.length);

        for (let i = 0; i < maxDegree; i++) {
            const a = i < this.coefficients.length ? this.coefficients[i] : 0;
            const b = i < other.coefficients.length ? other.getCoefficients()[i] : 0;
            resultCoefficients.push(a + b);
        }

        return new PolynomialFunction(resultCoefficients, `(${this.getName()} + ${other.getName()})`);
    }

    subtract(other: PolynomialFunction): PolynomialFunction {
        const resultCoefficients: number[] = [];
        const maxDegree = Math.max(this.coefficients.length, other.coefficients.length);

        for (let i = 0; i < maxDegree; i++) {
            const a = i < this.coefficients.length ? this.coefficients[i] : 0;
            const b = i < other.coefficients.length ? other.getCoefficients()[i] : 0;
            resultCoefficients.push(a - b);
        }

        return new PolynomialFunction(resultCoefficients, `(${this.getName()} - ${other.getName()})`);
    }

    multiply(other: PolynomialFunction): PolynomialFunction {
        const resultDegree = this.getDegree() + other.getDegree();
        const resultCoefficients: number[] = Array(resultDegree + 1).fill(0);

        for (let i = 0; i <= this.getDegree(); i++) {
            for (let j = 0; j <= other.getDegree(); j++) {
                resultCoefficients[i + j] += this.coefficients[i] * other.getCoefficients()[j];
            }
        }

        return new PolynomialFunction(resultCoefficients, `(${this.getName()} * ${other.getName()})`);
    }

    // Нахождение корней полинома (для полиномов степени <= 2)
    findRoots(): number[] {
        if (this.getDegree() === 0) {
            return this.coefficients[0] === 0 ? [0] : [];
        }

        if (this.getDegree() === 1) {
            // Линейная функция: a0 + a1*x = 0
            if (this.coefficients[1] === 0) return [];
            return [-this.coefficients[0] / this.coefficients[1]];
        }

        if (this.getDegree() === 2) {
            // Квадратичная функция: a0 + a1*x + a2*x^2 = 0
            const a = this.coefficients[2];
            const b = this.coefficients[1];
            const c = this.coefficients[0];

            const discriminant = b * b - 4 * a * c;

            if (Math.abs(discriminant) < 1e-10) {
                // Один корень кратности два
                return [-b / (2 * a)];
            } else if (discriminant > 0) {
                // Два разных корня
                const sqrtD = Math.sqrt(discriminant);
                return [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)];
            } else {
                // Нет действительных корней
                return [];
            }
        }

        // Для полиномов высшей степени нужно использовать численные методы
        console.warn('Finding roots for polynomials of degree > 2 is not implemented analytically');
        return [];
    }
}