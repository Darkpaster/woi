interface StatusBarProps {
    value: number;
    max: number;
    color: string;
    label?: string;
}

// Компонент для отображения полосы статуса (здоровье, мана, выносливость)
const StatusBar: React.FC<StatusBarProps> = ({ value, max, color, label }) => (
    <div className="flex items-center w-full mb-1">
        {label && <span className="text-xs mr-2 w-16 text-gray-300">{label}:</span>}
        <div className="flex-grow h-4 bg-gray-700 rounded-sm overflow-hidden relative">
            <div
                className={`h-full ${color}`}
                style={{ width: `${Math.min((value / max) * 100, 100)}%`, transition: 'width 0.3s ease-out' }}
            />
            <span className="absolute inset-x-0 text-center text-xs text-white leading-4">
        {`${value}/${max}`}
      </span>
        </div>
    </div>
);

export default StatusBar;