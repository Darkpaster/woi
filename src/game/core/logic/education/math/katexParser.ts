/**
 * Парсер для преобразования выражений KaTeX в простой текстовый вид
 */
class KaTexToPlainTextParser {
    // Соответствия KaTeX операторов простым операторам
    private static readonly operatorMappings: Record<string, string> = {
        '\\cdot': '*',
        '\\times': '*',
        '\\div': '/',
        '\\pm': '±',
        '\\mp': '∓',
        '\\lt': '<',
        '\\gt': '>',
        '\\le': '<=',
        '\\leq': '<=',
        '\\ge': '>=',
        '\\geq': '>=',
        '\\ne': '!=',
        '\\neq': '!=',
        '\\approx': '≈',
        '\\equiv': '≡',
        '\\cong': '≅',
    };

    // Команды KaTeX, которые нужно сохранить без слеша
    private static readonly preservedCommands: string[] = [
        'sqrt', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
        'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
        'log', 'ln', 'exp', 'lim', 'max', 'min', 'sup', 'inf'
    ];

    // Константы и их значения
    private static readonly constants: Record<string, number | string> = {
        '\\pi': Math.PI,
        '\\e': Math.E,
        '\\phi': 1.618033988749895, // Золотое сечение
        '\\gamma': 0.5772156649015329, // Постоянная Эйлера–Маскерони
        '\\infty': 'Infinity'
    };

    /**
     * Преобразует выражение KaTeX в простой текстовый вид
     * @param katexExpression Выражение в формате KaTeX
     * @returns Выражение в простом текстовом виде
     */
    public parse(katexExpression: string): string {
        let result = katexExpression;

        // Обработка дробей \frac{numerator}{denominator}
        result = this.parseFractions(result);

        // Замена операторов
        result = this.replaceOperators(result);

        // Замена констант
        result = this.replaceConstants(result);

        // Обработка команд, которые нужно сохранить без слеша
        result = this.processPreservedCommands(result);

        // Добавление скобок к функциям
        result = this.addParenthesesToFunctions(result);

        // Обработка степеней
        result = this.processSup(result);

        // Удаление индексов
        result = this.removeSubscripts(result);

        // Замена фигурных скобок на круглые, но только если они не являются частью команды
        result = this.replaceUnmatchedBraces(result);

        // Удаление оставшихся backslash-команд и других специальных символов
        result = this.cleanupRemainingCommands(result);

        // Замена множественных пробелов на один
        result = result.replace(/\s+/g, ' ').trim();

        return result;
    }

    /**
     * Обрабатывает дроби вида \frac{numerator}{denominator}
     */
    private parseFractions(text: string): string {
        const fracRegex = /\\frac\s*\{([^{}]+|(?:\{[^{}]*\})+)\}\s*\{([^{}]+|(?:\{[^{}]*\})+)\}/g;
        let match;
        let result = text;

        // Используем функцию для рекурсивной обработки вложенных выражений
        const processNestedFractions = (inputText: string): string => {
            let processedText = inputText;
            while ((match = fracRegex.exec(processedText)) !== null) {
                const fullMatch = match[0];
                let numerator = match[1];
                let denominator = match[2];

                // Проверяем, есть ли вложенные дроби
                if (fracRegex.test(numerator) || fracRegex.test(denominator)) {
                    numerator = processNestedFractions(numerator);
                    denominator = processNestedFractions(denominator);
                }

                // Если числитель или знаменатель содержат операции, оборачиваем их в скобки
                if (/[+\-]/.test(numerator) && !/^\(.*\)$/.test(numerator)) {
                    numerator = `(${numerator})`;
                }
                if (/[+\-*\/]/.test(denominator) && !/^\(.*\)$/.test(denominator)) {
                    denominator = `(${denominator})`;
                }

                const replacement = `${numerator} / ${denominator}`;
                processedText = processedText.replace(fullMatch, replacement);
                fracRegex.lastIndex = 0; // Сбрасываем индекс, т.к. строка изменилась
            }
            return processedText;
        };

        return processNestedFractions(result);
    }

    /**
     * Заменяет операторы KaTeX на обычные текстовые
     */
    private replaceOperators(text: string): string {
        let result = text;
        for (const [katexOp, plainOp] of Object.entries(KaTexToPlainTextParser.operatorMappings)) {
            const regex = new RegExp(this.escapeRegExp(katexOp), 'g');
            result = result.replace(regex, plainOp);
        }
        return result;
    }

    /**
     * Заменяет константы их числовыми значениями
     */
    private replaceConstants(text: string): string {
        let result = text;
        for (const [constName, constValue] of Object.entries(KaTexToPlainTextParser.constants)) {
            const regex = new RegExp(this.escapeRegExp(constName), 'g');
            result = result.replace(regex, String(constValue));
        }
        return result;
    }

    /**
     * Обрабатывает команды, которые нужно сохранить без слеша
     */
    private processPreservedCommands(text: string): string {
        let result = text;
        for (const command of KaTexToPlainTextParser.preservedCommands) {
            const regex = new RegExp(`\\\\${command}`, 'g');
            result = result.replace(regex, command);
        }
        return result;
    }

    /**
     * Добавляет скобки к математическим функциям, если после них идут аргументы
     */
    private addParenthesesToFunctions(text: string): string {
        // Находим все математические функции и добавляем к ним круглые скобки
        let result = text;

        // Паттерн для математических функций с аргументами в фигурных скобках
        const funcRegex = new RegExp(`(${KaTexToPlainTextParser.preservedCommands.join('|')})(\\s*\\{[^{}]*\\})`, 'g');

        // Заменяем функции с фигурными скобками на функции с круглыми скобками
        result = result.replace(funcRegex, (match, func, args) => {
            // Удаляем фигурные скобки и пробелы
            const cleanArgs = args.replace(/\s*\{|\}\s*/g, '');
            return `${func}(${cleanArgs})`;
        });

        return result;
    }

    /**
     * Обрабатывает степени (sup)
     */
    private processSup(text: string): string {
        // Обработка степеней: x^{2} -> x^(2) или x^2 -> x^2
        return text.replace(/\^(?:\{([^{}]+)\}|([a-zA-Z0-9]))/g, (_, group1, group2) => {
            const exponent = group1 || group2;
            if (exponent.includes(' ') || /[+\-*\/]/.test(exponent)) {
                return `^(${exponent})`;
            }
            return `^${exponent}`;
        });
    }

    /**
     * Удаляет индексы
     */
    private removeSubscripts(text: string): string {
        // Удаляем индексы вида x_{i} или x_i
        return text.replace(/_(?:\{[^{}]*\}|[a-zA-Z0-9])/g, '');
    }

    /**
     * Заменяет фигурные скобки на круглые, но только если они не являются частью команды
     */
    private replaceUnmatchedBraces(text: string): string {
        // Сначала удалим скобки, которые уже были обработаны в других методах
        let result = text;

        // Заменим оставшиеся пары фигурных скобок на круглые
        // Но делаем это итеративно для правильной обработки вложенных скобок
        const bracesRegex = /\{([^{}]*)\}/g;
        let prevResult = '';

        while (prevResult !== result) {
            prevResult = result;
            result = result.replace(bracesRegex, '($1)');
        }

        return result;
    }

    /**
     * Удаляет оставшиеся backslash-команды и другие специальные символы
     */
    private cleanupRemainingCommands(text: string): string {
        // Удаляем простые команды вида \command
        let result = text.replace(/\\[a-zA-Z]+/g, (match) => {
            const command = match.substring(1);
            // Возвращаем команду без слеша, если она не требует особой обработки
            return command;
        });

        // Удаляем оставшиеся одиночные слеши
        result = result.replace(/\\([^a-zA-Z])/g, '$1');

        // Удаляем команды с аргументами, которые не были обработаны
        result = result.replace(/\\[a-zA-Z]+\{[^{}]*\}/g, '');

        return result;
    }

    /**
     * Экранирует специальные символы в регулярных выражениях
     */
    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

/**
 * Парсер для преобразования простого текстового выражения обратно в формат KaTeX
 */
class PlainTextToKaTexParser {
    // Соответствия простых операторов операторам KaTeX
    private static readonly operatorMappings: Record<string, string> = {
        '*': '\\cdot ',
        '×': '\\times ',
        '÷': '\\div ',
        '±': '\\pm ',
        '∓': '\\mp ',
        '≤': '\\leq ',
        '<=': '\\leq ',
        '≥': '\\geq ',
        '>=': '\\geq ',
        '≠': '\\neq ',
        '!=': '\\neq ',
        '≈': '\\approx ',
        '≡': '\\equiv ',
        '≅': '\\cong '
    };

    // Математические функции, которые нужно предварить слешем
    private static readonly mathFunctions: string[] = [
        'sqrt', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
        'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
        'log', 'ln', 'exp', 'lim', 'max', 'min', 'sup', 'inf'
    ];

    // Константы и их обозначения в KaTeX
    private static readonly constants: Record<string, string> = {
        // Точное значение π с небольшим запасом для сравнения чисел с плавающей точкой
        [Math.PI.toString()]: '\\pi',
        [Math.E.toString()]: '\\e',
        '1.618033988749895': '\\phi', // Золотое сечение
        '0.5772156649015329': '\\gamma', // Постоянная Эйлера–Маскерони
        'Infinity': '\\infty'
    };

    /**
     * Преобразует простое текстовое выражение в формат KaTeX
     * @param plainExpression Выражение в простом текстовом виде
     * @returns Выражение в формате KaTeX
     */
    public parse(plainExpression: string): string {
        let result = plainExpression.trim();

        // Обработка выражений со знаком деления (/)
        result = this.parseDivisions(result);

        // Обработка степеней с скобками: x^(y+z) -> x^{y+z}
        result = this.processExponents(result);

        // Обработка функций: log(x) -> \log{x}
        result = this.processFunctions(result);

        // Замена операторов
        result = this.replaceOperators(result);

        // Замена констант
        result = this.replaceConstants(result);

        // Добавление слеша к математическим функциям
        result = this.processMathFunctions(result);

        return result;
    }

    /**
     * Обрабатывает выражения с делением (/) и преобразует их в \frac{}{}
     */
    private parseDivisions(text: string): string {
        // Сначала заменяем деление с круглыми скобками: (a) / (b) -> \frac{a}{b}
        let result = text.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');

        // Затем обрабатываем простые деления без скобок: a / b -> \frac{a}{b}
        // Но надо быть осторожным с операторами приоритета
        const divisionRegex = /([a-zA-Z0-9.]+|\([^()]+\))\s*\/\s*([a-zA-Z0-9.]+|\([^()]+\))/g;

        // Повторяем процесс пока находим подходящие выражения
        let match;
        while ((match = divisionRegex.exec(result)) !== null) {
            const fullMatch = match[0];
            let numerator = match[1];
            let denominator = match[2];

            // Удаляем ненужные скобки
            if (numerator.startsWith('(') && numerator.endsWith(')')) {
                numerator = numerator.slice(1, -1);
            }
            if (denominator.startsWith('(') && denominator.endsWith(')')) {
                denominator = denominator.slice(1, -1);
            }

            const replacement = `\\frac{${numerator}}{${denominator}}`;
            result = result.replace(fullMatch, replacement);
            divisionRegex.lastIndex = 0; // Сбрасываем индекс, т.к. строка изменилась
        }

        return result;
    }

    /**
     * Обрабатывает выражения со степенями
     */
    private processExponents(text: string): string {
        // Заменяем x^(y+z) на x^{y+z}
        return text.replace(/\^(\(([^()]+)\)|([a-zA-Z0-9]+))/g, (match, p1, p2) => {
            if (p2) {
                // Это случай со скобками: ^(...)
                return `^{${p2}}`;
            } else {
                // Это случай без скобок: ^x
                return `^{${p1}}`;
            }
        });
    }

    /**
     * Обрабатывает функции с аргументами в круглых скобках
     */
    private processFunctions(text: string): string {
        // Замена функций вида func(arg) на \func{arg}
        const funcPattern = new RegExp(`\\b(${PlainTextToKaTexParser.mathFunctions.join('|')})\\(([^()]+)\\)`, 'g');
        return text.replace(funcPattern, (match, func, arg) => {
            return `\\${func}{${arg}}`;
        });
    }

    /**
     * Заменяет обычные операторы на операторы KaTeX
     */
    private replaceOperators(text: string): string {
        let result = text;
        for (const [plainOp, katexOp] of Object.entries(PlainTextToKaTexParser.operatorMappings)) {
            const regex = new RegExp(this.escapeRegExp(plainOp), 'g');
            result = result.replace(regex, katexOp);
        }
        return result;
    }

    /**
     * Заменяет числовые значения констант на их обозначения в KaTeX
     */
    private replaceConstants(text: string): string {
        let result = text;

        // Точное совпадение для констант
        for (const [constValue, constName] of Object.entries(PlainTextToKaTexParser.constants)) {
            const regex = new RegExp(`\\b${this.escapeRegExp(constValue)}\\b`, 'g');
            result = result.replace(regex, constName);
        }

        // Приблизительное совпадение для π и e
        // Для π: ищем примерно 3.14159...
        result = result.replace(/\b3\.1415\d*\b/g, '\\pi');

        // Для e: ищем примерно 2.71828...
        result = result.replace(/\b2\.7182\d*\b/g, '\\e');

        return result;
    }

    /**
     * Добавляет слеш к математическим функциям
     */
    private processMathFunctions(text: string): string {
        let result = text;
        for (const func of PlainTextToKaTexParser.mathFunctions) {
            const regex = new RegExp(`\\b${func}\\b(?!\\{)`, 'g');
            result = result.replace(regex, `\\${func}`);
        }
        return result;
    }

    /**
     * Экранирует специальные символы в регулярных выражениях
     */
    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

export { KaTexToPlainTextParser, PlainTextToKaTexParser };