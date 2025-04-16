export interface Point {
    x: number;
    y: number;
}

export interface DrawingTools {
    pencil: boolean;
    brush: boolean;
    eraser: boolean;
    line: boolean;
    rectangle: boolean;
    circle: boolean;
}

export interface LessonStep {
    id: string;
    title: string;
    description: string;
    imageReference?: string;
    expectedResult?: string;
    hints: string[];
    duration: number; // в минутах
}

export interface Lesson {
    id: string;
    title: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    steps: LessonStep[];
    completed: boolean;
}