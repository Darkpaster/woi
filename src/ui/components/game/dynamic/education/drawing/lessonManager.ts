import {Lesson, LessonStep} from "./types.ts";

class LessonManager {
    private lessons: Lesson[] = [];
    private currentLessonId: string | null = null;
    private currentStepIndex: number = 0;
    private userProgress: Record<string, boolean[]> = {};

    constructor() {
        this.initializeLessons();
    }

    private initializeLessons(): void {
        // Здесь можно добавить предопределенные уроки
        this.addLesson({
            id: 'basic-shapes',
            title: 'Основы рисования: Геометрические фигуры',
            category: 'основы',
            difficulty: 'beginner',
            steps: [
                {
                    id: 'basic-shapes-1',
                    title: 'Рисование линий',
                    description: 'Начнем с рисования простых линий. Проведите 5 горизонтальных линий разной длины.',
                    hints: ['Используйте инструмент "Линия"', 'Попробуйте варьировать толщину линии'],
                    duration: 5
                },
                {
                    id: 'basic-shapes-2',
                    title: 'Рисование квадратов и прямоугольников',
                    description: 'Теперь нарисуйте 3 квадрата и 2 прямоугольника разного размера.',
                    hints: ['Используйте инструмент "Прямоугольник"', 'Попробуйте сделать фигуры разных размеров'],
                    duration: 10
                },
                {
                    id: 'basic-shapes-3',
                    title: 'Рисование кругов',
                    description: 'Нарисуйте 3 круга разного размера.',
                    hints: ['Используйте инструмент "Круг"', 'Размещайте круги в разных частях холста'],
                    duration: 10
                }
            ],
            completed: false
        });

        this.addLesson({
            id: 'shading-techniques',
            title: 'Техники штриховки',
            category: 'техники',
            difficulty: 'intermediate',
            steps: [
                {
                    id: 'shading-techniques-1',
                    title: 'Параллельная штриховка',
                    description: 'Создайте квадрат и заполните его параллельными линиями для создания эффекта тени.',
                    hints: ['Линии должны быть на одинаковом расстоянии друг от друга', 'Чем плотнее линии, тем темнее эффект'],
                    duration: 15
                },
                {
                    id: 'shading-techniques-2',
                    title: 'Перекрестная штриховка',
                    description: 'Нарисуйте еще один квадрат и заполните его перекрестными линиями для создания более темной тени.',
                    hints: ['Сначала нарисуйте параллельные линии в одном направлении, затем в другом', 'Угол пересечения может быть 90° или другой'],
                    duration: 15
                }
            ],
            completed: false
        });
    }

    public addLesson(lesson: Lesson): void {
        this.lessons.push(lesson);
        this.userProgress[lesson.id] = new Array(lesson.steps.length).fill(false);
    }

    public startLesson(lessonId: string): LessonStep | null {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson || lesson.steps.length === 0) {
            return null;
        }

        this.currentLessonId = lessonId;
        this.currentStepIndex = 0;
        return lesson.steps[0];
    }

    public getCurrentLesson(): Lesson | null {
        if (!this.currentLessonId) return null;
        return this.lessons.find(l => l.id === this.currentLessonId) || null;
    }

    public getCurrentStep(): LessonStep | null {
        const lesson = this.getCurrentLesson();
        if (!lesson) return null;
        return lesson.steps[this.currentStepIndex] || null;
    }

    public nextStep(): LessonStep | null {
        const lesson = this.getCurrentLesson();
        if (!lesson) return null;

        if (this.currentStepIndex < lesson.steps.length - 1) {
            this.currentStepIndex++;
            return lesson.steps[this.currentStepIndex];
        } else {
            // Урок завершен
            if (this.currentLessonId) {
                const progress = this.userProgress[this.currentLessonId];
                if (progress) {
                    progress.fill(true);
                }

                const lessonIndex = this.lessons.findIndex(l => l.id === this.currentLessonId);
                if (lessonIndex !== -1) {
                    this.lessons[lessonIndex].completed = true;
                }
            }

            return null;
        }
    }

    public previousStep(): LessonStep | null {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            const lesson = this.getCurrentLesson();
            return lesson?.steps[this.currentStepIndex] || null;
        }
        return null;
    }

    public markStepCompleted(): void {
        if (this.currentLessonId && this.userProgress[this.currentLessonId]) {
            this.userProgress[this.currentLessonId][this.currentStepIndex] = true;
        }
    }

    public getLessonProgress(lessonId: string): number {
        const progress = this.userProgress[lessonId];
        if (!progress) return 0;

        const completedSteps = progress.filter(step => step).length;
        return (completedSteps / progress.length) * 100;
    }

    public getAllLessons(): Lesson[] {
        return this.lessons;
    }

    public getLessonsByCategory(category: string): Lesson[] {
        return this.lessons.filter(lesson => lesson.category === category);
    }

    public getLessonsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Lesson[] {
        return this.lessons.filter(lesson => lesson.difficulty === difficulty);
    }
}

export default LessonManager;