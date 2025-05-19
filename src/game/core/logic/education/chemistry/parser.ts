interface ChemicalElement {
    element: string;
    count: number;
}

interface ChemicalCompound {
    formula: string;
    elements: ChemicalElement[];
    coefficient: number;
}

interface ParsedEquation {
    reactants: ChemicalCompound[];
    products: ChemicalCompound[];
    isBalanced: boolean;
}

export class MhchemParser {
    /**
     * Парсит химическое уравнение в формате mhchem
     * Пример входных данных: "\\ce{2H2 + O2 -> 2H2O}"
     */
    parseEquation(equation: string): ParsedEquation {
        // Удаляем \ce{} обертку, если она присутствует
        let cleanedEquation = equation.replace(/\\ce\{|\}/g, '');

        // Разделяем уравнение на реагенты и продукты по стрелке
        const parts = cleanedEquation.split('->');
        if (parts.length !== 2) {
            throw new Error('Некорректное уравнение: не найдена стрелка реакции');
        }

        // Парсим реагенты и продукты
        const reactantsString = parts[0].trim();
        const productsString = parts[1].trim();

        const reactants = this.parseCompounds(reactantsString);
        const products = this.parseCompounds(productsString);

        // Проверяем, сбалансировано ли уравнение
        const isBalanced = this.checkBalance(reactants, products);

        return {
            reactants,
            products,
            isBalanced
        };
    }

    /**
     * Парсит строку с соединениями, разделенными знаками +
     */
    private parseCompounds(compoundsString: string): ChemicalCompound[] {
        const compounds: ChemicalCompound[] = [];

        // Разделяем по знаку +
        const compoundStrings = compoundsString.split('+').map(s => s.trim());

        for (const compoundString of compoundStrings) {
            // Извлекаем коэффициент в начале формулы
            const coefficientMatch = compoundString.match(/^(\d+)(.+)$/);

            let coefficient = 1;
            let formula = compoundString;

            if (coefficientMatch) {
                coefficient = parseInt(coefficientMatch[1], 10);
                formula = coefficientMatch[2].trim();
            }

            // Парсим элементы и их количество в соединении
            const elements = this.parseElements(formula);

            compounds.push({
                formula,
                elements,
                coefficient
            });
        }

        return compounds;
    }

    /**
     * Парсит химическую формулу на отдельные элементы
     */
    private parseElements(formula: string): ChemicalElement[] {
        const elements: ChemicalElement[] = [];
        // Регулярное выражение для поиска элементов:
        // Элемент начинается с заглавной буквы, за которой может следовать строчная буква,
        // а затем опционально числовой индекс
        const elementRegex = /([A-Z][a-z]?)(\d*)/g;

        let match;
        while ((match = elementRegex.exec(formula)) !== null) {
            const element = match[1];
            const countStr = match[2];
            const count = countStr ? parseInt(countStr, 10) : 1;

            // Проверяем, есть ли уже такой элемент
            const existingElement = elements.find(e => e.element === element);
            if (existingElement) {
                existingElement.count += count;
            } else {
                elements.push({ element, count });
            }
        }

        return elements;
    }

    /**
     * Проверяет, сбалансировано ли уравнение, подсчитывая атомы
     * каждого элемента с обеих сторон уравнения
     */
    private checkBalance(reactants: ChemicalCompound[], products: ChemicalCompound[]): boolean {
        const reactantsElementCount = this.countElements(reactants);
        const productsElementCount = this.countElements(products);

        // Проверяем, совпадает ли количество элементов
        if (Object.keys(reactantsElementCount).length !== Object.keys(productsElementCount).length) {
            return false;
        }

        // Проверяем, совпадает ли количество атомов каждого элемента
        for (const element in reactantsElementCount) {
            if (!productsElementCount[element] ||
                reactantsElementCount[element] !== productsElementCount[element]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Подсчитывает общее количество атомов каждого элемента
     */
    private countElements(compounds: ChemicalCompound[]): Record<string, number> {
        const elementCount: Record<string, number> = {};

        for (const compound of compounds) {
            for (const element of compound.elements) {
                // Общее количество атомов = количество атомов в молекуле * коэффициент
                const count = element.count * compound.coefficient;

                if (elementCount[element.element]) {
                    elementCount[element.element] += count;
                } else {
                    elementCount[element.element] = count;
                }
            }
        }

        return elementCount;
    }

    /**
     * Преобразует распарсенное уравнение обратно в строку формата mhchem
     */
    formatEquation(parsedEquation: ParsedEquation): string {
        const formatCompound = (compound: ChemicalCompound): string => {
            return (compound.coefficient > 1 ? compound.coefficient : '') + compound.formula;
        };

        const reactantsStr = parsedEquation.reactants.map(formatCompound).join(' + ');
        const productsStr = parsedEquation.products.map(formatCompound).join(' + ');

        return `\\ce{${reactantsStr} -> ${productsStr}}`;
    }
}

// Пример использования
function example() {
    const parser = new MhchemParser();

    // Пример 1: Сбалансированное уравнение
    const equation1 = "\\ce{2H2 + O2 -> 2H2O}";
    const parsed1 = parser.parseEquation(equation1);
    console.log('Уравнение 1:', equation1);
    console.log('Реагенты:', parsed1.reactants);
    console.log('Продукты:', parsed1.products);
    console.log('Сбалансировано:', parsed1.isBalanced);

    // Пример 2: Несбалансированное уравнение
    const equation2 = "\\ce{H2 + O2 -> H2O}";
    const parsed2 = parser.parseEquation(equation2);
    console.log('\nУравнение 2:', equation2);
    console.log('Реагенты:', parsed2.reactants);
    console.log('Продукты:', parsed2.products);
    console.log('Сбалансировано:', parsed2.isBalanced);

    // Пример 3: Сложное уравнение
    const equation3 = "\\ce{2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 8H2O + 5Cl2}";
    const parsed3 = parser.parseEquation(equation3);
    console.log('\nУравнение 3:', equation3);
    console.log('Реагенты:', parsed3.reactants);
    console.log('Продукты:', parsed3.products);
    console.log('Сбалансировано:', parsed3.isBalanced);
}

// Запуск примера
// example();
