import {MathObject} from "../../mathObject.ts";
import {Computable, RenderOptions, Visualizable} from "../../../../../../utils/math/graphics.ts";

/**
 * Класс для работы с матрицами
 */
export class Matrix extends MathObject implements Visualizable, Computable<Matrix> {
    private data: number[][];
    private rows: number;
    private cols: number;

    constructor(data: number[][], name: string = "Matrix", description?: string) {
        super(name, description);
        if (data.length === 0 || data[0].length === 0) {
            throw new Error('Matrix cannot have zero dimensions');
        }

        this.rows = data.length;
        this.cols = data[0].length;

        // Проверяем, что все строки имеют одинаковую длину
        for (const row of data) {
            if (row.length !== this.cols) {
                throw new Error('All rows in the matrix must have the same length');
            }
        }

        // Создаем глубокую копию данных
        this.data = data.map(row => [...row]);
    }

    get(row: number, col: number): number {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw new Error('Index out of bounds');
        }
        return this.data[row][col];
    }

    set(row: number, col: number, value: number): void {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw new Error('Index out of bounds');
        }
        this.data[row][col] = value;
    }

    getRows(): number {
        return this.rows;
    }

    getCols(): number {
        return this.cols;
    }

    getData(): number[][] {
        return this.data.map(row => [...row]);
    }

    add(other: Matrix): Matrix {
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error('Matrices must have the same dimensions for addition');
        }

        const result: number[][] = [];
        for (let i = 0; i < this.rows; i++) {
            result[i] = [];
            for (let j = 0; j < this.cols; j++) {
                result[i][j] = this.data[i][j] + other.data[i][j];
            }
        }

        return new Matrix(result, `${this.name} + ${other.name}`);
    }

    subtract(other: Matrix): Matrix {
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error('Matrices must have the same dimensions for subtraction');
        }

        const result: number[][] = [];
        for (let i = 0; i < this.rows; i++) {
            result[i] = [];
            for (let j = 0; j < this.cols; j++) {
                result[i][j] = this.data[i][j] - other.data[i][j];
            }
        }

        return new Matrix(result, `${this.name} - ${other.name}`);
    }

    multiply(other: Matrix): Matrix {
        if (this.cols !== other.rows) {
            throw new Error('Number of columns in first matrix must equal number of rows in second matrix');
        }

        const result: number[][] = [];
        for (let i = 0; i < this.rows; i++) {
            result[i] = [];
            for (let j = 0; j < other.cols; j++) {
                result[i][j] = 0;
                for (let k = 0; k < this.cols; k++) {
                    result[i][j] += this.data[i][k] * other.data[k][j];
                }
            }
        }

        return new Matrix(result, `${this.name} × ${other.name}`);
    }

    scalarMultiply(scalar: number): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < this.rows; i++) {
            result[i] = [];
            for (let j = 0; j < this.cols; j++) {
                result[i][j] = this.data[i][j] * scalar;
            }
        }

        return new Matrix(result, `${scalar} × ${this.name}`);
    }

    transpose(): Matrix {
        const result: number[][] = [];
        for (let j = 0; j < this.cols; j++) {
            result[j] = [];
            for (let i = 0; i < this.rows; i++) {
                result[j][i] = this.data[i][j];
            }
        }

        return new Matrix(result, `${this.name}ᵀ`);
    }

    determinant(): number {
        if (this.rows !== this.cols) {
            throw new Error('Only square matrices have determinants');
        }

        if (this.rows === 1) {
            return this.data[0][0];
        }

        if (this.rows === 2) {
            return this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0];
        }

        let det = 0;
        for (let j = 0; j < this.cols; j++) {
            det += this.data[0][j] * this.cofactor(0, j);
        }

        return det;
    }

    private cofactor(row: number, col: number): number {
        const sign = (row + col) % 2 === 0 ? 1 : -1;
        return sign * this.minor(row, col).determinant();
    }

    private minor(row: number, col: number): Matrix {
        const result: number[][] = [];

        for (let i = 0, newRow = 0; i < this.rows; i++) {
            if (i === row) continue;

            result[newRow] = [];
            for (let j = 0, newCol = 0; j < this.cols; j++) {
                if (j === col) continue;
                result[newRow][newCol] = this.data[i][j];
                newCol++;
            }

            newRow++;
        }

        return new Matrix(result);
    }

    inverse(): Matrix {
        const det = this.determinant();
        if (Math.abs(det) < 1e-10) {
            throw new Error('Matrix is singular, cannot compute inverse');
        }

        // Для 2x2 матрицы есть простая формула инверсии
        if (this.rows === 2 && this.cols === 2) {
            const result: number[][] = [
                [this.data[1][1] / det, -this.data[0][1] / det],
                [-this.data[1][0] / det, this.data[0][0] / det]
            ];
            return new Matrix(result, `${this.name}⁻¹`);
        }

        // Для больших матриц используем матрицу кофакторов
        const adjugate: number[][] = [];
        for (let i = 0; i < this.rows; i++) {
            adjugate[i] = [];
            for (let j = 0; j < this.cols; j++) {
                adjugate[i][j] = this.cofactor(j, i); // Транспонирование включено: меняем i и j
            }
        }

        const inverseMatrix = new Matrix(adjugate).scalarMultiply(1 / det);
        inverseMatrix.setName(`${this.name}⁻¹`);
        return inverseMatrix;
    }

    eigenvalues(): number[] {
        if (this.rows !== this.cols) {
            throw new Error('Only square matrices have eigenvalues');
        }

        // Упрощенная реализация для 2x2 матриц
        if (this.rows === 2) {
            const a = this.data[0][0];
            const b = this.data[0][1];
            const c = this.data[1][0];
            const d = this.data[1][1];

            const trace = a + d;
            const det = a * d - b * c;

            const discriminant = trace * trace - 4 * det;

            if (discriminant < 0) {
                // Комплексные собственные значения
                return [];
            }

            const sqrtDisc = Math.sqrt(discriminant);
            return [
                (trace + sqrtDisc) / 2,
                (trace - sqrtDisc) / 2
            ];
        }

        // Для матриц размером больше 2x2 нужны более сложные алгоритмы
        throw new Error('Eigenvalue computation for matrices larger than 2x2 not implemented');
    }

    // Метод для вычисления объекта (реализация интерфейса Computable)
    compute(): Matrix {
        return this; // Для матрицы compute() просто возвращает саму матрицу
    }

    // Визуализация матрицы на холсте
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions): void {
        const cellWidth = 60;
        const cellHeight = 40;
        const padding = 10;
        const fontSize = options?.fontSize || 16;

        ctx.save();
        ctx.font = `${fontSize}px ${options?.fontFamily || 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Рисуем скобки матрицы
        const matrixWidth = this.cols * cellWidth;
        const matrixHeight = this.rows * cellHeight;
        const bracketWidth = 10;

        ctx.beginPath();
        // Левая скобка
        ctx.moveTo(padding + bracketWidth, padding);
        ctx.lineTo(padding, padding);
        ctx.lineTo(padding, padding + matrixHeight);
        ctx.lineTo(padding + bracketWidth, padding + matrixHeight);

        // Правая скобка
        ctx.moveTo(padding + matrixWidth + bracketWidth, padding);
        ctx.lineTo(padding + matrixWidth + 2 * bracketWidth, padding);
        ctx.lineTo(padding + matrixWidth + 2 * bracketWidth, padding + matrixHeight);
        ctx.lineTo(padding + matrixWidth + bracketWidth, padding + matrixHeight);

        ctx.strokeStyle = options?.color || 'black';
        ctx.stroke();

        // Рисуем элементы матрицы
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const x = padding + bracketWidth + j * cellWidth + cellWidth / 2;
                const y = padding + i * cellHeight + cellHeight / 2;

                // Число форматируем для отображения (округляем для лучшей видимости)
                let valueText = this.data[i][j].toFixed(2);
                // Убираем ненужные нули в конце
                valueText = valueText.replace(/\.?0+$/, '');

                ctx.fillStyle = options?.color || 'black';
                ctx.fillText(valueText, x, y);
            }
        }

        // Добавляем имя матрицы, если нужно
        if (options?.showLabels && this.name) {
            ctx.textAlign = 'left';
            ctx.fillText(this.name, padding, padding + matrixHeight + 20);
        }

        ctx.restore();
    }

    // Статические методы для создания специальных матриц
    static identity(size: number, name: string = "I"): Matrix {
        const data: number[][] = [];
        for (let i = 0; i < size; i++) {
            data[i] = [];
            for (let j = 0; j < size; j++) {
                data[i][j] = i === j ? 1 : 0;
            }
        }
        return new Matrix(data, name, "Identity matrix");
    }

    static zero(rows: number, cols: number, name: string = "0"): Matrix {
        const data: number[][] = [];
        for (let i = 0; i < rows; i++) {
            data[i] = [];
            for (let j = 0; j < cols; j++) {
                data[i][j] = 0;
            }
        }
        return new Matrix(data, name, "Zero matrix");
    }

    static random(rows: number, cols: number, min: number = -10, max: number = 10, name: string = "R"): Matrix {
        const data: number[][] = [];
        for (let i = 0; i < rows; i++) {
            data[i] = [];
            for (let j = 0; j < cols; j++) {
                data[i][j] = min + Math.random() * (max - min);
            }
        }
        return new Matrix(data, name, "Random matrix");
    }
}
