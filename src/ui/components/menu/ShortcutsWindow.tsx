
const ShortcutsWindow: React.FC = () => {
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

    return (
        <div className="w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Горячие клавиши</h2>
                <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">
                    <X size={16} />
                </button>
            </div>

            <div className="flex mb-4 border-b border-gray-700">
                {categories.map(category => (
                    <Tab
                        key={category}
                        title={category}
                        isActive={activeCategory === category}
                        onClick={() => setActiveCategory(category)}
                    />
                ))}
            </div>

            <div className="space-y-2">
                {filteredKeybinds.map(keybind => (
                    <div key={keybind.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                        <div>{keybind.action}</div>
                        <div className="flex space-x-2">
                            {editingId === keybind.id ? (
                                <div className="bg-blue-600 px-4 py-1 rounded min-w-16 text-center">
                                    Нажмите...
                                </div>
                            ) : (
                                <>
                                    <button
                                        className="bg-gray-600 px-4 py-1 rounded min-w-16 text-center"
                                        onClick={() => startBinding(keybind.id)}
                                    >
                                        {keybind.key || "Не назначено"}
                                    </button>
                                    <button
                                        className="bg-red-700 p-1 rounded hover:bg-red-600"
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

            <div className="mt-4 text-xs text-gray-400">
                Нажмите на клавишу, чтобы назначить действие. Используйте X для удаления привязки.
            </div>
        </div>
    );
};

export default ShortcutsWindow;