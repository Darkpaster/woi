import {RenderOptions} from "../../../../../../../utils/math/graphics.ts";

export class NumberTheory {
    // Наибольший общий делитель (алгоритм Евклида)
    static gcd(a: number, b: number): number {
        a = Math.abs(Math.floor(a));
        b = Math.abs(Math.floor(b));

        if (b === 0) {
            return a;
        }

        return NumberTheory.gcd(b, a % b);
    }

    // Наименьшее общее кратное
    static lcm(a: number, b: number): number {
        a = Math.abs(Math.floor(a));
        b = Math.abs(Math.floor(b));

        return (a * b) / NumberTheory.gcd(a, b);
    }

    // Расширенный алгоритм Евклида (возвращает коэффициенты Безу)
    static extendedGcd(a: number, b: number): { gcd: number, x: number, y: number } {
        a = Math.abs(Math.floor(a));
        b = Math.abs(Math.floor(b));

        if (b === 0) {
            return { gcd: a, x: 1, y: 0 };
        }

        const { gcd, x: x1, y: y1 } = NumberTheory.extendedGcd(b, a % b);
        const x = y1;
        const y = x1 - Math.floor(a / b) * y1;

        return { gcd, x, y };
    }

    // Проверка на простоту числа
    static isPrime(n: number): boolean {
        n = Math.abs(Math.floor(n));

        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;

        const sqrtN = Math.sqrt(n);
        for (let i = 5; i <= sqrtN; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) {
                return false;
            }
        }

        return true;
    }

    // Решето Эратосфена для нахождения всех простых чисел до n
    static sieveOfEratosthenes(n: number): number[] {
        n = Math.abs(Math.floor(n));

        const sieve = Array(n + 1).fill(true);
        sieve[0] = sieve[1] = false;

        for (let i = 2; i * i <= n; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= n; j += i) {
                    sieve[j] = false;
                }
            }
        }

        const primes: number[] = [];
        for (let i = 2; i <= n; i++) {
            if (sieve[i]) {
                primes.push(i);
            }
        }

        return primes;
    }

    // Разложение числа на простые множители
    static primeFactorization(n: number): { prime: number, power: number }[] {
        n = Math.abs(Math.floor(n));

        if (n <= 1) {
            return [];
        }

        const factors: { prime: number, power: number }[] = [];

        // Проверяем множитель 2 отдельно для оптимизации
        let power = 0;
        while (n % 2 === 0) {
            power++;
            n /= 2;
        }

        if (power > 0) {
            factors.push({ prime: 2, power });
        }

        // Проверяем нечетные числа до sqrt(n)
        for (let i = 3; i * i <= n; i += 2) {
            power = 0;
            while (n % i === 0) {
                power++;
                n /= i;
            }

            if (power > 0) {
                factors.push({ prime: i, power });
            }
        }

        // Если осталось простое число > sqrt(n)
        if (n > 2) {
            factors.push({ prime: n, power: 1 });
        }

        return factors;
    }

    // Функция Эйлера (количество чисел < n взаимно простых с n)
    static eulerTotient(n: number): number {
        n = Math.abs(Math.floor(n));

        if (n <= 1) {
            return n;
        }

        // Вычисляем, используя формулу через разложение на простые множители
        const factors = NumberTheory.primeFactorization(n);

        let result = n;
        for (const { prime } of factors) {
            result *= (1 - 1 / prime);
        }

        return Math.floor(result);
    }

    // Визуализация простых чисел
    static renderPrimeVisualization(
        ctx: CanvasRenderingContext2D,
        maxNumber: number,
        options?: RenderOptions & { cellSize?: number }
    ): void {
        const cellSize = options?.cellSize || 20;
        const padding = 10;

        // Определяем размеры сетки
        const cols = Math.ceil(Math.sqrt(maxNumber));
        const rows = Math.ceil(maxNumber / cols);

        ctx.save();

        // Рисуем сетку
        ctx.beginPath();
        for (let i = 0; i <= rows; i++) {
            ctx.moveTo(padding, padding + i * cellSize);
            ctx.lineTo(padding + cols * cellSize, padding + i * cellSize);
        }

        for (let j = 0; j <= cols; j++) {
            ctx.moveTo(padding + j * cellSize, padding);
            ctx.lineTo(padding + j * cellSize, padding + rows * cellSize);
        }

        ctx.strokeStyle = options?.color || '#ddd';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Находим простые числа
        const primes = NumberTheory.sieveOfEratosthenes(maxNumber);
        const primeSet = new Set(primes);

        // Рисуем числа
        ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let num = 1; num <= maxNumber; num++) {
            const row = Math.floor((num - 1) / cols);
            const col = (num - 1) % cols;

            const x = padding + col * cellSize + cellSize / 2;
            const y = padding + row * cellSize + cellSize / 2;

            // Закрашиваем фон для простых чисел
            if (primeSet.has(num)) {
                ctx.fillStyle = options?.fillStyle || 'rgba(255, 100, 100, 0.6)';
                ctx.fillRect(
                    padding + col * cellSize + 1,
                    padding + row * cellSize + 1,
                    cellSize - 2,
                    cellSize - 2
                );
            }

            // Отображаем число
            ctx.fillStyle = options?.color || 'black';
            ctx.fillText(num.toString(), x, y);
        }

        // Добавляем легенду
        if (options?.showLabels) {
            ctx.fillStyle = options?.color || 'black';
            ctx.textAlign = 'left';
            ctx.fillText('Prime numbers visualization', padding, padding + rows * cellSize + 20);
        }

        ctx.restore();
    }
}