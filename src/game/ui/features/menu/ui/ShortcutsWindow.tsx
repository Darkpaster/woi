// components/ShortcutsWindow.tsx
import React, { useState } from "react";
import Tab from "../../../shared/ui/Tab.tsx";
import { X } from "lucide-react";
import "../styles/shortcuts.scss";

interface Keybind {
    id: string;
    action: string;
    key: string | null;
    category: string;
}

interface ShortcutsWindowProps {
    onClose?: () => void;
    theme?: 'light' | 'dark';
}

const ShortcutsWindow: React.FC<ShortcutsWindowProps> = ({
                                                             onClose,
                                                             theme = 'light'
                                                         }) => {
    const [keybinds, setKeybinds] = useState<Keybind[]>([
        { id: '1', action: 'Атака', key: 'A', category: 'Бой' },
        { id: '2', action: 'Блок', key: 'S', category: 'Бой' },
        { id: '3', action: 'Умение 1', key: '1', category: 'Умения' },
        { id: '4', action: 'Умение 2', key: '2', category: 'Умения' },
        { id: '5', action: 'Умение 3', key: '3', category: 'Умения' },
        { id: '6', action: 'Открыть инвентарь', key: 'I', category: 'Интерфейс' },
        { id: '7', action: 'Открыть карту', key: 'M', category: 'Интерфейс' },
    ]);

    const [activeCategory, setActiveCategory] = useState<string>('Все');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [listeningForKey, setListeningForKey] = useState(false);

    const categories = ['Все', 'Бой', 'Умения', 'Интерфейс'];

    const startBinding = (id: string) => {
        setEditingId(id);
        setListeningForKey(true);
    };

    const handleKeyPress = (id: string, key: string) => {
        setKeybinds(keybinds.map(kb =>
            kb.id === id ? { ...kb, key } : kb
        ));
        setEditingId(null);
        setListeningForKey(false);
    };

    const clearKeybind = (id: string) => {
        setKeybinds(keybinds.map(kb =>
            kb.id === id ? { ...kb, key: null } : kb
        ));
    };

    const filteredKeybinds = activeCategory === 'Все'
        ? keybinds
        : keybinds.filter(kb => kb.category === activeCategory);

    const getKeyButtonClasses = (keybind: Keybind) => {
        let classes = 'shortcuts-window__key-button';

        if (editingId === keybind.id) {
            classes += ' shortcuts-window__key-button--listening';
        }

        if (!keybind.key) {
            classes += ' shortcuts-window__key-button--unassigned';
        }

        return classes;
    };

    const windowClasses = `shortcuts-window ${theme === 'dark' ? 'shortcuts-window--dark' : ''}`;

    return (
        <div className={windowClasses}>
            <div className="shortcuts-window__header">
                <h2 className="shortcuts-window__header-title">Горячие клавиши</h2>
                <button
                    className="shortcuts-window__header-close-btn"
                    onClick={onClose}
                >
                    <X size={16} />
                </button>
            </div>

            <div className="shortcuts-window__tabs">
                {categories.map(category => (
                    <Tab
                        key={category}
                        title={category}
                        isActive={activeCategory === category}
                        onClick={() => setActiveCategory(category)}
                    />
                ))}
            </div>

            <div className="shortcuts-window__keybinds">
                {filteredKeybinds.map(keybind => (
                    <div key={keybind.id} className="shortcuts-window__keybind-item">
                        <div className="shortcuts-window__keybind-item-action">
                            {keybind.action}
                        </div>
                        <div className="shortcuts-window__keybind-item-controls">
                            {editingId === keybind.id ? (
                                <div className="shortcuts-window__key-button shortcuts-window__key-button--listening">
                                    Нажмите...
                                </div>
                            ) : (
                                <>
                                    <button
                                        className={getKeyButtonClasses(keybind)}
                                        onClick={() => startBinding(keybind.id)}
                                    >
                                        {keybind.key || "Не назначено"}
                                    </button>
                                    <button
                                        className="shortcuts-window__clear-button"
                                        onClick={() => clearKeybind(keybind.id)}
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="shortcuts-window__help-text">
                Нажмите на клавишу, чтобы назначить действие. Используйте X для удаления привязки.
            </div>
        </div>
    );
};

export default ShortcutsWindow;