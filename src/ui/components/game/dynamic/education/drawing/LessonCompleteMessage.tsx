interface LessonCompleteMessageProps {
    lessonTitle: string;
    onReturn: () => void;
}

const LessonCompleteMessage: React.FC<LessonCompleteMessageProps> = ({ lessonTitle, onReturn }) => {
    return (
        <div className="lesson-complete">
            <h3>Урок завершен!</h3>
            <p>Поздравляем! Вы успешно завершили урок "{lessonTitle}".</p>
            <button onClick={onReturn}>Вернуться к списку уроков</button>
        </div>
    );
};

export default LessonCompleteMessage;