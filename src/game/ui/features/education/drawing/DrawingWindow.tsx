import {useEffect, useState} from "react";
import LessonManager from "./lessonManager.ts";
import {Lesson, LessonStep} from "./types.ts";
import "./styles.scss";
import ToolsPanel from "./ToolsPanel.tsx";
import LessonsPanel from "./LessonsPanel.tsx";
import FeedbackPanel from "./FeedbackPanel.tsx";
import DrawingCanvas from "./DrawingCanvas.tsx";

const DrawingWindow: React.FC = () => {
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
    const [canvasManager, setCanvasManager] = useState<any>(null);
    const [lessonManager] = useState<LessonManager>(new LessonManager());
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [currentStep, setCurrentStep] = useState<LessonStep | null>(null);
    const [currentTool, setCurrentTool] = useState<string>('pencil');
    const [currentColor, setCurrentColor] = useState<string>('#000000');
    const [lineWidth, setLineWidth] = useState<number>(2);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);

    useEffect(() => {
        setAllLessons(lessonManager.getAllLessons());
    }, [lessonManager]);

    useEffect(() => {
        if (canvasRef) {
            // Здесь можно инициализировать Canvas Manager, используя Canvas API
            // Этот код зависит от реализации Canvas из предыдущего кода
            const ctx = canvasRef.getContext('2d');
            if (ctx) {
                // Инициализируем канвас и настраиваем
                const newCanvasManager = {
                    // Базовые методы для работы с канвасом
                    setTool: (tool: string) => {
                        setCurrentTool(tool);
                        // Логика смены инструмента
                    },
                    setColor: (color: string) => {
                        setCurrentColor(color);
                        // Логика смены цвета
                    },
                    setLineWidth: (width: number) => {
                        setLineWidth(width);
                        // Логика смены толщины линии
                    },
                    clear: () => {
                        // Очистка канваса
                        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
                    },
                    undo: () => {
                        // Логика отмены действия
                    },
                    redo: () => {
                        // Логика повтора действия
                    },
                    saveImage: () => {
                        // Логика сохранения изображения
                        return canvasRef.toDataURL('image/png');
                    }
                };

                setCanvasManager(newCanvasManager);
            }
        }
    }, [canvasRef]);

    const handleCanvasRef = (ref: HTMLCanvasElement | null) => {
        setCanvasRef(ref);
    };

    const startLesson = (lessonId: string) => {
        const step = lessonManager.startLesson(lessonId);
        const lesson = lessonManager.getCurrentLesson();
        setCurrentLesson(lesson);
        setCurrentStep(step);
    };

    const nextStep = () => {
        lessonManager.markStepCompleted();
        const nextStep = lessonManager.nextStep();
        setCurrentStep(nextStep);

        if (!nextStep) {
            // Урок завершен
            setAllLessons([...lessonManager.getAllLessons()]);
        }
    };

    const previousStep = () => {
        const prevStep = lessonManager.previousStep();
        setCurrentStep(prevStep);
    };

    const addCustomLesson = (lesson: Lesson) => {
        lessonManager.addLesson(lesson);
        setAllLessons([...lessonManager.getAllLessons()]);
    };

    const handleToolChange = (tool: string) => {
        if (canvasManager) {
            canvasManager.setTool(tool);
        }
    };

    const handleColorChange = (color: string) => {
        if (canvasManager) {
            canvasManager.setColor(color);
        }
    };

    const handleLineWidthChange = (width: number) => {
        if (canvasManager) {
            canvasManager.setLineWidth(width);
        }
    };

    const handleUndo = () => {
        if (canvasManager) {
            canvasManager.undo();
        }
    };

    const handleRedo = () => {
        if (canvasManager) {
            canvasManager.redo();
        }
    };

    const handleClear = () => {
        if (canvasManager) {
            canvasManager.clear();
        }
    };

    const handleSave = () => {
        if (canvasManager) {
            const dataUrl = canvasManager.saveImage();
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'drawing.png';
            link.click();
        }
    };

    const closeLesson = () => {
        setCurrentLesson(null);
        setCurrentStep(null);
    };

    return (
        <div className="app">
            <header className="header">
                <h1>Система обучения рисованию</h1>
            </header>

            <div className="container">
                <ToolsPanel
                    onToolChange={handleToolChange}
                    onColorChange={handleColorChange}
                    onLineWidthChange={handleLineWidthChange}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClear={handleClear}
                    onSave={handleSave}
                    currentTool={currentTool}
                    currentColor={currentColor}
                    lineWidth={lineWidth}
                />

                <div className="canvas-container">
                    <DrawingCanvas onRef={handleCanvasRef} />
                </div>

                <LessonsPanel
                    lessons={allLessons}
                    onStartLesson={startLesson}
                    lessonManager={lessonManager}
                />
            </div>

            <FeedbackPanel
                currentLesson={currentLesson}
                currentStep={currentStep}
                onNextStep={nextStep}
                onPrevStep={previousStep}
                onCloseLesson={closeLesson}
            />
        </div>
    );
};

export default DrawingWindow;