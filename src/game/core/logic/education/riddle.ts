// RiddleQuest - TypeScript библиотека загадок с рендером на Canvas 2D
// Файл: riddle-quests.ts

/**
 * Основные типы загадок
 */
export enum RiddleType {
    FIND_OBJECT, // Найти объект на изображении
    WORD_PUZZLE, // Ввести правильное слово
    CONNECT_DOTS, // Соединить точки в правильном порядке
    REVEAL_HIDDEN, // Раскрыть скрытое изображение
    SEQUENCE_PUZZLE, // Найти последовательность
    MEMORY_PUZZLE, // Запомнить и повторить
    DECRYPT_MESSAGE, // Расшифровать сообщение
    PATTERN_RECOGNITION, // Распознать паттерн
    MAZE_PUZZLE, // Пройти лабиринт
    LOGICAL_PUZZLE // Решить логическую задачу
}

/**
 * Уровень сложности загадки
 */
export enum DifficultyLevel {
    EASY,
    MEDIUM,
    HARD,
    EXPERT,
    MASTER
}

/**
 * Интерфейс для загадки
 */
export interface Riddle {
    id: string;
    type: RiddleType;
    difficulty: DifficultyLevel;
    title: string;
    description: string;
    hint?: string;
    timeLimit?: number; // в секундах, если не указано - без ограничения

    // Метод для рендера загадки на канвасе
    render(ctx: CanvasRenderingContext2D, width: number, height: number): void;

    // Метод для проверки правильности ответа
    checkAnswer(answer: any): boolean;

    // Метод для получения подсказки
    getHint(): string | null;

    // Метод для обработки пользовательского ввода
    handleInput(inputType: string, data: any): void;

    // Метод для обновления состояния загадки (если нужно)
    update(deltaTime: number): void;
}

/**
 * Базовый класс для всех загадок
 */
export abstract class BaseRiddle implements Riddle {
    id: string;
    type: RiddleType;
    difficulty: DifficultyLevel;
    title: string;
    description: string;
    hint?: string;
    timeLimit?: number;

    protected resources: Map<string, any> = new Map();
    protected isActive: boolean = false;
    protected currentTime: number = 0;

    constructor(
        id: string,
        type: RiddleType,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        hint?: string,
        timeLimit?: number
    ) {
        this.id = id;
        this.type = type;
        this.difficulty = difficulty;
        this.title = title;
        this.description = description;
        this.hint = hint;
        this.timeLimit = timeLimit;
    }

    abstract render(ctx: CanvasRenderingContext2D, width: number, height: number): void;

    abstract checkAnswer(answer: any): boolean;

    getHint(): string | null {
        return this.hint || null;
    }

    handleInput(inputType: string, data: any): void {
        // По умолчанию ничего не делает, реализация в дочерних классах
    }

    update(deltaTime: number): void {
        if (this.isActive && this.timeLimit) {
            this.currentTime += deltaTime;
        }
    }

    // Метод для загрузки ресурсов (изображений, звуков и т.д.)
    protected loadResources(resourceMap: { [key: string]: string }): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const [key, url] of Object.entries(resourceMap)) {
            if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif')) {
                promises.push(this.loadImage(key, url));
            } else if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
                promises.push(this.loadAudio(key, url));
            }
        }

        return Promise.all(promises).then(() => {
        });
    }

    protected loadImage(key: string, url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.resources.set(key, img);
                resolve();
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    protected loadAudio(key: string, url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.resources.set(key, audio);
                resolve();
            };
            audio.onerror = reject;
            audio.src = url;
        });
    }

    // Вспомогательные методы для рисования на канвасе
    protected drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
                       font: string = '16px Arial', color: string = 'black',
                       align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle'): void {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }

    protected drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number,
                       color: string = 'black', strokeColor?: string, lineWidth: number = 1): void {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(x, y, width, height);
        }
    }

    protected drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number,
                         color: string = 'black', strokeColor?: string, lineWidth: number = 1): void {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    }

    protected drawImage(ctx: CanvasRenderingContext2D, imageKey: string, x: number, y: number,
                        width?: number, height?: number): void {
        const image = this.resources.get(imageKey);
        if (image) {
            if (width !== undefined && height !== undefined) {
                ctx.drawImage(image, x, y, width, height);
            } else {
                ctx.drawImage(image, x, y);
            }
        }
    }
}

/**
 * Пример конкретной загадки: найти объект на изображении
 */
export class FindObjectRiddle extends BaseRiddle {
    private objectPositions: { x: number, y: number, radius: number }[] = [];
    private clickPositions: { x: number, y: number }[] = [];
    private backgroundImageKey: string;
    private objectImageKey: string;
    private requiredFinds: number;

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        backgroundImageUrl: string,
        objectImageUrl: string,
        objectPositions: { x: number, y: number, radius: number }[],
        requiredFinds: number = 1,
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.FIND_OBJECT, difficulty, title, description, hint, timeLimit);
        this.objectPositions = objectPositions;
        this.requiredFinds = requiredFinds;

        this.backgroundImageKey = 'background';
        this.objectImageKey = 'object';

        this.loadResources({
            [this.backgroundImageKey]: backgroundImageUrl,
            [this.objectImageKey]: objectImageUrl
        });
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фоновое изображение
        this.drawImage(ctx, this.backgroundImageKey, 0, 0, width, height);

        // Рисуем отметки на местах, где пользователь кликнул
        this.clickPositions.forEach(pos => {
            this.drawCircle(ctx, pos.x, pos.y, 10, 'rgba(255, 0, 0, 0.5)');
        });

        // Отображаем прогресс
        this.drawText(ctx, `Найдено: ${this.clickPositions.length}/${this.requiredFinds}`,
            width / 2, 30, '18px Arial', 'white');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            const clickX = data.x;
            const clickY = data.y;

            // Проверяем, попал ли клик в один из объектов
            for (const pos of this.objectPositions) {
                const distance = Math.sqrt(Math.pow(clickX - pos.x, 2) + Math.pow(clickY - pos.y, 2));
                if (distance <= pos.radius) {
                    // Проверяем, не кликали ли мы уже здесь
                    const alreadyClicked = this.clickPositions.some(click =>
                        Math.sqrt(Math.pow(click.x - pos.x, 2) + Math.pow(click.y - pos.y, 2)) <= pos.radius
                    );

                    if (!alreadyClicked) {
                        this.clickPositions.push({x: pos.x, y: pos.y});
                        break;
                    }
                }
            }
        }
    }

    checkAnswer(): boolean {
        return this.clickPositions.length >= this.requiredFinds;
    }
}

/**
 * Загадка с вводом слова
 */
export class WordPuzzleRiddle extends BaseRiddle {
    private correctAnswer: string;
    private currentInput: string = '';
    private backgroundImageKey: string;
    private caseSensitive: boolean;

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        backgroundImageUrl: string,
        correctAnswer: string,
        caseSensitive: boolean = false,
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.WORD_PUZZLE, difficulty, title, description, hint, timeLimit);
        this.correctAnswer = correctAnswer;
        this.caseSensitive = caseSensitive;
        this.backgroundImageKey = 'background';

        this.loadResources({
            [this.backgroundImageKey]: backgroundImageUrl
        });
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фоновое изображение
        this.drawImage(ctx, this.backgroundImageKey, 0, 0, width, height);

        // Отображаем описание загадки
        this.drawText(ctx, this.description, width / 2, height / 2 - 50, '20px Arial', 'white');

        // Отображаем поле ввода
        this.drawRect(ctx, width / 2 - 150, height / 2, 300, 40, 'rgba(255, 255, 255, 0.8)');
        this.drawText(ctx, this.currentInput || 'Введите ответ...', width / 2, height / 2 + 20,
            '18px Arial', this.currentInput ? 'black' : 'gray');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'text') {
            this.currentInput = data.toString();
        }
    }

    checkAnswer(): boolean {
        if (this.caseSensitive) {
            return this.currentInput === this.correctAnswer;
        } else {
            return this.currentInput.toLowerCase() === this.correctAnswer.toLowerCase();
        }
    }
}

/**
 * Загадка с соединением точек
 */
export class ConnectDotsRiddle extends BaseRiddle {
    private dots: { x: number, y: number, id: number }[] = [];
    private connections: { from: number, to: number }[] = [];
    private correctSequence: number[];
    private currentSequence: number[] = [];

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        dots: { x: number, y: number, id: number }[],
        correctSequence: number[],
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.CONNECT_DOTS, difficulty, title, description, hint, timeLimit);
        this.dots = dots;
        this.correctSequence = correctSequence;
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фон
        this.drawRect(ctx, 0, 0, width, height, '#f0f0f0');

        // Рисуем соединения между точками
        if (this.currentSequence.length > 1) {
            ctx.beginPath();

            // Берем первую точку
            const firstDotId = this.currentSequence[0];
            const firstDot = this.dots.find(d => d.id === firstDotId);

            if (firstDot) {
                ctx.moveTo(firstDot.x, firstDot.y);

                // Соединяем с остальными точками
                for (let i = 1; i < this.currentSequence.length; i++) {
                    const currentDotId = this.currentSequence[i];
                    const currentDot = this.dots.find(d => d.id === currentDotId);

                    if (currentDot) {
                        ctx.lineTo(currentDot.x, currentDot.y);
                    }
                }

                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Рисуем точки
        this.dots.forEach(dot => {
            // Определяем, выбрана ли эта точка
            const isSelected = this.currentSequence.includes(dot.id);

            // Определяем порядковый номер точки в последовательности
            const sequenceIndex = this.currentSequence.indexOf(dot.id);

            this.drawCircle(ctx, dot.x, dot.y, 15,
                isSelected ? 'rgba(0, 128, 255, 0.7)' : 'rgba(100, 100, 100, 0.7)',
                'black', 2);

            this.drawText(ctx, dot.id.toString(), dot.x, dot.y, '14px Arial', 'white');

            // Если точка выбрана, показываем её порядковый номер
            if (isSelected) {
                this.drawCircle(ctx, dot.x + 20, dot.y - 20, 10, 'rgba(255, 0, 0, 0.7)');
                this.drawText(ctx, (sequenceIndex + 1).toString(), dot.x + 20, dot.y - 20, '12px Arial', 'white');
            }
        });

        // Отображаем инструкцию
        this.drawText(ctx, this.description, width / 2, 30, '18px Arial', 'black');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            const clickX = data.x;
            const clickY = data.y;

            // Проверяем, попал ли клик в одну из точек
            for (const dot of this.dots) {
                const distance = Math.sqrt(Math.pow(clickX - dot.x, 2) + Math.pow(clickY - dot.y, 2));
                if (distance <= 15) {
                    // Если это первая точка или если эта точка еще не выбрана
                    if (this.currentSequence.length === 0 || !this.currentSequence.includes(dot.id)) {
                        this.currentSequence.push(dot.id);
                    } else if (this.currentSequence[this.currentSequence.length - 1] === dot.id) {
                        // Если это последняя выбранная точка, снимаем выбор
                        this.currentSequence.pop();
                    }
                    break;
                }
            }
        } else if (inputType === 'reset') {
            // Сбросить текущую последовательность
            this.currentSequence = [];
        }
    }

    checkAnswer(): boolean {
        if (this.currentSequence.length !== this.correctSequence.length) {
            return false;
        }

        for (let i = 0; i < this.correctSequence.length; i++) {
            if (this.currentSequence[i] !== this.correctSequence[i]) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Загадка с раскрытием скрытого изображения
 */
export class RevealHiddenRiddle extends BaseRiddle {
    private hiddenImageKey: string;
    private maskImageKey: string;
    private revealedAreas: { x: number, y: number, radius: number }[] = [];
    private requiredRevealPercentage: number;
    private currentRevealPercentage: number = 0;

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        hiddenImageUrl: string,
        maskImageUrl: string,
        requiredRevealPercentage: number = 70,
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.REVEAL_HIDDEN, difficulty, title, description, hint, timeLimit);
        this.hiddenImageKey = 'hidden';
        this.maskImageKey = 'mask';
        this.requiredRevealPercentage = requiredRevealPercentage;

        this.loadResources({
            [this.hiddenImageKey]: hiddenImageUrl,
            [this.maskImageKey]: maskImageUrl
        });
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем маску (скрывающее изображение)
        this.drawImage(ctx, this.maskImageKey, 0, 0, width, height);

        // Рисуем "дырки" в маске, чтобы показать скрытое изображение
        this.revealedAreas.forEach(area => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            ctx.clip();
            this.drawImage(ctx, this.hiddenImageKey, 0, 0, width, height);
            ctx.restore();
        });

        // Отображаем прогресс раскрытия
        this.drawText(ctx, `Раскрыто: ${Math.floor(this.currentRevealPercentage)}%/${this.requiredRevealPercentage}%`,
            width / 2, 30, '18px Arial', 'white');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            // Добавляем новую область раскрытия
            const newArea = {x: data.x, y: data.y, radius: 30};
            this.revealedAreas.push(newArea);

            // Обновляем процент раскрытия
            this.updateRevealPercentage();
        } else if (inputType === 'move' && data.x !== undefined && data.y !== undefined && data.isDrawing) {
            // Добавляем новую область раскрытия при движении мыши с нажатой кнопкой
            const newArea = {x: data.x, y: data.y, radius: 15};
            this.revealedAreas.push(newArea);

            // Обновляем процент раскрытия
            this.updateRevealPercentage();
        }
    }

    private updateRevealPercentage(): void {
        // Примерный расчет процента раскрытия - в реальной реализации
        // нужно более точно считать площадь раскрытых областей
        const totalArea = window.innerWidth * window.innerHeight;
        let revealedArea = 0;

        this.revealedAreas.forEach(area => {
            revealedArea += Math.PI * area.radius * area.radius;
        });

        this.currentRevealPercentage = (revealedArea / totalArea) * 100;
    }

    checkAnswer(): boolean {
        return this.currentRevealPercentage >= this.requiredRevealPercentage;
    }
}

/**
 * Загадка с последовательностью
 */
export class SequencePuzzleRiddle extends BaseRiddle {
    private sequence: number[];
    private correctAnswer: number;
    private currentAnswer: number | null = null;

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        sequence: number[],
        correctAnswer: number,
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.SEQUENCE_PUZZLE, difficulty, title, description, hint, timeLimit);
        this.sequence = sequence;
        this.correctAnswer = correctAnswer;
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фон
        this.drawRect(ctx, 0, 0, width, height, '#f0f0f0');

        // Отображаем последовательность
        this.drawText(ctx, this.description, width / 2, height / 3 - 40, '20px Arial', 'black');

        const sequenceText = this.sequence.join(', ') + ', ...';
        this.drawText(ctx, sequenceText, width / 2, height / 3, '24px Arial', 'black');

        // Отображаем поле ввода
        this.drawRect(ctx, width / 2 - 50, height / 3 + 40, 100, 40, 'white', 'black', 2);
        this.drawText(ctx, this.currentAnswer !== null ? this.currentAnswer.toString() : '?',
            width / 2, height / 3 + 60, '24px Arial', 'black');

        // Рисуем кнопки для ввода
        const buttonsPerRow = 5;
        const buttonSize = 40;
        const buttonSpacing = 10;
        const startX = width / 2 - (buttonsPerRow * (buttonSize + buttonSpacing) - buttonSpacing) / 2;
        const startY = height / 3 + 100;

        for (let i = 0; i < 10; i++) {
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;

            const x = startX + col * (buttonSize + buttonSpacing);
            const y = startY + row * (buttonSize + buttonSpacing);

            this.drawRect(ctx, x, y, buttonSize, buttonSize, 'white', 'black', 2);
            this.drawText(ctx, i.toString(), x + buttonSize / 2, y + buttonSize / 2, '20px Arial', 'black');
        }

        // Кнопка "Очистить"
        this.drawRect(ctx, width / 2 - 60, startY + 2 * (buttonSize + buttonSpacing) + 20, 120, 40, 'white', 'black', 2);
        this.drawText(ctx, 'Очистить', width / 2, startY + 2 * (buttonSize + buttonSpacing) + 40, '16px Arial', 'black');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            const clickX = data.x;
            const clickY = data.y;

            // Проверяем, попал ли клик в одну из цифровых кнопок
            const buttonsPerRow = 5;
            const buttonSize = 40;
            const buttonSpacing = 10;
            const startX = window.innerWidth / 2 - (buttonsPerRow * (buttonSize + buttonSpacing) - buttonSpacing) / 2;
            const startY = window.innerHeight / 3 + 100;

            for (let i = 0; i < 10; i++) {
                const row = Math.floor(i / buttonsPerRow);
                const col = i % buttonsPerRow;

                const x = startX + col * (buttonSize + buttonSpacing);
                const y = startY + row * (buttonSize + buttonSpacing);

                if (clickX >= x && clickX <= x + buttonSize && clickY >= y && clickY <= y + buttonSize) {
                    this.currentAnswer = i;
                    return;
                }
            }

            // Проверяем, попал ли клик в кнопку "Очистить"
            const clearButtonX = window.innerWidth / 2 - 60;
            const clearButtonY = startY + 2 * (buttonSize + buttonSpacing) + 20;
            const clearButtonWidth = 120;
            const clearButtonHeight = 40;

            if (clickX >= clearButtonX && clickX <= clearButtonX + clearButtonWidth &&
                clickY >= clearButtonY && clickY <= clearButtonY + clearButtonHeight) {
                this.currentAnswer = null;
            }
        } else if (inputType === 'number') {
            // Напрямую установить числовой ответ
            this.currentAnswer = parseInt(data.toString(), 10);
        }
    }

    checkAnswer(): boolean {
        return this.currentAnswer === this.correctAnswer;
    }
}

/**
 * Загадка с запоминанием
 */
export class MemoryPuzzleRiddle extends BaseRiddle {
    private sequence: number[] = [];
    private playerSequence: number[] = [];
    private showingSequence: boolean = true;
    private currentIndex: number = 0;
    private sequenceLength: number;
    private gridSize: number;
    private gridItems: { id: number, color: string, x: number, y: number, width: number, height: number }[] = [];

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        sequenceLength: number,
        gridSize: number = 3,
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.MEMORY_PUZZLE, difficulty, title, description, hint, timeLimit);
        this.sequenceLength = sequenceLength;
        this.gridSize = gridSize;
        // Инициализируем сетку и последовательность
        this.initializeGrid();
        this.generateSequence();
    }

    private initializeGrid(): void {
        const cellSize = 80;
        const padding = 10;
        const totalWidth = this.gridSize * cellSize + (this.gridSize - 1) * padding;
        const startX = (window.innerWidth - totalWidth) / 2;
        const startY = window.innerHeight / 2 - totalWidth / 2;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const id = row * this.gridSize + col;
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);

                const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta'];
                const color = colors[id % colors.length];

                this.gridItems.push({
                    id,
                    color,
                    x,
                    y,
                    width: cellSize,
                    height: cellSize
                });
            }
        }
    }

    private generateSequence(): void {
        this.sequence = [];
        for (let i = 0; i < this.sequenceLength; i++) {
            const randomId = Math.floor(Math.random() * (this.gridSize * this.gridSize));
            this.sequence.push(randomId);
        }
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фон
        this.drawRect(ctx, 0, 0, width, height, '#f0f0f0');

        // Отображаем сетку
        this.gridItems.forEach(item => {
            let color = item.color;

            // Если мы показываем последовательность и этот элемент активен
            if (this.showingSequence && this.sequence[this.currentIndex] === item.id) {
                color = 'white';
            }

            this.drawRect(ctx, item.x, item.y, item.width, item.height, color, 'black', 2);
        });

        // Отображаем статус
        if (this.showingSequence) {
            this.drawText(ctx, 'Запоминайте последовательность...', width / 2, height - 50, '20px Arial', 'black');
        } else {
            this.drawText(ctx, 'Повторите последовательность', width / 2, height - 50, '20px Arial', 'black');
            this.drawText(ctx, `${this.playerSequence.length}/${this.sequence.length}`, width / 2, height - 20, '18px Arial', 'black');
        }

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        if (this.showingSequence) {
            // Анимация последовательности
            this.currentTime += deltaTime;

            if (this.currentTime > (this.currentIndex + 1) * 1) { // 1 секунда на каждый элемент
                this.currentIndex++;

                if (this.currentIndex >= this.sequence.length) {
                    this.showingSequence = false;
                    this.currentIndex = 0;
                    this.playerSequence = [];
                    this.currentTime = 0; // Сбрасываем таймер для отсчета времени на воспроизведение
                }
            }
        }
    }

    handleInput(inputType: string, data: any): void {
        if (this.showingSequence) {
            return; // Игнорируем ввод во время показа последовательности
        }

        if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            const clickX = data.x;
            const clickY = data.y;

            // Проверяем, попал ли клик в один из элементов сетки
            for (const item of this.gridItems) {
                if (clickX >= item.x && clickX <= item.x + item.width &&
                    clickY >= item.y && clickY <= item.y + item.height) {
                    this.playerSequence.push(item.id);

                    // Проверяем правильность ввода
                    const index = this.playerSequence.length - 1;
                    if (this.playerSequence[index] !== this.sequence[index]) {
                        // Если ошибка, сбрасываем и начинаем заново
                        this.showingSequence = true;
                        this.currentIndex = 0;
                        this.currentTime = 0;
                        this.playerSequence = [];
                        return;
                    }

                    // Если игрок правильно повторил всю последовательность
                    if (this.playerSequence.length === this.sequence.length) {
                        // Загадка решена!
                    }

                    break;
                }
            }
        }
    }

    checkAnswer(): boolean {
        // Проверяем, что игрок правильно повторил всю последовательность
        if (this.playerSequence.length !== this.sequence.length) {
            return false;
        }

        for (let i = 0; i < this.sequence.length; i++) {
            if (this.playerSequence[i] !== this.sequence[i]) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Загадка с расшифровкой сообщения
 */
export class DecryptMessageRiddle extends BaseRiddle {
    private encryptedMessage: string;
    private decryptionKey: { [key: string]: string };
    private currentInput: string = '';
    private correctAnswer: string;

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        encryptedMessage: string,
        decryptionKey: { [key: string]: string },
        correctAnswer: string,
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.DECRYPT_MESSAGE, difficulty, title, description, hint, timeLimit);
        this.encryptedMessage = encryptedMessage;
        this.decryptionKey = decryptionKey;
        this.correctAnswer = correctAnswer;
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фон
        this.drawRect(ctx, 0, 0, width, height, '#f0f0f0');

        // Отображаем зашифрованное сообщение
        this.drawText(ctx, this.description, width / 2, height / 4 - 30, '20px Arial', 'black');
        this.drawText(ctx, 'Зашифрованное сообщение:', width / 2, height / 4, '18px Arial', 'black');
        this.drawText(ctx, this.encryptedMessage, width / 2, height / 4 + 30, '24px Arial', 'black');

        // Отображаем ключ дешифровки
        this.drawText(ctx, 'Ключ дешифровки:', width / 2, height / 4 + 80, '18px Arial', 'black');

        const keyEntries = Object.entries(this.decryptionKey);
        const keysPerRow = 5;
        const keyBoxWidth = 60;
        const keyBoxHeight = 60;
        const keyBoxSpacing = 10;

        for (let i = 0; i < keyEntries.length; i++) {
            const [encryptedChar, actualChar] = keyEntries[i];
            const row = Math.floor(i / keysPerRow);
            const col = i % keysPerRow;

            const x = width / 2 - (keysPerRow * (keyBoxWidth + keyBoxSpacing) - keyBoxSpacing) / 2 +
                col * (keyBoxWidth + keyBoxSpacing);
            const y = height / 4 + 120 + row * (keyBoxHeight + keyBoxSpacing);

            this.drawRect(ctx, x, y, keyBoxWidth, keyBoxHeight, 'white', 'black', 2);
            this.drawText(ctx, `${encryptedChar} → ${actualChar}`, x + keyBoxWidth / 2, y + keyBoxHeight / 2, '16px Arial', 'black');
        }

        // Отображаем поле ввода
        this.drawText(ctx, 'Ваш ответ:', width / 2, height * 3 / 4 - 30, '18px Arial', 'black');
        this.drawRect(ctx, width / 2 - 200, height * 3 / 4, 400, 40, 'white', 'black', 2);
        this.drawText(ctx, this.currentInput || 'Введите ответ...', width / 2, height * 3 / 4 + 20,
            '18px Arial', this.currentInput ? 'black' : 'gray');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'text') {
            this.currentInput = data.toString();
        }
    }

    checkAnswer(): boolean {
        return this.currentInput.toLowerCase() === this.correctAnswer.toLowerCase();
    }
}

/**
 * Загадка с распознаванием паттерна
 */
export class PatternRecognitionRiddle extends BaseRiddle {
    private patternImages: string[] = [];
    private options: string[] = [];
    private correctOptionIndex: number;
    private selectedOptionIndex: number | null = null;

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        patternImageUrls: string[],
        optionImageUrls: string[],
        correctOptionIndex: number,
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.PATTERN_RECOGNITION, difficulty, title, description, hint, timeLimit);
        this.correctOptionIndex = correctOptionIndex;

        // Загружаем изображения
        const resources: { [key: string]: string } = {};

        patternImageUrls.forEach((url, index) => {
            const key = `pattern_${index}`;
            this.patternImages.push(key);
            resources[key] = url;
        });

        optionImageUrls.forEach((url, index) => {
            const key = `option_${index}`;
            this.options.push(key);
            resources[key] = url;
        });

        this.loadResources(resources);
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фон
        this.drawRect(ctx, 0, 0, width, height, '#f0f0f0');

        // Отображаем описание
        this.drawText(ctx, this.description, width / 2, 50, '20px Arial', 'black');

        // Отображаем паттерн изображений
        const patternImageSize = 100;
        const patternSpacing = 10;
        const patternStartX = width / 2 - ((this.patternImages.length - 1) * (patternImageSize + patternSpacing) + patternImageSize) / 2;
        const patternY = 120;

        this.patternImages.forEach((imageKey, index) => {
            const x = patternStartX + index * (patternImageSize + patternSpacing);
            this.drawImage(ctx, imageKey, x, patternY, patternImageSize, patternImageSize);
        });

        // Рисуем символ "?"
        const questionX = patternStartX + this.patternImages.length * (patternImageSize + patternSpacing);
        this.drawCircle(ctx, questionX + patternImageSize / 2, patternY + patternImageSize / 2, patternImageSize / 2, 'white', 'black', 2);
        this.drawText(ctx, '?', questionX + patternImageSize / 2, patternY + patternImageSize / 2, '40px Arial', 'black');

        // Отображаем варианты ответов
        const optionsPerRow = 4;
        const optionSize = 120;
        const optionSpacing = 20;
        const optionsStartY = patternY + patternImageSize + 50;

        this.options.forEach((optionKey, index) => {
            const row = Math.floor(index / optionsPerRow);
            const col = index % optionsPerRow;

            const x = width / 2 - (optionsPerRow * (optionSize + optionSpacing) - optionSpacing) / 2 +
                col * (optionSize + optionSpacing);
            const y = optionsStartY + row * (optionSize + optionSpacing);

            // Рисуем рамку выбора, если этот вариант выбран
            if (this.selectedOptionIndex === index) {
                this.drawRect(ctx, x - 5, y - 5, optionSize + 10, optionSize + 10, 'rgba(0, 128, 255, 0.3)', 'blue', 3);
            }

            this.drawImage(ctx, optionKey, x, y, optionSize, optionSize);

            // Нумеруем варианты
            this.drawCircle(ctx, x + 20, y + 20, 15, 'white', 'black', 2);
            this.drawText(ctx, (index + 1).toString(), x + 20, y + 20, '14px Arial', 'black');
        });

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            const clickX = data.x;
            const clickY = data.y;

            // Проверяем клик по вариантам ответов
            const optionsPerRow = 4;
            const optionSize = 120;
            const optionSpacing = 20;
            const patternImageSize = 100;
            const patternY = 120;
            const optionsStartY = patternY + patternImageSize + 50;

            this.options.forEach((optionKey, index) => {
                const row = Math.floor(index / optionsPerRow);
                const col = index % optionsPerRow;

                const x = window.innerWidth / 2 - (optionsPerRow * (optionSize + optionSpacing) - optionSpacing) / 2 +
                    col * (optionSize + optionSpacing);
                const y = optionsStartY + row * (optionSize + optionSpacing);

                if (clickX >= x && clickX <= x + optionSize && clickY >= y && clickY <= y + optionSize) {
                    this.selectedOptionIndex = index;
                }
            });
        } else if (inputType === 'number') {
            // Выбор варианта по номеру (от 1 до количества вариантов)
            const num = parseInt(data.toString(), 10);
            if (num >= 1 && num <= this.options.length) {
                this.selectedOptionIndex = num - 1;
            }
        }
    }

    checkAnswer(): boolean {
        return this.selectedOptionIndex === this.correctOptionIndex;
    }
}

/**
 * Загадка с лабиринтом
 */
export class MazePuzzleRiddle extends BaseRiddle {
    private maze: number[][] = [];
    private playerPosition: { x: number, y: number } = {x: 0, y: 0};
    private exitPosition: { x: number, y: number } = {x: 0, y: 0};
    private cellSize: number = 30;
    private playerPath: { x: number, y: number }[] = [];

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        maze: number[][],
        startPosition: { x: number, y: number },
        exitPosition: { x: number, y: number },
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.MAZE_PUZZLE, difficulty, title, description, hint, timeLimit);
        this.maze = maze;
        this.playerPosition = {...startPosition};
        this.exitPosition = exitPosition;
        this.playerPath.push({...startPosition});
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фон
        this.drawRect(ctx, 0, 0, width, height, '#f0f0f0');

        // Определяем размер ячейки и начальную позицию лабиринта
        const mazeWidth = this.maze[0].length * this.cellSize;
        const mazeHeight = this.maze.length * this.cellSize;
        const startX = (width - mazeWidth) / 2;
        const startY = (height - mazeHeight) / 2;

        // Рисуем лабиринт
        for (let row = 0; row < this.maze.length; row++) {
            for (let col = 0; col < this.maze[row].length; col++) {
                const x = startX + col * this.cellSize;
                const y = startY + row * this.cellSize;

                // 0 - проход, 1 - стена
                if (this.maze[row][col] === 1) {
                    this.drawRect(ctx, x, y, this.cellSize, this.cellSize, 'black');
                } else {
                    this.drawRect(ctx, x, y, this.cellSize, this.cellSize, 'white', 'gray', 1);
                }

                // Рисуем выход
                if (row === this.exitPosition.y && col === this.exitPosition.x) {
                    this.drawRect(ctx, x, y, this.cellSize, this.cellSize, 'green');
                }
            }
        }

        // Рисуем путь игрока
        for (let i = 0; i < this.playerPath.length; i++) {
            const pos = this.playerPath[i];
            const x = startX + pos.x * this.cellSize;
            const y = startY + pos.y * this.cellSize;

            // Рисуем след с градиентом цвета от начала (синий) к концу (красный)
            const ratio = i / Math.max(1, this.playerPath.length - 1);
            const r = Math.floor(ratio * 255);
            const b = Math.floor((1 - ratio) * 255);
            this.drawRect(ctx, x + 5, y + 5, this.cellSize - 10, this.cellSize - 10, `rgba(${r}, 100, ${b}, 0.5)`);
        }

        // Рисуем игрока
        const playerX = startX + this.playerPosition.x * this.cellSize;
        const playerY = startY + this.playerPosition.y * this.cellSize;
        this.drawCircle(ctx, playerX + this.cellSize / 2, playerY + this.cellSize / 2, this.cellSize / 3, 'red');

        // Отображаем описание
        this.drawText(ctx, this.description, width / 2, startY - 30, '20px Arial', 'black');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        if (inputType === 'key') {
            const direction = data.toString().toLowerCase();
            let newPosition = {...this.playerPosition};

            switch (direction) {
                case 'arrowup':
                case 'w':
                    newPosition.y -= 1;
                    break;
                case 'arrowdown':
                case 's':
                    newPosition.y += 1;
                    break;
                case 'arrowleft':
                case 'a':
                    newPosition.x -= 1;
                    break;
                case 'arrowright':
                case 'd':
                    newPosition.x += 1;
                    break;
                default:
                    return;
            }

            // Проверяем, что новая позиция в пределах лабиринта и не является стеной
            if (newPosition.y >= 0 && newPosition.y < this.maze.length &&
                newPosition.x >= 0 && newPosition.x < this.maze[0].length &&
                this.maze[newPosition.y][newPosition.x] === 0) {

                this.playerPosition = newPosition;
                this.playerPath.push({...newPosition});
            }
        } else if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            // Определяем позицию клика в лабиринте
            const mazeWidth = this.maze[0].length * this.cellSize;
            const mazeHeight = this.maze.length * this.cellSize;
            const startX = (window.innerWidth - mazeWidth) / 2;
            const startY = (window.innerHeight - mazeHeight) / 2;

            const clickX = Math.floor((data.x - startX) / this.cellSize);
            const clickY = Math.floor((data.y - startY) / this.cellSize);

            // Проверяем, находится ли клик в пределах лабиринта
            if (clickX >= 0 && clickX < this.maze[0].length && clickY >= 0 && clickY < this.maze.length) {
                // Проверяем, соседняя ли это ячейка с текущей позицией игрока
                const isAdjacent = (
                    (Math.abs(clickX - this.playerPosition.x) === 1 && clickY === this.playerPosition.y) ||
                    (Math.abs(clickY - this.playerPosition.y) === 1 && clickX === this.playerPosition.x)
                );

                // Проверяем, не является ли ячейка стеной
                if (isAdjacent && this.maze[clickY][clickX] === 0) {
                    this.playerPosition = {x: clickX, y: clickY};
                    this.playerPath.push({...this.playerPosition});
                }
            }
        }
    }

    checkAnswer(): boolean {
        // Проверяем, достиг ли игрок выхода
        return this.playerPosition.x === this.exitPosition.x && this.playerPosition.y === this.exitPosition.y;
    }
}

/**
 * Загадка с логическим пазлом
 */
export class LogicalPuzzleRiddle extends BaseRiddle {
    private grid: number[][] = [];
    private solution: number[][] = [];
    private selectedCell: { row: number, col: number } | null = null;
    private currentValue: number = 1;
    private gridSize: number;

    constructor(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        initialGrid: number[][],
        solution: number[][],
        hint?: string,
        timeLimit?: number
    ) {
        super(id, RiddleType.LOGICAL_PUZZLE, difficulty, title, description, hint, timeLimit);
        this.grid = JSON.parse(JSON.stringify(initialGrid)); // Глубокая копия
        this.solution = solution;
        this.gridSize = initialGrid.length;
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Рисуем фон
        this.drawRect(ctx, 0, 0, width, height, '#f0f0f0');

        // Отображаем описание
        this.drawText(ctx, this.description, width / 2, 50, '20px Arial', 'black');

        // Определяем размер ячейки и начальную позицию сетки
        const cellSize = 50;
        const gridWidth = this.gridSize * cellSize;
        const gridHeight = this.gridSize * cellSize;
        const startX = (width - gridWidth) / 2;
        const startY = 100;

        // Рисуем сетку
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = startX + col * cellSize;
                const y = startY + row * cellSize;

                // Определяем цвет фона ячейки
                let bgColor = 'white';
                if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                    bgColor = 'rgba(0, 128, 255, 0.3)';
                } else if (this.grid[row][col] !== 0) {
                    // Предустановленные числа с серым фоном
                    bgColor = 'rgba(200, 200, 200, 0.5)';
                }

                // Рисуем ячейку
                this.drawRect(ctx, x, y, cellSize, cellSize, bgColor, 'black', 1);

                // Рисуем число в ячейке, если оно не равно 0
                if (this.grid[row][col] !== 0) {
                    this.drawText(ctx, this.grid[row][col].toString(), x + cellSize / 2, y + cellSize / 2, '20px Arial', 'black');
                }
            }
        }

        // Рисуем панель с цифрами для ввода
        const numberPanelY = startY + gridHeight + 30;

        for (let i = 1; i <= this.gridSize; i++) {
            const x = startX + (i - 1) * cellSize;
            const y = numberPanelY;

            // Выделяем текущую выбранную цифру
            const bgColor = (i === this.currentValue) ? 'rgba(0, 128, 255, 0.3)' : 'white';

            this.drawRect(ctx, x, y, cellSize, cellSize, bgColor, 'black', 1);
            this.drawText(ctx, i.toString(), x + cellSize / 2, y + cellSize / 2, '20px Arial', 'black');
        }

        // Кнопка "Очистить ячейку"
        this.drawRect(ctx, startX, numberPanelY + cellSize + 10, gridWidth, 40, 'white', 'black', 1);
        this.drawText(ctx, 'Очистить ячейку', startX + gridWidth / 2, numberPanelY + cellSize + 30, '16px Arial', 'black');

        // Если есть ограничение по времени, отображаем оставшееся время
        if (this.timeLimit) {
            const remainingTime = Math.max(0, this.timeLimit - this.currentTime);
            this.drawText(ctx, `Время: ${Math.floor(remainingTime)}`,
                width - 70, 30, '18px Arial', remainingTime < 10 ? 'red' : 'white');
        }
    }

    handleInput(inputType: string, data: any): void {
        const cellSize = 50;
        const gridWidth = this.gridSize * cellSize;
        const startX = (window.innerWidth - gridWidth) / 2;
        const startY = 100;
        const numberPanelY = startY + this.gridSize * cellSize + 30;

        if (inputType === 'click' && data.x !== undefined && data.y !== undefined) {
            const clickX = data.x;
            const clickY = data.y;

            // Проверяем клик по сетке
            if (clickX >= startX && clickX < startX + gridWidth &&
                clickY >= startY && clickY < startY + this.gridSize * cellSize) {

                const col = Math.floor((clickX - startX) / cellSize);
                const row = Math.floor((clickY - startY) / cellSize);

                // Проверяем, что это не предустановленная ячейка
                const initialGrid = JSON.parse(JSON.stringify(this.grid));
                if (initialGrid[row][col] === 0) {
                    this.selectedCell = {row, col};
                }
            }
// Проверяем клик по панели с цифрами
            else if (clickX >= startX && clickX < startX + gridWidth &&
                clickY >= numberPanelY && clickY < numberPanelY + cellSize) {

                const numberIndex = Math.floor((clickX - startX) / cellSize);
                this.currentValue = numberIndex + 1;

                // Если выбрана ячейка, устанавливаем в неё значение
                if (this.selectedCell) {
                    this.grid[this.selectedCell.row][this.selectedCell.col] = this.currentValue;
                }
            }
            // Проверяем клик по кнопке "Очистить ячейку"
            else if (clickX >= startX && clickX < startX + gridWidth &&
                clickY >= numberPanelY + cellSize + 10 && clickY < numberPanelY + cellSize + 50) {

                if (this.selectedCell) {
                    // Проверяем, что это не предустановленная ячейка
                    const initialGrid = JSON.parse(JSON.stringify(this.grid));
                    if (initialGrid[this.selectedCell.row][this.selectedCell.col] === 0) {
                        this.grid[this.selectedCell.row][this.selectedCell.col] = 0;
                    }
                }
            }
        }
    }

    checkAnswer(): boolean {
        // Проверяем, соответствует ли текущая сетка решению
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
}

/**
 * Главный класс для управления уровнями загадок
 */
export class RiddleQuestEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private currentRiddle: Riddle | null = null;
    private riddles: Riddle[] = [];
    private currentLevel: number = 0;
    private lastTimestamp: number = 0;
    private successCallback: (() => void) | null = null;
    private failureCallback: (() => void) | null = null;
    private gameState: 'playing' | 'success' | 'failure' = 'playing';

    constructor(canvasId: string, size: number) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas element with id ${canvasId} not found.`);
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas.');
        }
        this.ctx = context;

        // Установка размера канваса
        this.resizeCanvas(size);
        window.addEventListener('resize', () => this.resizeCanvas());

        // Обработчики событий
        this.setupEventListeners();

        // Запуск игрового цикла
        this.lastTimestamp = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    private resizeCanvas(size?: number): void {
        this.canvas.width = size || window.innerWidth;
        this.canvas.height = size || window.innerHeight;
    }

    private setupEventListeners(): void {
        // Обработка кликов мыши
        this.canvas.addEventListener('click', (event) => {
            if (this.currentRiddle && this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                this.currentRiddle.handleInput('click', {x, y});
            }
        });

        // Обработка движения мыши
        this.canvas.addEventListener('mousemove', (event) => {
            if (this.currentRiddle && this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const isDrawing = event.buttons === 1; // Проверяем, нажата ли левая кнопка мыши
                this.currentRiddle.handleInput('move', {x, y, isDrawing});
            }
        });

        // Обработка клавиатурных событий
        window.addEventListener('keydown', (event) => {
            if (this.currentRiddle && this.gameState === 'playing') {
                this.currentRiddle.handleInput('key', event.key);

                // Предотвращаем прокрутку страницы при нажатии клавиш со стрелками
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    event.preventDefault();
                }
            }
        });
    }

    /**
     * Добавляет загадку в список уровней
     * @param riddle Загадка для добавления
     */
    addRiddle(riddle: Riddle): void {
        this.riddles.push(riddle);
    }

    /**
     * Устанавливает несколько загадок как уровни
     * @param riddles Массив загадок
     */
    setRiddles(riddles: Riddle[]): void {
        this.riddles = riddles;
    }

    /**
     * Запускает загадку определенного уровня
     * @param level Номер уровня (начиная с 0)
     */
    startLevel(level: number): void {
        if (level >= 0 && level < this.riddles.length) {
            this.currentLevel = level;
            this.currentRiddle = this.riddles[level];
            this.gameState = 'playing';
        } else {
            console.error(`Level ${level} does not exist.`);
        }
    }

    /**
     * Переходит к следующему уровню
     */
    nextLevel(): void {
        this.startLevel(this.currentLevel + 1);
    }

    /**
     * Устанавливает функцию обратного вызова при успешном прохождении уровня
     * @param callback Функция, которая будет вызвана при успехе
     */
    onSuccess(callback: () => void): void {
        this.successCallback = callback;
    }

    /**
     * Устанавливает функцию обратного вызова при неудачном прохождении уровня
     * @param callback Функция, которая будет вызвана при неудаче
     */
    onFailure(callback: () => void): void {
        this.failureCallback = callback;
    }

    /**
     * Получить текущую загадку
     */
    getCurrentRiddle(): Riddle | null {
        return this.currentRiddle;
    }

    /**
     * Получить текущий уровень
     */
    getCurrentLevel(): number {
        return this.currentLevel;
    }

    /**
     * Получить общее количество уровней
     */
    getTotalLevels(): number {
        return this.riddles.length;
    }

    /**
     * Получить подсказку для текущего уровня
     */
    showHint(): string | null {
        if (this.currentRiddle) {
            return this.currentRiddle.getHint();
        }
        return null;
    }

    /**
     * Основной игровой цикл
     */
    private gameLoop(timestamp: number): void {
        // Вычисляем delta time для анимаций
        const deltaTime = (timestamp - this.lastTimestamp) / 1000; // в секундах
        this.lastTimestamp = timestamp;

        // Очищаем холст
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentRiddle) {
            // Обновляем состояние загадки
            this.currentRiddle.update(deltaTime);

            // Отрисовываем загадку
            this.currentRiddle.render(this.ctx, this.canvas.width, this.canvas.height);

            // Проверяем условие победы
            if (this.gameState === 'playing' && this.currentRiddle.checkAnswer()) {
                this.gameState = 'success';
                this.renderSuccessScreen();

                if (this.successCallback) {
                    setTimeout(() => {
                        this.successCallback?.();
                    }, 2000);
                }
            }
        }

        // Запрашиваем следующий кадр
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    /**
     * Отображение экрана успешного завершения загадки
     */
    private renderSuccessScreen(): void {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Полупрозрачный фон
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, width, height);

        // Текст "Загадка решена!"
        this.ctx.font = '36px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Загадка решена!', width / 2, height / 2 - 20);

        // Текст "Переход к следующему уровню..."
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Переход к следующему уровню...', width / 2, height / 2 + 30);
    }
}

/**
 * Фабрика для создания загадок и уровней
 */
export class RiddleFactory {
    /**
     * Создает загадку "Найди объект"
     */
    static createFindObjectRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        backgroundImageUrl: string,
        objectImageUrl: string,
        objectPositions: { x: number, y: number, radius: number }[],
        requiredFinds: number = 1,
        hint?: string,
        timeLimit?: number
    ): FindObjectRiddle {
        return new FindObjectRiddle(
            id, difficulty, title, description, backgroundImageUrl, objectImageUrl,
            objectPositions, requiredFinds, hint, timeLimit
        );
    }

    /**
     * Создает загадку с вводом слова
     */
    static createWordPuzzleRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        backgroundImageUrl: string,
        correctAnswer: string,
        caseSensitive: boolean = false,
        hint?: string,
        timeLimit?: number
    ): WordPuzzleRiddle {
        return new WordPuzzleRiddle(
            id, difficulty, title, description, backgroundImageUrl,
            correctAnswer, caseSensitive, hint, timeLimit
        );
    }

    /**
     * Создает загадку с соединением точек
     */
    static createConnectDotsRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        dots: { x: number, y: number, id: number }[],
        correctSequence: number[],
        hint?: string,
        timeLimit?: number
    ): ConnectDotsRiddle {
        return new ConnectDotsRiddle(
            id, difficulty, title, description, dots, correctSequence, hint, timeLimit
        );
    }

    /**
     * Создает загадку с раскрытием скрытого изображения
     */
    static createRevealHiddenRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        hiddenImageUrl: string,
        maskImageUrl: string,
        requiredRevealPercentage: number = 70,
        hint?: string,
        timeLimit?: number
    ): RevealHiddenRiddle {
        return new RevealHiddenRiddle(
            id, difficulty, title, description, hiddenImageUrl, maskImageUrl,
            requiredRevealPercentage, hint, timeLimit
        );
    }

    /**
     * Создает загадку с последовательностью
     */
    static createSequencePuzzleRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        sequence: number[],
        correctAnswer: number,
        hint?: string,
        timeLimit?: number
    ): SequencePuzzleRiddle {
        return new SequencePuzzleRiddle(
            id, difficulty, title, description, sequence, correctAnswer, hint, timeLimit
        );
    }

    /**
     * Создает загадку на запоминание
     */
    static createMemoryPuzzleRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        sequenceLength: number,
        gridSize: number = 3,
        hint?: string,
        timeLimit?: number
    ): MemoryPuzzleRiddle {
        return new MemoryPuzzleRiddle(
            id, difficulty, title, description, sequenceLength, gridSize, hint, timeLimit
        );
    }

    /**
     * Создает загадку с расшифровкой сообщения
     */
    static createDecryptMessageRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        encryptedMessage: string,
        decryptionKey: { [key: string]: string },
        correctAnswer: string,
        hint?: string,
        timeLimit?: number
    ): DecryptMessageRiddle {
        return new DecryptMessageRiddle(
            id, difficulty, title, description, encryptedMessage, decryptionKey,
            correctAnswer, hint, timeLimit
        );
    }

    /**
     * Создает загадку с распознаванием паттерна
     */
    static createPatternRecognitionRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        patternImageUrls: string[],
        optionImageUrls: string[],
        correctOptionIndex: number,
        hint?: string,
        timeLimit?: number
    ): PatternRecognitionRiddle {
        return new PatternRecognitionRiddle(
            id, difficulty, title, description, patternImageUrls, optionImageUrls,
            correctOptionIndex, hint, timeLimit
        );
    }

    /**
     * Создает загадку с лабиринтом
     */
    static createMazePuzzleRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        maze: number[][],
        startPosition: { x: number, y: number },
        exitPosition: { x: number, y: number },
        hint?: string,
        timeLimit?: number
    ): MazePuzzleRiddle {
        return new MazePuzzleRiddle(
            id, difficulty, title, description, maze, startPosition, exitPosition, hint, timeLimit
        );
    }

    /**
     * Создает загадку с логическим пазлом
     */
    static createLogicalPuzzleRiddle(
        id: string,
        difficulty: DifficultyLevel,
        title: string,
        description: string,
        initialGrid: number[][],
        solution: number[][],
        hint?: string,
        timeLimit?: number
    ): LogicalPuzzleRiddle {
        return new LogicalPuzzleRiddle(
            id, difficulty, title, description, initialGrid, solution, hint, timeLimit
        );
    }
}

// Пример использования библиотеки

// Файл: example-usage.ts

/**
 * Пример использования библиотеки RiddleQuest
 */
export function initializeRiddleQuest(canvasId: string, size: number): RiddleQuestEngine {
    // Создаем движок для загадок
    const engine = new RiddleQuestEngine(canvasId, size);

    // Создаем набор загадок разных типов и сложности
    const level1 = RiddleFactory.createWordPuzzleRiddle(
        'word-puzzle-1',
        DifficultyLevel.EASY,
        'Загадка слова',
        'Угадайте слово: Висит груша, нельзя скушать',
        'images/background-light.jpg',
        'лампочка',
        false,
        'Это излучает свет',
        60
    );

    const level2 = RiddleFactory.createFindObjectRiddle(
        'find-object-1',
        DifficultyLevel.EASY,
        'Найди предмет',
        'Найдите все скрытые ключи (3 штуки)',
        'images/room-background.jpg',
        'images/key.png',
        [
            {x: 200, y: 150, radius: 20},
            {x: 350, y: 250, radius: 20},
            {x: 500, y: 200, radius: 20}
        ],
        3,
        'Ищите в темных углах',
        90
    );

    const level3 = RiddleFactory.createConnectDotsRiddle(
        'connect-dots-1',
        DifficultyLevel.MEDIUM,
        'Соедините точки',
        'Соедините точки в правильном порядке, чтобы сформировать фигуру',
        [
            {x: 200, y: 100, id: 1},
            {x: 300, y: 100, id: 2},
            {x: 350, y: 200, id: 3},
            {x: 300, y: 300, id: 4},
            {x: 200, y: 300, id: 5},
            {x: 150, y: 200, id: 6}
        ],
        [1, 2, 3, 4, 5, 6, 1], // Правильная последовательность (шестиугольник)
        'Начните с верхней левой точки',
        120
    );

    const level4 = RiddleFactory.createSequencePuzzleRiddle(
        'sequence-1',
        DifficultyLevel.MEDIUM,
        'Найдите следующее число',
        'Определите следующее число в последовательности',
        [2, 4, 8, 16, 32],
        64,
        'Подумайте о степенях двойки',
        60
    );

    const level5 = RiddleFactory.createPatternRecognitionRiddle(
        'pattern-1',
        DifficultyLevel.HARD,
        'Распознайте паттерн',
        'Выберите изображение, которое продолжает последовательность',
        [
            'images/pattern1.jpg',
            'images/pattern2.jpg',
            'images/pattern3.jpg',
            'images/pattern4.jpg'
        ],
        [
            'images/option1.jpg',
            'images/option2.jpg',
            'images/option3.jpg',
            'images/option4.jpg'
        ],
        2, // Правильный вариант ответа (индекс)
        'Обратите внимание на форму и цвет',
        90
    );

    const level6 = RiddleFactory.createMazePuzzleRiddle(
        'maze-1',
        DifficultyLevel.HARD,
        'Лабиринт',
        'Пройдите лабиринт от начала до конца',
        [
            [0, 1, 0, 0, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0]
        ],
        {x: 0, y: 0}, // Начальная позиция
        {x: 6, y: 6}, // Позиция выхода
        'Используйте стрелки или WASD для перемещения',
        180
    );

    const level7 = RiddleFactory.createLogicalPuzzleRiddle(
        'logical-1',
        DifficultyLevel.EXPERT,
        'Логический пазл',
        'Заполните сетку числами от 1 до 4 так, чтобы в каждой строке и столбце не было повторений',
        [
            [1, 0, 0, 0],
            [0, 0, 3, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 2]
        ],
        [
            [1, 2, 4, 3],
            [4, 3, 2, 1],
            [3, 1, 4, 2],
            [2, 4, 1, 3]
        ],
        'Используйте метод исключения',
        240
    );

    const level8 = RiddleFactory.createDecryptMessageRiddle(
        'decrypt-1',
        DifficultyLevel.EXPERT,
        'Расшифруйте сообщение',
        'Используйте ключ для расшифровки сообщения',
        'МЖАЬИ ЩДНТС ДПЯЁ ПНТСЖ УЭС ДЕ ЖЫФТ',
        {
            'А': 'К', 'Б': 'Л', 'В': 'М', 'Г': 'Н', 'Д': 'О', 'Е': 'П', 'Ж': 'Р', 'З': 'С',
            'И': 'Т', 'Й': 'У', 'К': 'Ф', 'Л': 'Х', 'М': 'Ц', 'Н': 'Ч', 'О': 'Ш', 'П': 'Щ',
            'Р': 'Ъ', 'С': 'Ы', 'Т': 'Ь', 'У': 'Э', 'Ф': 'Ю', 'Х': 'Я', 'Ц': 'А', 'Ч': 'Б',
            'Ш': 'В', 'Щ': 'Г', 'Ъ': 'Д', 'Ы': 'Е', 'Ь': 'Ж', 'Э': 'З', 'Ю': 'И', 'Я': 'Й',
            ' ': ' '
        },
        'РАЗУМ ВАЖНЕЕ СИЛЫ ЗНАНИЕ МУДРОСТЬ',
        'Ищите часто встречающиеся буквы',
        300
    );

    const level9 = RiddleFactory.createMemoryPuzzleRiddle(
        'memory-1',
        DifficultyLevel.MASTER,
        'Тест на память',
        'Запомните и повторите последовательность',
        5, // Длина последовательности
        3, // Размер сетки (3x3)
        'Постарайтесь визуализировать последовательность',
        120
    );

    const level10 = RiddleFactory.createRevealHiddenRiddle(
        'reveal-1',
        DifficultyLevel.MASTER,
        'Раскройте скрытое изображение',
        'Сотрите верхний слой, чтобы раскрыть скрытое изображение',
        'images/hidden-treasure-map.jpg', // Скрытое изображение
        'images/mask-layer.jpg', // Маскирующее изображение
        70, // Процент раскрытия для победы
        'Сконцентрируйтесь на центральной части',
        180
    );

    // Добавляем загадки в движок
    engine.setRiddles([
        level1, level2, level3, level4, level5,
        level6, level7, level8, level9, level10
    ]);

    // Устанавливаем обработчики событий
    engine.onSuccess(() => {
        // Переход к следующему уровню
        const nextLevel = engine.getCurrentLevel() + 1;
        if (nextLevel < engine.getTotalLevels()) {
            engine.nextLevel();
        } else {
            alert('Поздравляем! Вы прошли все уровни!');
        }
    });

    // Запускаем первый уровень
    engine.startLevel(0);

    return engine;
}

// Экспортируем все для использования
export default {
    RiddleQuestEngine,
    RiddleFactory,
    RiddleType,
    DifficultyLevel,
    initializeRiddleQuest
};