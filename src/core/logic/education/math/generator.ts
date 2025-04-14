// Расширенный генератор математических выражений для разных уровней сложности
// Результат возвращается в формате, совместимом с KaTeX

// Основной интерфейс для генератора выражений
interface ExpressionGenerator {
    generate(): string;
}

// Утилиты
class MathUtils {
    // Генерация случайного целого числа в диапазоне [min, max]
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация случайного числа с плавающей точкой в диапазоне [min, max] с указанным количеством знаков после запятой
    static randomFloat(min: number, max: number, decimals: number = 2): number {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    }

    // Выбор случайного элемента из массива
    static randomChoice<T>(arr: T[]): T {
        return arr[this.randomInt(0, arr.length - 1)];
    }

    // Форматирование числа для KaTeX (добавление скобок для отрицательных чисел в определенных контекстах)
    static formatNumber(num: number, forceParenthesis: boolean = false): string {
        if ((num < 0 || forceParenthesis) && num !== 0) {
            return `(${num})`;
        }
        return num.toString();
    }

    // Генерация случайного вектора
    static randomVector(dimension: number, min: number = -10, max: number = 10): number[] {
        return Array.from({length: dimension}, () => this.randomInt(min, max));
    }

    // Форматирование вектора для KaTeX
    static formatVector(vector: number[]): string {
        return `\\begin{pmatrix} ${vector.join(' \\\\ ')} \\end{pmatrix}`;
    }

    // Подбор простых корней для полиномов
    static generatePolynomialWithRoots(degree: number): { polynomial: string, roots: number[] } {
        const roots = Array.from({length: degree}, () => this.randomInt(-5, 5));

        // Формируем полином вида (x-r1)(x-r2)...(x-rn)
        let polynomial = '';
        let expandedTerms: { coefficient: number, power: number }[] = [{coefficient: 1, power: 0}];

        for (const root of roots) {
            // Умножаем текущий полином на (x - root)
            const newTerms: { coefficient: number, power: number }[] = [];

            // Умножаем каждый член полинома на (x - root)
            for (const term of expandedTerms) {
                // Умножение на x даёт x^(power+1)
                newTerms.push({
                    coefficient: term.coefficient,
                    power: term.power + 1
                });

                // Умножение на (-root) даёт -root * x^power
                const existingTermIndex = newTerms.findIndex(t => t.power === term.power);
                if (existingTermIndex !== -1) {
                    newTerms[existingTermIndex].coefficient += term.coefficient * (-root);
                } else {
                    newTerms.push({
                        coefficient: term.coefficient * (-root),
                        power: term.power
                    });
                }
            }

            expandedTerms = newTerms;
        }

        // Сортируем по степени в порядке убывания
        expandedTerms.sort((a, b) => b.power - a.power);

        // Формируем полином в виде строки
        polynomial = expandedTerms.map((term, index) => {
            if (term.coefficient === 0) return '';

            let termStr = '';

            // Добавляем знак, кроме первого положительного члена
            if (index === 0) {
                termStr = term.coefficient === 1 && term.power > 0 ? '' :
                    term.coefficient === -1 && term.power > 0 ? '-' :
                        `${term.coefficient}`;
            } else {
                termStr = term.coefficient === 1 && term.power > 0 ? ' + ' :
                    term.coefficient === -1 && term.power > 0 ? ' - ' :
                        term.coefficient > 0 ? ` + ${term.coefficient}` :
                            ` - ${Math.abs(term.coefficient)}`;
            }

            // Добавляем x в соответствующей степени
            if (term.power === 0) {
                return termStr;
            } else if (term.power === 1) {
                return `${termStr}${term.coefficient === 1 || term.coefficient === -1 ? '' : ''}x`;
            } else {
                return `${termStr}${term.coefficient === 1 || term.coefficient === -1 ? '' : ''}x^{${term.power}}`;
            }
        }).join('');

        return {polynomial, roots};
    }
}

// 1. Генератор выражений для начальной школы
class ElementaryArithmeticGenerator implements ExpressionGenerator {
    private level: number; // 1-3, где 3 - самый сложный

    constructor(level: number = 1) {
        this.level = Math.min(3, Math.max(1, level));
    }

    generate(): string {
        switch (this.level) {
            case 1:
                return this.generateLevel1();
            case 2:
                return this.generateLevel2();
            case 3:
                return this.generateLevel3();
            default:
                return this.generateLevel1();
        }
    }

    // Простые операции сложения и вычитания (числа до 100)
    private generateLevel1(): string {
        const operations = ['+', '-'];
        const op = MathUtils.randomChoice(operations);

        let a = MathUtils.randomInt(1, 100);
        let b = MathUtils.randomInt(1, 100);

        // Для вычитания убедимся, что a >= b для избежания отрицательных результатов
        if (op === '-' && a < b) {
            [a, b] = [b, a];
        }

        return `${a} ${op} ${b}`;
    }

    // Умножение и деление (числа до 100, результат деления целый)
    private generateLevel2(): string {
        const operations = ['+', '-', '\\times', '\\div'];
        const op = MathUtils.randomChoice(operations);

        let a, b;

        switch (op) {
            case '+':
            case '-':
                a = MathUtils.randomInt(1, 100);
                b = MathUtils.randomInt(1, 100);
                if (op === '-' && a < b) {
                    [a, b] = [b, a];
                }
                break;
            case '\\times':
                a = MathUtils.randomInt(2, 12);
                b = MathUtils.randomInt(2, 12);
                break;
            case '\\div':
                b = MathUtils.randomInt(2, 12);
                a = b * MathUtils.randomInt(1, 10); // Гарантируем, что результат будет целым числом
                break;
        }

        return `${a} ${op} ${b}`;
    }

    // Комбинированные выражения со скобками
    private generateLevel3(): string {
        const numOperations = MathUtils.randomInt(2, 3);
        const operations = ['+', '-', '\\times', '\\div'];

        let expression = '';

        // Генерируем первое число
        let lastNum = MathUtils.randomInt(1, 50);
        expression = lastNum.toString();

        // Добавляем операции
        for (let i = 0; i < numOperations; i++) {
            const op = MathUtils.randomChoice(operations);
            let nextNum: number;

            switch (op) {
                case '+':
                case '-':
                    nextNum = MathUtils.randomInt(1, 50);
                    break;
                case '\\times':
                    nextNum = MathUtils.randomInt(2, 12);
                    break;
                case '\\div':
                    // Гарантируем, что результат деления будет целым числом
                    nextNum = MathUtils.randomInt(2, 12);
                    if (lastNum % nextNum !== 0) {
                        lastNum = nextNum * MathUtils.randomInt(1, 10);
                    }
                    break;
                default:
                    nextNum = MathUtils.randomInt(1, 50);
            }

            expression += ` ${op} ${nextNum}`;
            lastNum = nextNum;
        }

        // Добавляем скобки с некоторой вероятностью
        if (numOperations > 1 && Math.random() > 0.5) {
            const parts = expression.split(' ');
            const startPos = MathUtils.randomInt(0, parts.length - 3);
            const endPos = MathUtils.randomInt(startPos + 2, parts.length - 1);

            if (endPos - startPos >= 2) {
                parts[startPos] = '(' + parts[startPos];
                parts[endPos] = parts[endPos] + ')';
                expression = parts.join(' ');
            }
        }

        return expression;
    }
}

// 2. Генератор выражений для средней школы
class MiddleSchoolGenerator implements ExpressionGenerator {
    private level: number; // 1-3, где 3 - самый сложный

    constructor(level: number = 1) {
        this.level = Math.min(3, Math.max(1, level));
    }

    generate(): string {
        switch (this.level) {
            case 1:
                return this.generateLevel1();
            case 2:
                return this.generateLevel2();
            case 3:
                return this.generateLevel3();
            default:
                return this.generateLevel1();
        }
    }

    // Линейные уравнения
    private generateLevel1(): string {
        const types = ['linear-equation', 'simple-fraction', 'ratio-proportion'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'linear-equation': {
                const a = MathUtils.randomInt(1, 10);
                let b = MathUtils.randomInt(-20, 20);
                const c = MathUtils.randomInt(1, 50);

                return `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}`;
            }

            case 'simple-fraction': {
                const a = MathUtils.randomInt(1, 20);
                const b = MathUtils.randomInt(1, 20);
                const c = MathUtils.randomInt(1, 20);
                const d = MathUtils.randomInt(1, 20);

                return `\\frac{${a}}{${b}} ${MathUtils.randomChoice(['+', '-', '\\times', '\\div'])} \\frac{${c}}{${d}}`;
            }

            case 'ratio-proportion': {
                const a = MathUtils.randomInt(1, 20);
                const b = MathUtils.randomInt(1, 20);
                const c = MathUtils.randomInt(1, 20);

                return `\\frac{${a}}{${b}} = \\frac{${c}}{x}`;
            }
        }

        return '';
    }

    // Квадратные уравнения
    private generateLevel2(): string {
        const types = ['quadratic-equation', 'factorization', 'simple-inequalities'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'quadratic-equation': {
                // Генерируем корни, чтобы гарантировать решаемость
                const r1 = MathUtils.randomInt(-10, 10);
                const r2 = MathUtils.randomInt(-10, 10);

                // По теореме Виета: x^2 - (r1+r2)x + r1*r2 = 0
                const a = 1;
                const b = -(r1 + r2);
                const c = r1 * r2;

                let equation = `${a}x^2`;

                if (b !== 0) {
                    equation += ` ${b > 0 ? '+' : ''} ${b}x`;
                }

                if (c !== 0) {
                    equation += ` ${c > 0 ? '+' : ''} ${c}`;
                }

                equation += ' = 0';

                return equation;
            }

            case 'factorization': {
                const a = MathUtils.randomInt(1, 5);
                const b = MathUtils.randomInt(1, 10);
                const c = MathUtils.randomInt(1, 5);
                const d = MathUtils.randomInt(1, 10);

                return `(${a}x ${b > 0 ? '+' : ''} ${b})(${c}x ${d > 0 ? '+' : ''} ${d})`;
            }

            case 'simple-inequalities': {
                const a = MathUtils.randomInt(1, 10);
                const b = MathUtils.randomInt(-20, 20);
                const c = MathUtils.randomInt(1, 50);
                const inequalitySign = MathUtils.randomChoice(['<', '>', '\\leq', '\\geq']);

                return `${a}x ${b >= 0 ? '+' : ''} ${b} ${inequalitySign} ${c}`;
            }
        }

        return '';
    }

    // Системы линейных уравнений
    private generateLevel3(): string {
        const types = ['linear-system', 'word-problems', 'geometric-progressions'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'linear-system': {
                // Создаем систему с определенным решением
                const x = MathUtils.randomInt(-10, 10);
                const y = MathUtils.randomInt(-10, 10);

                const a1 = MathUtils.randomInt(1, 10);
                const b1 = MathUtils.randomInt(1, 10);
                const c1 = a1 * x + b1 * y;

                const a2 = MathUtils.randomInt(1, 10);
                const b2 = MathUtils.randomInt(1, 10);
                const c2 = a2 * x + b2 * y;

                // Убедимся, что уравнения линейно независимы
                if (a1 * b2 === a2 * b1) {
                    return this.generateLevel3(); // Рекурсивный вызов для повторной генерации
                }

                return `\\begin{cases} 
          ${a1}x ${b1 >= 0 ? '+' : ''} ${b1}y = ${c1} \\\\ 
          ${a2}x ${b2 >= 0 ? '+' : ''} ${b2}y = ${c2} 
        \\end{cases}`;
            }

            case 'word-problems': {
                const items = ['яблоки', 'карандаши', 'книги', 'монеты'];
                const item = MathUtils.randomChoice(items);
                const quantity1 = MathUtils.randomInt(2, 10);
                const quantity2 = MathUtils.randomInt(2, 10);
                const price1 = MathUtils.randomInt(5, 50);
                const price2 = MathUtils.randomInt(5, 50);
                const total = price1 * quantity1 + price2 * quantity2;

                return `\\text{Покупатель приобрел ${quantity1} ${item} по ${price1} рублей и ${quantity2} ${item} по ${price2} рублей. Сколько всего рублей заплатил покупатель?}`;
            }

            case 'geometric-progressions': {
                const firstTerm = MathUtils.randomInt(1, 10);
                const ratio = MathUtils.randomInt(2, 5);

                return `\\text{В геометрической прогрессии первый член равен } ${firstTerm}, \\text{ а знаменатель равен } ${ratio}. \\text{ Найдите сумму первых 5 членов прогрессии.}`;
            }
        }

        return '';
    }
}

// 3. Генератор выражений для старшей школы
class HighSchoolGenerator implements ExpressionGenerator {
    private level: number; // 1-3, где 3 - самый сложный

    constructor(level: number = 1) {
        this.level = Math.min(3, Math.max(1, level));
    }

    generate(): string {
        switch (this.level) {
            case 1:
                return this.generateLevel1();
            case 2:
                return this.generateLevel2();
            case 3:
                return this.generateLevel3();
            default:
                return this.generateLevel1();
        }
    }

    // Логарифмические и показательные выражения
    private generateLevel1(): string {
        const types = ['log', 'exp', 'roots', 'domain'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'log': {
                const base = MathUtils.randomInt(2, 10);
                const arg = MathUtils.randomInt(2, 100);
                return `\\log_{${base}} ${arg}`;
            }

            case 'exp': {
                const base = MathUtils.randomInt(2, 10);
                const exp = MathUtils.randomInt(1, 5);
                return `${base}^{${exp}}`;
            }

            case 'roots': {
                const degree = MathUtils.randomInt(2, 4);
                const arg = MathUtils.randomInt(1, 100);
                return `\\sqrt[${degree}]{${arg}}`;
            }

            case 'domain': {
                const expressionTypes = [
                    `\\frac{1}{x-${MathUtils.randomInt(-10, 10)}}`,
                    `\\sqrt{x-${MathUtils.randomInt(-10, 10)}}`,
                    `\\log_{${MathUtils.randomInt(2, 10)}}(x-${MathUtils.randomInt(-10, 10)})`
                ];
                const expr = MathUtils.randomChoice(expressionTypes);
                return `\\text{Найдите область определения функции } f(x) = ${expr}`;
            }
        }

        return '';
    }

    // Тригонометрические выражения
    private generateLevel2(): string {
        const types = ['basic-trig', 'compound-trig', 'inverse-trig', 'range'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'basic-trig': {
                const functions = ['\\sin', '\\cos', '\\tan'];
                const func = MathUtils.randomChoice(functions);

                // Выберем угол из стандартных значений, чтобы точное значение было известно
                const angles = [
                    '0', '\\frac{\\pi}{6}', '\\frac{\\pi}{4}',
                    '\\frac{\\pi}{3}', '\\frac{\\pi}{2}', '\\pi'
                ];
                const angle = MathUtils.randomChoice(angles);

                return `${func}(${angle})`;
            }

            case 'compound-trig': {
                const functions = ['\\sin', '\\cos', '\\tan'];
                const func1 = MathUtils.randomChoice(functions);
                const func2 = MathUtils.randomChoice(functions);

                const angles = [
                    'x', '2x', '\\frac{x}{2}', '\\pi - x', '\\frac{\\pi}{2} - x'
                ];
                const angle = MathUtils.randomChoice(angles);

                return `${func1}(${angle}) + ${func2}(${angle})`;
            }

            case 'inverse-trig': {
                const functions = ['\\arcsin', '\\arccos', '\\arctan'];
                const func = MathUtils.randomChoice(functions);

                const args = ['0', '\\frac{1}{2}', '\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{3}}{2}', '1'];
                const arg = MathUtils.randomChoice(args);

                return `${func}(${arg})`;
            }

            case 'range': {
                const expressions = [
                    `\\sin(x)`,
                    `\\cos(x)`,
                    `\\tan(x)`,
                    `2\\sin(x) + 1`,
                    `3\\cos(x) - 2`
                ];
                const expr = MathUtils.randomChoice(expressions);

                return `\\text{Найдите множество значений функции } f(x) = ${expr}`;
            }
        }

        return '';
    }

    // Комбинированные выражения (логарифмы, степени, тригонометрия)
    private generateLevel3(): string {
        const types = ['log-exp', 'trig-identities', 'complex-functions', 'extrema'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'log-exp': {
                const expressions = [
                    `\\log_{a} (a^{x}) = x`,
                    `\\log_{a} (xy) = \\log_{a} x + \\log_{a} y`,
                    `\\log_{a} (\\frac{x}{y}) = \\log_{a} x - \\log_{a} y`,
                    `\\log_{a} (x^n) = n \\log_{a} x`,
                    `a^{\\log_{a} x} = x`
                ];
                return MathUtils.randomChoice(expressions);
            }

            case 'trig-identities': {
                const identities = [
                    `\\sin^2(x) + \\cos^2(x) = 1`,
                    `\\sin(2x) = 2\\sin(x)\\cos(x)`,
                    `\\cos(2x) = \\cos^2(x) - \\sin^2(x)`,
                    `\\sin(a+b) = \\sin(a)\\cos(b) + \\cos(a)\\sin(b)`,
                    `\\cos(a+b) = \\cos(a)\\cos(b) - \\sin(a)\\sin(b)`
                ];
                return MathUtils.randomChoice(identities);
            }

            case 'complex-functions': {
                const funcs = [
                    `f(x) = ${MathUtils.randomInt(1, 5)}\\sin(x) + ${MathUtils.randomInt(1, 5)}\\cos(x)`,
                    `f(x) = \\sin(x) \\cdot \\log_{${MathUtils.randomInt(2, 10)}}(x)`,
                    `f(x) = e^{\\sin(x)}`,
                    `f(x) = \\log_{${MathUtils.randomInt(2, 10)}}(${MathUtils.randomInt(1, 5)}x^2 + ${MathUtils.randomInt(1, 5)})`,
                    `f(x) = \\frac{${MathUtils.randomInt(1, 10)}x^2 + ${MathUtils.randomInt(1, 10)}x + ${MathUtils.randomInt(1, 10)}}{${MathUtils.randomInt(1, 10)}x + ${MathUtils.randomInt(1, 10)}}`
                ];
                return MathUtils.randomChoice(funcs);
            }

            case 'extrema': {
                const functions = [
                    `f(x) = x^3 - ${MathUtils.randomInt(3, 12)}x`,
                    `f(x) = x^2 - ${MathUtils.randomInt(2, 10)}x + ${MathUtils.randomInt(1, 20)}`,
                    `f(x) = \\sin(x) + \\cos(x)`,
                    `f(x) = x^3 - ${MathUtils.randomInt(3, 9)}x^2 + ${MathUtils.randomInt(3, 12)}x - ${MathUtils.randomInt(1, 10)}`
                ];
                const func = MathUtils.randomChoice(functions);

                return `\\text{Найдите точки экстремума функции } ${func}`;
            }
        }

        return '';
    }
}

// 4. Генератор выражений для высшей математики
class AdvancedMathGenerator implements ExpressionGenerator {
    private level: number; // 1-3, где 3 - самый сложный

    constructor(level: number = 1) {
        this.level = Math.min(3, Math.max(1, level));
    }

    generate(): string {
        switch (this.level) {
            case 1:
                return this.generateLevel1();
            case 2:
                return this.generateLevel2();
            case 3:
                return this.generateLevel3();
            default:
                return this.generateLevel1();
        }
    }

    // Производные
    private generateLevel1(): string {
        const types = ['derivatives', 'integrals', 'sequences'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'derivatives': {
                const functions = [
                    'x^2', 'x^3', 'e^x', '\\ln(x)', '\\sin(x)', '\\cos(x)',
                    '\\tan(x)', 'x^n', '\\frac{1}{x}', '\\sqrt{x}'
                ];
                const func = MathUtils.randomChoice(functions);

                return `\\frac{d}{dx}\\left[${func}\\right]`;
            }

            case 'integrals': {
                const functions = [
                    'x', 'x^2', '\\frac{1}{x}', 'e^x', '\\sin(x)', '\\cos(x)',
                    '\\frac{1}{1+x^2}', 'x^n', '\\frac{1}{\\sqrt{1-x^2}}'
                ];
                const func = MathUtils.randomChoice(functions);

                return `\\int ${func} \\, dx`;
            }

            case 'sequences': {
                const sequences = [
                    `a_n = \\frac{1}{n}`,
                    `a_n = \\frac{n}{n+1}`,
                    `a_n = \\frac{1}{n^2}`,
                    `a_n = (-1)^n`,
                    `a_n = (-1)^n \\cdot \\frac{1}{n}`
                ];
                const seq = MathUtils.randomChoice(sequences);

                return `\\text{Исследуйте сходимость последовательности } ${seq}`;
            }
        }

        return '';
    }

    // Интегралы и более сложные концепции
    private generateLevel2(): string {
        const types = ['definite-integrals', 'multi-variable', 'vector-operations', 'probability'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'definite-integrals': {
                const functions = [
                    'x', 'x^2', 'x^3', '\\frac{1}{x}', 'e^x', '\\sin(x)', '\\cos(x)',
                    '\\frac{1}{1+x^2}', '\\sqrt{x}'
                ];
                const func = MathUtils.randomChoice(functions);

                const a = MathUtils.randomInt(0, 5);
                const b = MathUtils.randomInt(a + 1, 10);

                return `\\int_{${a}}^{${b}} ${func} \\, dx`;
            }

            case 'multi-variable': {
                const functions = [
                    `f(x,y) = x^2 + y^2`,
                    `f(x,y) = \\sin(x) + \\cos(y)`,
                    `f(x,y) = e^{x+y}`,
                    `f(x,y) = \\ln(x^2 + y^2)`,
                    `f(x,y) = xy`
                ];
                const func = MathUtils.randomChoice(functions);

                const operations = [
                    `\\frac{\\partial f}{\\partial x}`,
                    `\\frac{\\partial f}{\\partial y}`,
                    `\\frac{\\partial^2 f}{\\partial x^2}`,
                    `\\frac{\\partial^2 f}{\\partial y^2}`,
                    `\\frac{\\partial^2 f}{\\partial x \\partial y}`
                ];
                const operation = MathUtils.randomChoice(operations);

                return `\\text{Найдите } ${operation} \\text{ функции } ${func}`;
            }

            case 'vector-operations': {
                const vector1 = MathUtils.randomVector(3, -5, 5);
                const vector2 = MathUtils.randomVector(3, -5, 5);
                const vector1Str = MathUtils.formatVector(vector1);
                const vector2Str = MathUtils.formatVector(vector2);

                const operations = [
                    `\\vec{a} + \\vec{b}`,
                    `\\vec{a} - \\vec{b}`,
                    `\\vec{a} \\cdot \\vec{b} \\text{ (скалярное произведение)}`,
                    `\\vec{a} \\times \\vec{b} \\text{ (векторное произведение)}`
                ];
                const operation = MathUtils.randomChoice(operations);

                return `\\text{Вычислите } ${operation} \\text{, где } \\vec{a} = ${vector1Str} \\text{ и } \\vec{b} = ${vector2Str}`;
            }

            case 'probability': {
                const probabilityTypes = [
                    `\\text{В урне ${MathUtils.randomInt(3, 10)} белых и ${MathUtils.randomInt(3, 10)} черных шаров. Наудачу вынимают ${MathUtils.randomInt(2, 5)} шаров. Какова вероятность того, что все вынутые шары белые?}`,
                    `\\text{Вероятность попадания в цель при одном выстреле равна ${MathUtils.randomFloat(0.1, 0.9, 1)}. Найдите вероятность хотя бы одного попадания при ${MathUtils.randomInt(2, 5)} выстрелах.}`,
                    `\\text{Монету бросают ${MathUtils.randomInt(3, 10)} раз. Найдите вероятность того, что орел выпадет ровно ${MathUtils.randomInt(2, 5)} раз.}`,
                    `\\text{Из колоды в 52 карты наугад вынимают ${MathUtils.randomInt(3, 10)} карт. Какова вероятность того, что среди них будет хотя бы один туз?}`
                ];

                return MathUtils.randomChoice(probabilityTypes);
            }
        }

        return '';
    }

    // Сложные выражения высшей математики
    private generateLevel3(): string {
        const types = ['advanced-calculus', 'differential-equations', 'linear-algebra', 'complex-analysis', 'optimization'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'advanced-calculus': {
                const advancedTypes = ['limit', 'series', 'improper-integral', 'fourier'];
                const advType = MathUtils.randomChoice(advancedTypes);

                switch (advType) {
                    case 'limit': {
                        const approaches = ['\\infty', '0', 'a', '0^+', '0^-'];
                        const approach = MathUtils.randomChoice(approaches);
                        const funcs = [
                            '\\frac{1}{x}',
                            '\\frac{\\sin(x)}{x}',
                            'x^2 + 1',
                            '\\frac{e^x-1}{x}',
                            '(1 + \\frac{1}{n})^n',
                            '\\frac{\\ln(1+x)}{x}',
                            '\\frac{a^x - 1}{x}'
                        ];
                        const func = MathUtils.randomChoice(funcs);
                        return `\\lim_{x \\to ${approach}} ${func}`;
                    }

                    case 'series': {
                        const series = [
                            `\\sum_{n=1}^{\\infty} \\frac{1}{n^2}`,
                            `\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}`,
                            `\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n}`,
                            `\\sum_{n=0}^{\\infty} \\frac{1}{n!}`,
                            `\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)}`
                        ];
                        return `\\text{Исследуйте сходимость ряда } ${MathUtils.randomChoice(series)}`;
                    }

                    case 'improper-integral': {
                        const integrals = [
                            `\\int_{0}^{\\infty} e^{-x} \\, dx`,
                            `\\int_{1}^{\\infty} \\frac{1}{x^p} \\, dx`,
                            `\\int_{0}^{1} \\frac{1}{\\sqrt{x}} \\, dx`,
                            `\\int_{0}^{\\infty} \\frac{\\sin(x)}{x} \\, dx`,
                            `\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx`
                        ];
                        return `\\text{Вычислите несобственный интеграл } ${MathUtils.randomChoice(integrals)}`;
                    }

                    case 'fourier': {
                        const functions = [
                            'f(x) = x',
                            'f(x) = |x|',
                            'f(x) = \\sin(x)',
                            'f(x) = x^2',
                            'f(x) = e^x'
                        ];
                        return `\\text{Найдите ряд Фурье для функции } ${MathUtils.randomChoice(functions)}`;
                    }
                }
                return '';
            }

            case 'differential-equations': {
                const equations = [
                    `\\frac{dy}{dx} + P(x)y = Q(x)`,
                    `\\frac{d^2y}{dx^2} + 4\\frac{dy}{dx} + 4y = 0`,
                    `\\frac{d^2y}{dx^2} + \\omega^2 y = 0`,
                    `\\frac{d^2y}{dt^2} + 2\\gamma\\frac{dy}{dt} + \\omega_0^2 y = f(t)`,
                    `(x^2 - 1)\\frac{d^2y}{dx^2} + 2x\\frac{dy}{dx} + n(n+1)y = 0 \\text{ (уравнение Лежандра)}`
                ];
                return `\\text{Решите дифференциальное уравнение } ${MathUtils.randomChoice(equations)}`;
            }

            case 'linear-algebra': {
                const linearAlgebraTypes = ['determinant', 'eigenvalue', 'matrix-operations', 'linear-systems'];
                const laType = MathUtils.randomChoice(linearAlgebraTypes);

                switch (laType) {
                    case 'determinant': {
                        // Генерируем матрицу 3x3
                        const matrix = Array.from({length: 3}, () =>
                            Array.from({length: 3}, () => MathUtils.randomInt(-5, 5))
                        );

                        let matrixStr = `\\begin{vmatrix} `;
                        for (let i = 0; i < 3; i++) {
                            matrixStr += matrix[i].join(' & ');
                            if (i < 2) matrixStr += ' \\\\ ';
                        }
                        matrixStr += ` \\end{vmatrix}`;

                        return `\\text{Вычислите определитель } ${matrixStr}`;
                    }

                    case 'eigenvalue': {
                        // Генерируем простую матрицу 2x2 с целыми собственными значениями
                        const lambda1 = MathUtils.randomInt(-5, 5);
                        const lambda2 = MathUtils.randomInt(-5, 5);

                        // Для простоты, используем диагональную матрицу с добавлением шума
                        const a = lambda1 + MathUtils.randomInt(-1, 1);
                        const b = MathUtils.randomInt(-3, 3);
                        const c = MathUtils.randomInt(-3, 3);
                        const d = lambda2 + MathUtils.randomInt(-1, 1);

                        const matrixStr = `\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}`;

                        return `\\text{Найдите собственные значения и собственные векторы матрицы } ${matrixStr}`;
                    }

                    case 'matrix-operations': {
                        // Две матрицы 2x2
                        const matrix1 = Array.from({length: 2}, () =>
                            Array.from({length: 2}, () => MathUtils.randomInt(-5, 5))
                        );

                        const matrix2 = Array.from({length: 2}, () =>
                            Array.from({length: 2}, () => MathUtils.randomInt(-5, 5))
                        );

                        // Форматирование матриц
                        let matrix1Str = `\\begin{pmatrix} `;
                        for (let i = 0; i < 2; i++) {
                            matrix1Str += matrix1[i].join(' & ');
                            if (i < 1) matrix1Str += ' \\\\ ';
                        }
                        matrix1Str += ` \\end{pmatrix}`;

                        let matrix2Str = `\\begin{pmatrix} `;
                        for (let i = 0; i < 2; i++) {
                            matrix2Str += matrix2[i].join(' & ');
                            if (i < 1) matrix2Str += ' \\\\ ';
                        }
                        matrix2Str += ` \\end{pmatrix}`;

                        const operations = [
                            `A + B`,
                            `A - B`,
                            `A \\cdot B`,
                            `A^{-1}`
                        ];
                        const operation = MathUtils.randomChoice(operations);

                        return `\\text{Вычислите } ${operation} \\text{, где } A = ${matrix1Str} \\text{ и } B = ${matrix2Str}`;
                    }

                    case 'linear-systems': {
                        // Генерация системы линейных уравнений
                        const n = MathUtils.randomInt(2, 3); // Размерность 2x2 или 3x3

                        // Решение системы (случайные целые числа)
                        const solution = Array.from({length: n}, () => MathUtils.randomInt(-5, 5));

                        // Генерация коэффициентов
                        const coefficients = Array.from({length: n}, () =>
                            Array.from({length: n}, () => MathUtils.randomInt(-5, 5))
                        );

                        // Вычисление свободных членов
                        const freeTerms = Array.from({length: n}, (_, i) => {
                            let sum = 0;
                            for (let j = 0; j < n; j++) {
                                sum += coefficients[i][j] * solution[j];
                            }
                            return sum;
                        });

                        // Форматирование системы
                        let systemStr = `\\begin{cases} `;
                        for (let i = 0; i < n; i++) {
                            let rowStr = '';
                            for (let j = 0; j < n; j++) {
                                const coef = coefficients[i][j];
                                if (j === 0) {
                                    rowStr += `${coef}x_${j + 1}`;
                                } else {
                                    rowStr += ` ${coef >= 0 ? '+' : ''} ${coef}x_${j + 1}`;
                                }
                            }
                            rowStr += ` = ${freeTerms[i]}`;
                            if (i < n - 1) rowStr += ' \\\\ ';
                            systemStr += rowStr;
                        }
                        systemStr += ` \\end{cases}`;

                        return `\\text{Решите систему уравнений } ${systemStr}`;
                    }
                }
                return '';
            }

            case 'complex-analysis': {
                const complexTypes = ['complex-numbers', 'contour-integral', 'analytic-function'];
                const cType = MathUtils.randomChoice(complexTypes);

                switch (cType) {
                    case 'complex-numbers': {
                        const a1 = MathUtils.randomInt(-10, 10);
                        const b1 = MathUtils.randomInt(-10, 10);
                        const a2 = MathUtils.randomInt(-10, 10);
                        const b2 = MathUtils.randomInt(-10, 10);

                        const z1 = `${a1} ${b1 >= 0 ? '+' : ''} ${b1}i`;
                        const z2 = `${a2} ${b2 >= 0 ? '+' : ''} ${b2}i`;

                        const operations = [
                            `z_1 + z_2`,
                            `z_1 - z_2`,
                            `z_1 \\cdot z_2`,
                            `\\frac{z_1}{z_2}`,
                            `|z_1|`,
                            `\\text{arg}(z_1)`
                        ];
                        const operation = MathUtils.randomChoice(operations);

                        return `\\text{Вычислите } ${operation} \\text{, где } z_1 = ${z1} \\text{ и } z_2 = ${z2}`;
                    }

                    case 'contour-integral': {
                        const contours = [
                            `|z| = ${MathUtils.randomInt(1, 5)}`,
                            `|z - ${MathUtils.randomInt(-5, 5)}| = ${MathUtils.randomInt(1, 5)}`,
                            `\\gamma: \\text{ отрезок от } ${MathUtils.randomInt(-5, 5)} \\text{ до } ${MathUtils.randomInt(-5, 5)}`
                        ];
                        const contour = MathUtils.randomChoice(contours);

                        const functions = [
                            `f(z) = \\frac{1}{z}`,
                            `f(z) = \\frac{1}{z^2}`,
                            `f(z) = \\frac{1}{(z-a)(z-b)}`,
                            `f(z) = \\frac{z}{z^2 + 1}`,
                            `f(z) = \\frac{e^z}{z}`
                        ];
                        const func = MathUtils.randomChoice(functions);

                        return `\\text{Вычислите интеграл } \\oint_{${contour}} ${func} \\, dz`;
                    }

                    case 'analytic-function': {
                        const functions = [
                            `f(z) = e^z`,
                            `f(z) = \\sin(z)`,
                            `f(z) = \\cos(z)`,
                            `f(z) = \\ln(z)`,
                            `f(z) = \\frac{1}{z^2}`
                        ];
                        const func = MathUtils.randomChoice(functions);

                        return `\\text{Найдите все особые точки функции } ${func} \\text{ и классифицируйте их}`;
                    }
                }
                return '';
            }

            case 'optimization': {
                const optimizationTypes = ['extrema', 'lagrange', 'inequality-constraints'];
                const optType = MathUtils.randomChoice(optimizationTypes);

                switch (optType) {
                    case 'extrema': {
                        const functions = [
                            `f(x,y) = x^2 + y^2`,
                            `f(x,y) = x^2 - y^2`,
                            `f(x,y) = x^2 + xy + y^2`,
                            `f(x,y) = x^3 + y^3 - 3xy`,
                            `f(x,y) = e^{-(x^2+y^2)}`
                        ];
                        const func = MathUtils.randomChoice(functions);

                        return `\\text{Найдите экстремумы функции } ${func}`;
                    }

                    case 'lagrange': {
                        const functions = [
                            `f(x,y) = x^2 + y^2`,
                            `f(x,y) = x + y`,
                            `f(x,y) = xy`,
                            `f(x,y) = x^2 + 2y^2`
                        ];
                        const constraints = [
                            `g(x,y) = x^2 + y^2 = 1`,
                            `g(x,y) = x + y = 1`,
                            `g(x,y) = x^2 + y^2 - 2x - 2y = 0`
                        ];

                        const func = MathUtils.randomChoice(functions);
                        const constraint = MathUtils.randomChoice(constraints);

                        return `\\text{Найдите экстремумы функции } ${func} \\text{ при условии } ${constraint}`;
                    }

                    case 'inequality-constraints': {
                        const problems = [
                            `\\text{Найдите максимальное значение функции } f(x,y) = 2x + 3y \\text{ в области } x \\geq 0, y \\geq 0, x + y \\leq 10`,
                            `\\text{Найдите минимальное значение функции } f(x,y) = x^2 + y^2 \\text{ в области } x \\geq 0, y \\geq 0, 2x + 3y \\geq 6`,
                            `\\text{Найдите экстремумы функции } f(x,y) = xy \\text{ в области } x^2 + y^2 \\leq 1`
                        ];

                        return MathUtils.randomChoice(problems);
                    }
                }
                return '';
            }
        }

        return '';
    }
}

// 5. Генератор теоретико-числовых выражений
class NumberTheoryGenerator implements ExpressionGenerator {
    private level: number; // 1-3, где 3 - самый сложный

    constructor(level: number = 1) {
        this.level = Math.min(3, Math.max(1, level));
    }

    generate(): string {
        switch (this.level) {
            case 1:
                return this.generateLevel1();
            case 2:
                return this.generateLevel2();
            case 3:
                return this.generateLevel3();
            default:
                return this.generateLevel1();
        }
    }

    // Базовые концепции теории чисел
    private generateLevel1(): string {
        const types = ['divisibility', 'prime', 'gcd-lcm'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'divisibility': {
                const a = MathUtils.randomInt(10, 100);
                const b = MathUtils.randomInt(2, 20);

                return `\\text{Проверьте, делится ли } ${a} \\text{ на } ${b} \\text{ без остатка}`;
            }

            case 'prime': {
                const n = MathUtils.randomInt(10, 1000);

                return `\\text{Является ли число } ${n} \\text{ простым?}`;
            }

            case 'gcd-lcm': {
                const a = MathUtils.randomInt(10, 100);
                const b = MathUtils.randomInt(10, 100);

                const operation = MathUtils.randomChoice(['НОД', 'НОК']);

                return `\\text{Найдите ${operation}(${a}, ${b})}`;
            }
        }

        return '';
    }

    // Более сложные задачи теории чисел
    private generateLevel2(): string {
        const types = ['modular-arithmetic', 'diophantine', 'remainder'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'modular-arithmetic': {
                const a = MathUtils.randomInt(10, 100);
                const b = MathUtils.randomInt(10, 100);
                const mod = MathUtils.randomInt(5, 20);

                const operation = MathUtils.randomChoice(['+', '-', '\\times']);

                return `\\text{Найдите остаток от деления } ${a} ${operation} ${b} \\text{ на } ${mod}`;
            }

            case 'diophantine': {
                const a = MathUtils.randomInt(2, 20);
                const b = MathUtils.randomInt(2, 20);

                // Добавим случайное значение c, чтобы уравнение имело решение
                const gcd = this.gcd(a, b);
                const multiplier = MathUtils.randomInt(1, 10);
                const c = gcd * multiplier;

                return `\\text{Найдите целочисленные решения уравнения } ${a}x + ${b}y = ${c}`;
            }

            case 'remainder': {
                const base = MathUtils.randomInt(2, 10);
                const exp = MathUtils.randomInt(10, 100);
                const mod = MathUtils.randomInt(2, 20);

                return `\\text{Найдите остаток от деления } ${base}^{${exp}} \\text{ на } ${mod}`;
            }
        }

        return '';
    }

    // Продвинутые задачи теории чисел
    private generateLevel3(): string {
        const types = ['cryptography', 'euler-function', 'congruences'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'cryptography': {
                const p = MathUtils.randomChoice([2, 3, 5, 7, 11, 13, 17, 19, 23]);
                const q = MathUtils.randomChoice([2, 3, 5, 7, 11, 13, 17, 19, 23]);
                const n = p * q;
                const phi = (p - 1) * (q - 1);

                // Выбираем e так, чтобы оно было взаимно простым с phi
                let e = MathUtils.randomInt(2, phi - 1);
                while (this.gcd(e, phi) !== 1) {
                    e = MathUtils.randomInt(2, phi - 1);
                }

                return `\\text{В системе RSA заданы параметры: } p = ${p}, q = ${q}, e = ${e}. \\text{ Найдите закрытый ключ } d`;
            }

            case 'euler-function': {
                const n = MathUtils.randomInt(10, 100);

                return `\\text{Вычислите значение функции Эйлера } \\varphi(${n})`;
            }

            case 'congruences': {
                const a = MathUtils.randomInt(2, 20);
                const b = MathUtils.randomInt(1, 50);
                const m = MathUtils.randomInt(5, 30);

                // Обеспечим, чтобы уравнение имело решение
                const gcd = this.gcd(a, m);
                if (b % gcd === 0) {
                    return `\\text{Решите сравнение } ${a}x \\equiv ${b} \\pmod{${m}}`;
                } else {
                    // Если при данных параметрах решения нет, изменим b
                    const newB = b - (b % gcd);
                    return `\\text{Решите сравнение } ${a}x \\equiv ${newB} \\pmod{${m}}`;
                }
            }
        }

        return '';
    }

    // Вспомогательная функция для вычисления НОД
    private gcd(a: number, b: number): number {
        if (b === 0) return Math.abs(a);
        return this.gcd(b, a % b);
    }
}

// 6. Генератор выражений по теории вероятностей и статистике
class ProbabilityStatisticsGenerator implements ExpressionGenerator {
    private level: number; // 1-3, где 3 - самый сложный

    constructor(level: number = 1) {
        this.level = Math.min(3, Math.max(1, level));
    }

    generate(): string {
        switch (this.level) {
            case 1:
                return this.generateLevel1();
            case 2:
                return this.generateLevel2();
            case 3:
                return this.generateLevel3();
            default:
                return this.generateLevel1();
        }
    }

    // Базовые задачи по вероятности
    private generateLevel1(): string {
        const types = ['basic-probability', 'combinatorics', 'simple-distributions'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'basic-probability': {
                const scenarios = [
                    `\\text{В урне ${MathUtils.randomInt(3, 10)} белых и ${MathUtils.randomInt(3, 10)} черных шаров. Наудачу вынимают один шар. Какова вероятность того, что этот шар белый?}`,
                    `\\text{Бросают игральную кость. Какова вероятность выпадения четного числа?}`,
                    `\\text{Из колоды в 52 карты наугад вынимают одну карту. Какова вероятность того, что она будет тузом?}`,
                    `\\text{Монету подбрасывают ${MathUtils.randomInt(3, 10)} раз. Какова вероятность того, что герб выпадет ровно ${MathUtils.randomInt(1, 3)} раза?}`
                ];

                return MathUtils.randomChoice(scenarios);
            }

            case 'combinatorics': {
                const types = [
                    `\\text{Сколькими способами можно выбрать ${MathUtils.randomInt(2, 5)} предметов из ${MathUtils.randomInt(5, 10)} различных предметов?}`,
                    `\\text{Сколькими способами можно расставить ${MathUtils.randomInt(3, 8)} различных книг на полке?}`,
                    `\\text{Сколько существует трехзначных чисел, у которых все цифры различны?}`,
                    `\\text{Сколько различных слов можно получить, переставляя буквы в слове "МАТЕМАТИКА"?}`
                ];

                return MathUtils.randomChoice(types);
            }

            case 'simple-distributions': {
                const distributions = [
                    `\\text{Вероятность попадания в цель при одном выстреле равна ${MathUtils.randomFloat(0.1, 0.9, 1)}. Найдите вероятность ровно ${MathUtils.randomInt(2, 5)} попаданий при ${MathUtils.randomInt(5, 10)} выстрелах.}`,
                    `\\text{В семье ${MathUtils.randomInt(3, 6)} детей. Какова вероятность того, что среди них ровно ${MathUtils.randomInt(1, 3)} мальчиков? Считайте, что вероятность рождения мальчика равна 0.5.}`,
                    `\\text{Математическое ожидание случайной величины $X$ равно ${MathUtils.randomInt(1, 10)}, а дисперсия равна ${MathUtils.randomInt(1, 20)}. Найдите $E[3X + ${MathUtils.randomInt(1, 5)}]$ и $D[3X + ${MathUtils.randomInt(1, 5)}]$.}`
                ];

                return MathUtils.randomChoice(distributions);
            }
        }

        return '';
    }

    // Более сложные задачи по вероятности и статистике
    private generateLevel2(): string {
        const types = ['conditional-probability', 'distributions', 'statistics'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'conditional-probability': {
                const scenarios = [
                    `\\text{В первой урне ${MathUtils.randomInt(2, 5)} белых и ${MathUtils.randomInt(2, 5)} черных шаров, во второй урне ${MathUtils.randomInt(2, 5)} белых и ${MathUtils.randomInt(2, 5)} черных шаров. Из первой урны наудачу вынимают один шар и перекладывают во вторую урну. Затем из второй урны наудачу вынимают один шар. Какова вероятность того, что этот шар белый?}`,
                    `\\text{Известно, что вероятность того, что взятый наудачу студент сдаст первый экзамен, равна ${MathUtils.randomFloat(0.6, 0.9, 1)}, а второй экзамен – ${MathUtils.randomFloat(0.6, 0.9, 1)}. Вероятность того, что студент сдаст оба экзамена, равна ${MathUtils.randomFloat(0.5, 0.7, 1)}. Найдите вероятность того, что студент сдаст второй экзамен, если известно, что первый экзамен он сдал.}`,
                    `\\text{Вероятность того, что покупатель посетит первый магазин, равна ${MathUtils.randomFloat(0.3, 0.7, 1)}, второй магазин – ${MathUtils.randomFloat(0.3, 0.7, 1)}. Покупатель приобретает товар с вероятностью ${MathUtils.randomFloat(0.3, 0.7, 1)} в первом магазине и с вероятностью ${MathUtils.randomFloat(0.3, 0.7, 1)} во втором магазине. Известно, что покупатель приобрел товар. Какова вероятность того, что он посетил первый магазин?}`
                ];

                return MathUtils.randomChoice(scenarios);
            }

            case 'distributions': {
                const distributions = [
                    `\\text{Случайная величина $X$ распределена по биномиальному закону с параметрами $n = ${MathUtils.randomInt(5, 20)}$ и $p = ${MathUtils.randomFloat(0.1, 0.9, 1)}$. Найдите вероятность того, что $X = ${MathUtils.randomInt(1, 5)}$.}`,
                    `\\text{Случайная величина $X$ имеет нормальное распределение со средним $\\mu = ${MathUtils.randomInt(0, 10)}$ и дисперсией $\\sigma^2 = ${MathUtils.randomInt(1, 9)}$. Найдите вероятность того, что ${MathUtils.randomInt(-3, 3)} < X < ${MathUtils.randomInt(4, 10)}$.}`,
                    `\\text{Случайная величина $X$ распределена равномерно на отрезке $[${MathUtils.randomInt(-10, 0)}, ${MathUtils.randomInt(1, 10)}]$. Найдите $E[X]$ и $D[X]$.}`,
                    `\\text{Случайная величина $X$ имеет пуассоновское распределение с параметром $\\lambda = ${MathUtils.randomFloat(0.5, 5, 1)}$. Вычислите вероятность того, что $X = ${MathUtils.randomInt(0, 5)}$.}`
                ];

                return MathUtils.randomChoice(distributions);
            }

            case 'statistics': {
                const statisticsProblems = [
                    `\\text{Дана выборка значений: $${Array.from({length: 10}, () => MathUtils.randomInt(1, 20)).join(', ')}$. Найдите выборочное среднее и выборочную дисперсию.}`,
                    `\\text{По выборке объема $n = ${MathUtils.randomInt(10, 50)}$ получена выборочная дисперсия $s^2 = ${MathUtils.randomFloat(1, 10, 2)}$. Постройте $95\\%$-й доверительный интервал для дисперсии нормально распределенной генеральной совокупности.}`,
                    `\\text{Выборочный коэффициент корреляции между признаками $X$ и $Y$ равен $r = ${MathUtils.randomFloat(0.5, 0.95, 2)}$. Объем выборки равен $n = ${MathUtils.randomInt(10, 50)}$. Проверьте гипотезу о значимости корреляции при уровне значимости $\\alpha = 0.05$.}`,
                    `\\text{При уровне значимости $\\alpha = 0.05$ проверить гипотезу о равенстве дисперсий двух нормальных совокупностей, если объемы выборок $n_1 = ${MathUtils.randomInt(10, 30)}$, $n_2 = ${MathUtils.randomInt(10, 30)}$, а выборочные дисперсии $s_1^2 = ${MathUtils.randomFloat(1, 10, 2)}$, $s_2^2 = ${MathUtils.randomFloat(1, 10, 2)}$.}`
                ];

                return MathUtils.randomChoice(statisticsProblems);
            }
        }

        return '';
    }

    // Продвинутые задачи по теории вероятностей и статистике
    private generateLevel3(): string {
        const types = ['markov-chains', 'hypothesis-testing', 'stochastic-processes', 'regression-analysis'];
        const type = MathUtils.randomChoice(types);

        switch (type) {
            case 'markov-chains': {
                // Генерируем матрицу переходных вероятностей размера 3x3
                const generateStochasticMatrix = (): number[][] => {
                    const matrix = [];
                    for (let i = 0; i < 3; i++) {
                        const row = [];
                        let sum = 0;
                        for (let j = 0; j < 2; j++) {
                            const prob = MathUtils.randomFloat(0.1, 0.9, 2);
                            sum += prob;
                            row.push(prob);
                        }
                        row.push(Number((1 - sum).toFixed(2)));
                        matrix.push(row);
                    }
                    return matrix;
                };

                const matrix = generateStochasticMatrix();
                let matrixStr = `P = \\begin{pmatrix} `;
                for (let i = 0; i < 3; i++) {
                    matrixStr += matrix[i].join(' & ');
                    if (i < 2) matrixStr += ' \\\\ ';
                }
                matrixStr += ` \\end{pmatrix}`;

                const problems = [
                    `\\text{Цепь Маркова задана матрицей переходных вероятностей } ${matrixStr}. \\text{ Найдите вероятность перехода из состояния } ${MathUtils.randomInt(1, 3)} \\text{ в состояние } ${MathUtils.randomInt(1, 3)} \\text{ за два шага.}`,
                    `\\text{Цепь Маркова задана матрицей переходных вероятностей } ${matrixStr}. \\text{ Найдите стационарное распределение цепи.}`,
                    `\\text{Цепь Маркова задана матрицей переходных вероятностей } ${matrixStr}. \\text{ Определите, является ли матрица эргодической.}`,
                    `\\text{Цепь Маркова задана матрицей переходных вероятностей } ${matrixStr}. \\text{ Начальное распределение вероятностей равно } \\pi^{(0)} = (${MathUtils.randomFloat(0.1, 0.5, 2)}, ${MathUtils.randomFloat(0.1, 0.5, 2)}, ${MathUtils.randomFloat(0.1, 0.5, 2)}). \\text{ Найдите распределение вероятностей после первого шага.}`
                ];

                return MathUtils.randomChoice(problems);
            }

            case 'hypothesis-testing': {
                const tests = [
                    `\\text{Из нормальной совокупности с неизвестными параметрами взята выборка объема $n = ${MathUtils.randomInt(20, 100)}$, для которой выборочное среднее $\\overline{x} = ${MathUtils.randomFloat(30, 70, 2)}$, а выборочное среднее квадратичное отклонение $s = ${MathUtils.randomFloat(2, 10, 2)}$. Проверьте при уровне значимости $\\alpha = 0.05$ гипотезу $H_0: \\mu = ${MathUtils.randomInt(30, 70)}$ против альтернативной гипотезы $H_1: \\mu \\neq ${MathUtils.randomInt(30, 70)}$.}`,
                    `\\text{По двум независимым выборкам объемов $n_1 = ${MathUtils.randomInt(20, 50)}$ и $n_2 = ${MathUtils.randomInt(20, 50)}$, извлеченным из нормальных совокупностей, найдены выборочные средние $\\overline{x}_1 = ${MathUtils.randomFloat(10, 50, 1)}$ и $\\overline{x}_2 = ${MathUtils.randomFloat(10, 50, 1)}$ и выборочные дисперсии $s_1^2 = ${MathUtils.randomFloat(1, 10, 2)}$ и $s_2^2 = ${MathUtils.randomFloat(1, 10, 2)}$. При уровне значимости $\\alpha = 0.05$ проверьте гипотезу о равенстве математических ожиданий двух совокупностей.}`,
                    `\\text{В двух группах студентов проведен экзамен. В первой группе из $n_1 = ${MathUtils.randomInt(20, 50)}$ студентов успешно сдали экзамен $m_1 = ${MathUtils.randomInt(10, 20)}$ человек, а во второй группе из $n_2 = ${MathUtils.randomInt(20, 50)}$ студентов — $m_2 = ${MathUtils.randomInt(10, 20)}$ человек. При уровне значимости $\\alpha = 0.05$ проверьте гипотезу о равенстве вероятностей успешной сдачи экзамена в двух группах.}`,
                    `\\text{Для проверки гипотезы о равенстве средних значений двух совокупностей используется критерий Стьюдента. При альтернативной гипотезе $H_1: \\mu_1 > \\mu_2$ было получено значение статистики $t = ${MathUtils.randomFloat(1.5, 3.5, 2)}$. Объемы выборок равны $n_1 = ${MathUtils.randomInt(15, 30)}$ и $n_2 = ${MathUtils.randomInt(15, 30)}$. Можно ли при уровне значимости $\\alpha = 0.05$ отвергнуть нулевую гипотезу?}`
                ];

                return MathUtils.randomChoice(tests);
            }

            case 'stochastic-processes': {
                const processes = [
                    `\\text{Пуассоновский процесс имеет интенсивность $\\lambda = ${MathUtils.randomFloat(0.5, 5, 1)}$ событий в минуту. Найдите вероятность того, что за промежуток времени $t = ${MathUtils.randomInt(2, 10)}$ минут произойдет ровно $k = ${MathUtils.randomInt(2, 10)}$ событий.}`,
                    `\\text{Время обслуживания клиента в банке имеет экспоненциальное распределение со средним значением $\\mu = ${MathUtils.randomInt(3, 10)}$ минут. Найдите вероятность того, что обслуживание клиента займет не более $t = ${MathUtils.randomInt(3, 20)}$ минут.}`,
                    `\\text{Система массового обслуживания состоит из ${MathUtils.randomInt(2, 5)} каналов. Интенсивность потока заявок $\\lambda = ${MathUtils.randomInt(2, 10)}$ заявок в час, среднее время обслуживания одной заявки $\\mu = ${MathUtils.randomInt(10, 30)}$ минут. Найдите вероятность того, что все каналы заняты.}`,
                    `\\text{Винеровский процесс (броуновское движение) имеет параметр диффузии $\\sigma^2 = ${MathUtils.randomInt(1, 5)}$. Найдите вероятность того, что за время $t = ${MathUtils.randomInt(1, 5)}$ процесс достигнет уровня $a = ${MathUtils.randomInt(5, 15)}$.}`
                ];

                return MathUtils.randomChoice(processes);
            }

            case 'regression-analysis': {
                const regression = [
                    `\\text{По данным наблюдений }
                    \\begin{array}{|c|c|c|c|c|c|}
                    \\hline
                    x & ${MathUtils.randomInt(1, 5)} & ${MathUtils.randomInt(6, 10)} & ${MathUtils.randomInt(11, 15)} & ${MathUtils.randomInt(16, 20)} & ${MathUtils.randomInt(21, 25)} \\\\
                    \\hline
                    y & ${MathUtils.randomInt(10, 20)} & ${MathUtils.randomInt(20, 30)} & ${MathUtils.randomInt(30, 40)} & ${MathUtils.randomInt(40, 50)} & ${MathUtils.randomInt(50, 60)} \\\\
                    \\hline
                    \\end{array}
                    \\text{ постройте линейную регрессионную модель $y = ax + b$ и оцените её качество.}`,
                    `\\text{Коэффициент линейной корреляции между признаками $X$ и $Y$ равен $r = ${MathUtils.randomFloat(0.7, 0.95, 2)}$. Выборочная дисперсия признака $X$ равна $s_X^2 = ${MathUtils.randomFloat(5, 15, 2)}$, а признака $Y$ — $s_Y^2 = ${MathUtils.randomFloat(10, 20, 2)}$. Найдите коэффициенты линейной регрессии $Y$ на $X$.}`,
                    `\\text{Для построения линейной регрессионной модели были получены следующие оценки: $\\sum_{i=1}^{n} x_i^2 = ${MathUtils.randomInt(500, 1000)}$, $\\sum_{i=1}^{n} x_i y_i = ${MathUtils.randomInt(300, 800)}$, $\\sum_{i=1}^{n} x_i = ${MathUtils.randomInt(50, 150)}$, $\\sum_{i=1}^{n} y_i = ${MathUtils.randomInt(100, 300)}$, $n = ${MathUtils.randomInt(20, 50)}$. Найдите коэффициенты регрессии.}`,
                    `\\text{Для множественной линейной регрессии получены следующие оценки: $\\hat{\\beta}_0 = ${MathUtils.randomFloat(1, 10, 2)}$, $\\hat{\\beta}_1 = ${MathUtils.randomFloat(0.5, 2, 2)}$, $\\hat{\\beta}_2 = ${MathUtils.randomFloat(-2, -0.5, 2)}$. Стандартные ошибки коэффициентов равны $se(\\hat{\\beta}_0) = ${MathUtils.randomFloat(0.1, 0.5, 2)}$, $se(\\hat{\\beta}_1) = ${MathUtils.randomFloat(0.1, 0.5, 2)}$, $se(\\hat{\\beta}_2) = ${MathUtils.randomFloat(0.1, 0.5, 2)}$. При уровне значимости $\\alpha = 0.05$ проверьте гипотезу о значимости коэффициента $\\beta_1$.}`
                ];

                return MathUtils.randomChoice(regression);
            }
        }

        return '';
    }
}

// Класс-фабрика для создания генераторов в зависимости от типа и уровня
class MathExpressionGeneratorFactory {
    static createGenerator(type: string, level: number): ExpressionGenerator {
        switch (type) {
            case 'elementary':
                return new ElementaryArithmeticGenerator(level);
            case 'middle-school':
                return new MiddleSchoolGenerator(level);
            case 'high-school':
                return new HighSchoolGenerator(level);
            case 'advanced':
                return new AdvancedMathGenerator(level);
            case 'number-theory':
                return new NumberTheoryGenerator(level);
            case 'probability-statistics':
                return new ProbabilityStatisticsGenerator(level);
            default:
                return new ElementaryArithmeticGenerator(level);
        }
    }
}

// Главный класс приложения
export class MathExpressionGeneratorApp {
    private currentGenerator: ExpressionGenerator;

    constructor(type: string, level: 1|2|3) {
        this.currentGenerator = MathExpressionGeneratorFactory.createGenerator(type, level);
    }

    // Устанавливаем тип и уровень сложности
    setGeneratorType(type: string, level: 1|2|3): void {
        this.currentGenerator = MathExpressionGeneratorFactory.createGenerator(type, level);
    }

    // Генерируем выражение в соответствии с текущими настройками
    generateExpression(): string {
        return this.currentGenerator.generate();
    }

    // Генерируем набор выражений заданного размера
    generateExpressionSet(count: number): string[] {
        const expressions = [];
        for (let i = 0; i < count; i++) {
            expressions.push(this.currentGenerator.generate());
        }
        return expressions;
    }
}

// Пример использования
// const app = new MathExpressionGeneratorApp();

// // Настройка для начальной школы, уровень 2
// app.setGeneratorType('elementary', 2);
// console.log('Выражения для начальной школы (уровень 2):');
// console.log(app.generateExpressionSet(3).join('\n'));
//
// // Настройка для средней школы, уровень 3
// app.setGeneratorType('middle-school', 3);
// console.log('\nВыражения для средней школы (уровень 3):');
// console.log(app.generateExpressionSet(3).join('\n'));
//
// // Настройка для старшей школы, уровень 2
// app.setGeneratorType('high-school', 2);
// console.log('\nВыражения для старшей школы (уровень 2):');
// console.log(app.generateExpressionSet(3).join('\n'));
//
// // Настройка для высшей математики, уровень 1
// app.setGeneratorType('advanced', 1);
// console.log('\nВыражения для высшей математики (уровень 1):');
// console.log(app.generateExpressionSet(3).join('\n'));
//
// // Настройка для теории чисел, уровень 2
// app.setGeneratorType('number-theory', 2);
// console.log('\nВыражения для теории чисел (уровень 2):');
// console.log(app.generateExpressionSet(3).join('\n'));
//
// // Настройка для теории вероятностей и статистики, уровень 3
// app.setGeneratorType('probability-statistics', 3);
// console.log('\nВыражения для теории вероятностей и статистики (уровень 3):');
// console.log(app.generateExpressionSet(3).join('\n'));