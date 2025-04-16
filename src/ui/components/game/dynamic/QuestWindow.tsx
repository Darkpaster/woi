type Quest = {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'failed';
    objectives: { text: string; completed: boolean }[];
    level: number;
    rewards: string[];
    dialogHistory?: { speaker: string; text: string }[];
};

const QuestWindow: React.FC = () => {
    const [quests, setQuests] = useState<Quest[]>([
        {
            id: 'q1',
            title: 'Таинственная башня',
            description: 'Исследуйте древнюю башню на востоке от города и выясните, что там происходит.',
            status: 'active',
            objectives: [
                { text: 'Добраться до башни', completed: true },
                { text: 'Найти вход в башню', completed: false },
                { text: 'Исследовать первый этаж', completed: false },
            ],
            level: 5,
            rewards: ['100 золота', 'Опыт: 500', 'Свиток телепортации'],
            dialogHistory: [
                { speaker: 'Старейшина', text: 'Путник, у меня есть важное поручение.' },
                { speaker: 'Игрок', text: 'Что случилось?' },
                { speaker: 'Старейшина', text: 'На востоке есть древняя башня. Оттуда доносятся странные звуки по ночам.' },
                { speaker: 'Старейшина', text: 'Никто из жителей не решается подойти ближе. Мы нуждаемся в смелом герое, который выяснит, что там происходит.' },
            ]
        },
        {
            id: 'q2',
            title: 'Пропавший караван',
            description: 'Найдите пропавший торговый караван и верните ценный груз.',
            status: 'active',
            objectives: [
                { text: 'Поговорить с купцом', completed: true },
                { text: 'Найти следы каравана', completed: true },
                { text: 'Выследить бандитов', completed: false },
                { text: 'Вернуть груз', completed: false },
            ],
            level: 7,
            rewards: ['200 золота', 'Опыт: 750', 'Редкая броня'],
        },
        {
            id: 'q3',
            title: 'Древний артефакт',
            description: 'Помогите археологу найти древний артефакт в руинах храма.',
            status: 'completed',
            objectives: [
                { text: 'Встретиться с археологом', completed: true },
                { text: 'Найти вход в руины', completed: true },
                { text: 'Решить головоломку храма', completed: true },
                { text: 'Получить артефакт', completed: true },
            ],
            level: 10,
            rewards: ['500 золота', 'Опыт: 1200', 'Магический посох'],
        },
    ]);

    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'failed'>('active');
    const [selectedQuest, setSelectedQuest] = useState<string>(quests[0].id);
    const [showDialog, setShowDialog] = useState(false);

    const filteredQuests = quests.filter(quest => quest.status === activeTab);
    const currentQuest = quests.find(quest => quest.id === selectedQuest);

    return (
        <div className="w-full max-w-4xl bg-gray-800 text-white rounded-lg shadow-lg flex h-96">
            {/* Левая часть - список квестов */}
            <div className="w-1/3 border-r border-gray-700">
                <div className="flex border-b border-gray-700">
                    <Tab
                        title="Активные"
                        isActive={activeTab === 'active'}
                        onClick={() => setActiveTab('active')}
                    />
                    <Tab
                        title="Завершенные"
                        isActive={activeTab === 'completed'}
                        onClick={() => setActiveTab('completed')}
                    />
                    <Tab
                        title="Проваленные"
                        isActive={activeTab === 'failed'}
                        onClick={() => setActiveTab('failed')}
                    />
                </div>

                <div className="overflow-y-auto h-full">
                    {filteredQuests.map(quest => (
                        <div
                            key={quest.id}
                            className={`p-3 border-b border-gray-700 cursor-pointer ${selectedQuest === quest.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                            onClick={() => {
                                setSelectedQuest(quest.id);
                                setShowDialog(false);
                            }}
                        >
                            <div className="font-bold">{quest.title}</div>
                            <div className="text-sm text-gray-400">Уровень: {quest.level}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Правая часть - детали квеста */}
            {currentQuest && (
                <div className="w-2/3 p-4 flex flex-col">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-bold">{currentQuest.title}</h2>
                        <div className="flex space-x-2">
                            {currentQuest.dialogHistory && (
                                <button
                                    className={`px-3 py-1 rounded ${showDialog ? 'bg-blue-600' : 'bg-gray-700'}`}
                                    onClick={() => setShowDialog(!showDialog)}
                                >
                                    <MessageCircle size={16} className="inline mr-1" />
                                    Диалог
                                </button>
                            )}
                            <button className="bg-gray-700 p-1 rounded">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {showDialog && currentQuest.dialogHistory ? (
                        <div className="mt-4 flex-grow overflow-y-auto bg-gray-900 p-3 rounded">
                            {currentQuest.dialogHistory.map((entry, index) => (
                                <div key={index} className="mb-3">
                                    <div className={`font-bold ${entry.speaker === 'Игрок' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                        {entry.speaker}:
                                    </div>
                                    <div className="pl-3">{entry.text}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="text-gray-300 mt-2">{currentQuest.description}</div>

                            <div className="mt-4">
                                <h3 className="font-bold border-b border-gray-700 pb-1 mb-2">Задачи:</h3>
                                {currentQuest.objectives.map((objective, idx) => (
                                    <div key={idx} className="flex items-center mb-1">
                                        <input
                                            type="checkbox"
                                            checked={objective.completed}
                                            readOnly
                                            className="mr-2"
                                        />
                                        <span className={objective.completed ? 'line-through text-gray-500' : ''}>
                      {objective.text}
                    </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <h3 className="font-bold border-b border-gray-700 pb-1 mb-2">Награды:</h3>
                                <ul className="list-disc pl-5">
                                    {currentQuest.rewards.map((reward, idx) => (
                                        <li key={idx}>{reward}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestWindow;