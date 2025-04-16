import {Lesson, LessonStep} from "./types.ts";

interface FeedbackPanelProps {
    currentLesson: Lesson | null;
    currentStep: LessonStep | null;
    onNextStep: () => void;
    onPrevStep: () => void;
    onCloseLesson: () => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
                                                         currentLesson,
                                                         currentStep,
                                                         onNextStep,
                                                         onPrevStep,
                                                         onCloseLesson
                                                     }) => {
    if (!currentLesson || !currentStep) {
        return <div className="feedback-panel empty">
            <p>Выберите урок для начала обучения</p>
        </div>;
    }

    return (
        <div className="feedback-panel">
            <div className="step-info">
                <h3>{currentLesson.title}</h3>
                <h4>Шаг {currentLesson.steps.findIndex(step => step.id === currentStep.id) + 1}: {currentStep.title}</h4>
                <p>{currentStep.description}</p>
                <h5>Подсказки:</h5>
                <ul className="hints-list">
                    {currentStep.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                    ))}
                </ul>
                <p className="step-duration">Рекомендуемое время: {currentStep.duration} мин.</p>
            </div>

            {currentStep.imageReference && (
                <div className="reference-image">
                    <h5>Образец:</h5>
                    <img src={currentStep.imageReference} alt="Образец для данного шага" />
                </div>
            )}

            <div className="navigation-buttons">
                <button onClick={onPrevStep}>⬅️ Предыдущий</button>
                <button onClick={onCloseLesson}>Закрыть урок</button>
                <button onClick={onNextStep}>✓ Завершить шаг</button>
            </div>
        </div>
    );
};

export default FeedbackPanel;