interface ToolsPanelProps {
    onToolChange: (tool: string) => void;
    onColorChange: (color: string) => void;
    onLineWidthChange: (width: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onSave: () => void;
    currentTool: string;
    currentColor: string;
    lineWidth: number;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({
                                                   onToolChange,
                                                   onColorChange,
                                                   onLineWidthChange,
                                                   onUndo,
                                                   onRedo,
                                                   onClear,
                                                   onSave,
                                                   currentTool,
                                                   currentColor,
                                                   lineWidth
                                               }) => {
    const tools = [
        { name: 'pencil', label: 'Карандаш', icon: '✏️' },
        { name: 'brush', label: 'Кисть', icon: '🖌️' },
        { name: 'eraser', label: 'Ластик', icon: '🧹' },
        { name: 'line', label: 'Линия', icon: '📏' },
        { name: 'rectangle', label: 'Прямоугольник', icon: '⬜' },
        { name: 'circle', label: 'Круг', icon: '⭕' }
    ];

    return (
        <div className="tools-panel">
            <div className="tools-section">
                {tools.map(tool => (
                    <button
                        key={tool.name}
                        className={`tool-button ${currentTool === tool.name ? 'active' : ''}`}
                        onClick={() => onToolChange(tool.name)}
                    >
                        {tool.icon} {tool.label}
                    </button>
                ))}
            </div>

            <div className="color-control">
                <label>Цвет:</label>
                <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => onColorChange(e.target.value)}
                />
            </div>

            <div className="line-width-control">
                <label>Толщина: {lineWidth}</label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={lineWidth}
                    onChange={(e) => onLineWidthChange(parseInt(e.target.value))}
                />
            </div>

            <div className="action-buttons">
                <button onClick={onUndo}>↩️ Отменить</button>
                <button onClick={onRedo}>↪️ Повторить</button>
                <button onClick={onClear}>🗑️ Очистить</button>
                <button onClick={onSave}>💾 Сохранить</button>
            </div>
        </div>
    );
};

export default ToolsPanel;