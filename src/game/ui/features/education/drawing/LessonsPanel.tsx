import LessonManager from "./lessonManager.ts";
import {Lesson} from "./types.ts";

interface LessonsPanelProps {
    lessons: Lesson[];
    onStartLesson: (lessonId: string) => void;
    lessonManager: LessonManager;
}

const LessonsPanel: React.FC<LessonsPanelProps> = ({ lessons, onStartLesson, lessonManager }) => {
    const getDifficultyText = (difficulty: string): string => {
        switch(difficulty) {
            case 'beginner': return 'Начинающий';
            case 'intermediate': return 'Средний';
            case 'advanced': return 'Продвинутый';
            default: return '';
        }
    };

    return (
        <div className="lessons-panel">
            <h2>Уроки рисования</h2>
            <div className="lesson-grid">
                {lessons.map(lesson => (
                    <div key={lesson.id} className={`lesson-card ${lesson.difficulty}`}>
                        <h3>{lesson.title}</h3>
                        <span className="lesson-category">Категория: {lesson.category}</span>
                        <span className="lesson-difficulty">
              Сложность: {getDifficultyText(lesson.difficulty)}
            </span>
                        <div className="lesson-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-value"
                                    style={{ width: `${lessonManager.getLessonProgress(lesson.id)}%` }}
                                />
                            </div>
                            <span>{Math.round(lessonManager.getLessonProgress(lesson.id))}%</span>
                        </div>
                        <button
                            className="start-lesson-btn"
                            onClick={() => onStartLesson(lesson.id)}
                        >
                            {lesson.completed ? 'Повторить' : 'Начать'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LessonsPanel;