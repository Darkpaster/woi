
interface StatusBarProps {
    value: number;
    max: number;
    color: string; // "health" | "mana" | "stamina"
    label?: string;
}

// Компонент для отображения полосы статуса (здоровье, мана, выносливость)
const StatusBar: React.FC<StatusBarProps> = ({ value, max, color, label }) => (
    <div className="status-bar-container">
        {label && <span className="status-label">{label}:</span>}
        <div className="status-bar-background">
            <div
                className={`status-bar-fill ${color}`}
                style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
            />
            <span className="status-bar-text">
                {`${value}/${max}`}
            </span>
        </div>
    </div>
);

export default StatusBar;