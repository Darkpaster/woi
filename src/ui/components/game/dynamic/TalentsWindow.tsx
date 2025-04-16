import {useState} from "react";

type TalentNode = {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    requires: string[];
    position: { x: number; y: number };
    maxRank: number;
    currentRank: number;
};

type TalentTree = {
    id: string;
    name: string;
    nodes: TalentNode[];
};

type TalentCategory = {
    id: string;
    name: string;
    trees: TalentTree[];
};

const TalentWindow: React.FC = () => {
    // Две основные категории талантов
    const [categories] = useState<TalentCategory[]>([
        {
            id: 'combat',
            name: 'Боевые',
            trees: [
                {
                    id: 'warrior',
                    name: 'Воин',
                    nodes: [
                        {
                            id: 'w1',
                            name: 'Мощный удар',
                            icon: '⚔️',
                            description: 'Наносит 150% урона одной цели',
                            unlocked: true,
                            requires: [],
                            position: { x: 1, y: 1 },
                            maxRank: 5,
                            currentRank: 3
                        },
                        {
                            id: 'w2',
                            name: 'Выносливость',
                            icon: '🛡️',
                            description: 'Увеличивает здоровье на 5% за уровень',
                            unlocked: true,
                            requires: [],
                            position: { x: 3, y: 1 },
                            maxRank: 3,
                            currentRank: 2
                        },
                        {
                            id: 'w3',
                            name: 'Рассечение',
                            icon: '🗡️',
                            description: 'Атака наносит урон по области',
                            unlocked: true,
                            requires: ['w1'],
                            position: { x: 1, y: 2 },
                            maxRank: 3,
                            currentRank: 1
                        },
                        {
                            id: 'w4',
                            name: 'Берсерк',
                            icon: '🔥',
                            description: 'Увеличивает скорость атаки на 20%',
                            unlocked: false,
                            requires: ['w1', 'w3'],
                            position: { x: 1, y: 3 },
                            maxRank: 1,
                            currentRank: 0
                        },
                        {
                            id: 'w5',
                            name: 'Стальная кожа',
                            icon: '🔒',
                            description: 'Уменьшает получаемый урон на 10%',
                            unlocked: false,
                            requires: ['w2'],
                            position: { x: 3, y: 2 },
                            maxRank: 2,
                            currentRank: 0
                        },
                    ]
                },
                {
                    id: 'archer',
                    name: 'Лучник',
                    nodes: [
                        {
                            id: 'a1',
                            name: 'Меткий выстрел',
                            icon: '🏹',
                            description: 'Увеличивает шанс критического удара на 5%',
                            unlocked: true,
                            requires: [],
                            position: { x: 2, y: 1 },
                            maxRank: 3,
                            currentRank: 2
                        },
                        {
                            id: 'a2',
                            name: 'Быстрая стрельба',
                            icon: '⚡',
                            description: 'Увеличивает скорость атаки на 10%',
                            unlocked: true,
                            requires: [],
                            position: { x: 4, y: 1 },
                            maxRank: 2,
                            currentRank: 1
                        },
                        {
                            id: 'a3',
                            name: 'Отравленные стрелы',
                            icon: '☠️',
                            description: 'Стрелы наносят дополнительный урон ядом',
                            unlocked: false,
                            requires: ['a1'],
                            position: { x: 2, y: 2 },
                            maxRank: 3,
                            currentRank: 0
                        },
                    ]
                },
                {
                    id: 'assassin',
                    name: 'Ассасин',
                    nodes: [
                        {
                            id: 's1',
                            name: 'Скрытность',
                            icon: '👁️',
                            description: 'Уменьшает шанс обнаружения',
                            unlocked: true,
                            requires: [],
                            position: { x: 3, y: 1 },
                            maxRank: 3,
                            currentRank: 1
                        },
                    ]
                }
            ]
        },
        {
            id: 'magic',
            name: 'Магия',
            trees: [
                {
                    id: 'fire',
                    name: 'Огонь',
                    nodes: [
                        {
                            id: 'f1',
                            name: 'Огненный шар',
                            icon: '🔥',
                            description: 'Запускает огненный шар, наносящий урон',
                            unlocked: true,
                            requires: [],
                            position: { x: 2, y: 1 },
                            maxRank: 5,
                            currentRank: 3
                        },
                        {
                            id: 'f2',
                            name: 'Обжигающий щит',
                            icon: '🛡️',
                            description: 'Защитный щит, наносящий урон врагам',
                            unlocked: true,
                            requires: [],
                            position: { x: 4, y: 1 },
                            maxRank: 3,
                            currentRank: 1
                        },
                        {
                            id: 'f3',
                            name: 'Огненный взрыв',
                            icon: '💥',
                            description: 'Взрыв, наносящий урон по области',
                            unlocked: false,
                            requires: ['f1'],
                            position: { x: 2, y: 2 },
                            maxRank: 3,
                            currentRank: 0
                        },
                    ]
                },
                {
                    id: 'ice',
                    name: 'Лёд',
                    nodes: [
                        {
                            id: 'i1',
                            name: 'Ледяная стрела',
                            icon: '❄️',
                            description: 'Запускает ледяную стрелу, замедляющую цель',
                            unlocked: true,
                            requires: [],
                            position: { x: 3, y: 1 },
                            maxRank: 3,
                            currentRank: 2
                        },
                    ]
                },
                {
                    id: 'lightning',
                    name: 'Молния',
                    nodes: [
                        {
                            id: 'l1',
                            name: 'Разряд молнии',
                            icon: '⚡',
                            description: 'Поражает цель электрическим разрядом',
                            unlocked: true,
                            requires: [],
                            position: { x: 2, y: 1 },
                            maxRank: 3,
                            currentRank: 1
                        },
                    ]
                },
                {
                    id: 'nature',
                    name: 'Природа',
                    nodes: [
                        {
                            id: 'n1',
                            name: 'Исцеление',
                            icon: '🌿',
                            description: 'Восстанавливает здоровье цели',
                            unlocked: true,
                            requires: [],
                            position: { x: 2, y: 1 },
                            maxRank: 5,
                            currentRank: 3
                        },
                    ]
                }
            ]
        }
    ]);

    const [activeCategory, setActiveCategory] = useState(categories[0].id);
    const [activeTree, setActiveTree] = useState(categories[0].trees[0].id);

    const currentCategory = categories.find(c => c.id === activeCategory)!;
    const currentTree = currentCategory.trees.find(t => t.id === activeTree)!;

    const drawArrow = (from: TalentNode, to: TalentNode) => {
        const fromX = from.position.x * 80 + 40;
        const fromY = from.position.y * 80 + 40;
        const toX = to.position.x * 80 + 40;
        const toY = to.position.y * 80 + 40;

        return (
            <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={from.currentRank > 0 ? "#4CAF50" : "#555"}
                strokeWidth="2"
            />
        );
    };

    const increaseRank = (nodeId: string) => {
        const updatedCategories = categories.map(category => ({
            ...category,
            trees: category.trees.map(tree => ({
                ...tree,
                nodes: tree.nodes.map(node =>
                    node.id === nodeId && node.currentRank < node.maxRank ?
                        { ...node, currentRank: node.currentRank + 1 } :
                        node
                )
            }))
        }));

        // Обычно тут был бы setState, но для примера мы не обновляем состояние
    };

    const decreaseRank = (nodeId: string) => {
        const updatedCategories = categories.map(category => ({
            ...category,
            trees: category.trees.map(tree => ({
                ...tree,
                nodes: tree.nodes.map(node =>
                    node.id === nodeId && node.currentRank > 0 ?
                        { ...node, currentRank: node.currentRank - 1 } :
                        node
                )
            }))
        }));

        // Обычно тут был бы setState, но для примера мы не обновляем состояние
    };

    const [selectedNode, setSelectedNode] = useState<TalentNode | null>(null);

    return (
        <div className="w-full max-w-4xl bg-gray-800 text-white rounded-lg shadow-lg flex flex-col h-96">
            {/* Верхние вкладки (категории) */}
            <div className="flex border-b border-gray-700">
                {categories.map(category => (
                    <Tab
                        key={category.id}
                        title={category.name}
                        isActive={activeCategory === category.id}
                        onClick={() => {
                            setActiveCategory(category.id);
                            setActiveTree(category.trees[0].id);
                            setSelectedNode(null);
                        }}
                    />
                ))}
                <div className="ml-auto p-2">
                    <X size={16} />
                </div>
            </div>

            <div className="flex flex-grow">
                {/* Боковые вкладки (деревья) */}
                <div className="w-28 bg-gray-900 border-r border-gray-700">
                    {currentCategory.trees.map(tree => (
                        <div
                            key={tree.id}
                            className={`p-3 text-center cursor-pointer ${activeTree === tree.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                            onClick={() => {
                                setActiveTree(tree.id);
                                setSelectedNode(null);
                            }}
                        >
                            {tree.name}
                        </div>
                    ))}
                </div>

                {/* Дерево талантов */}
                <div className="flex-grow relative p-4 overflow-auto">
                    <svg width="100%" height="100%" className="absolute top-0 left-0">
                        {currentTree.nodes.map(node =>
                            node.requires.map(reqId => {
                                const requiredNode = currentTree.nodes.find(n => n.id === reqId);
                                if (requiredNode) {
                                    return <React.Fragment key={`${node.id}-${reqId}`}>
                                        {drawArrow(requiredNode, node)}
                                    </React.Fragment>;
                                }
                                return null;
                            })
                        )}
                    </svg>

                    <div className="relative">
                        {currentTree.nodes.map(node => (
                            <div
                                key={node.id}
                                className={`absolute w-16 h-16 rounded-full flex items-center justify-center cursor-pointer
                  ${node.unlocked ? (node.currentRank > 0 ? 'bg-green-700' : 'bg-gray-700') : 'bg-gray-900 opacity-50'}`}
                                style={{
                                    left: `${node.position.x * 80}px`,
                                    top: `${node.position.y * 80}px`
                                }}
                                onClick={() => setSelectedNode(node)}
                            >
                                <div className="text-2xl">{node.icon}</div>
                                <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full w-6 h-6 flex items-center justify-center">
                                    {node.currentRank}/{node.maxRank}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Детали выбранного таланта */}
                {selectedNode && (
                    <div className="w-64 bg-gray-900 border-l border-gray-700 p-4">
                        <div className="font-bold text-lg mb-2">{selectedNode.name}</div>
                        <div className="flex items-center mb-4">
                            <div className="text-2xl mr-2">{selectedNode.icon}</div>
                            <div>
                                Ранг: {selectedNode.currentRank}/{selectedNode.maxRank}
                            </div>
                        </div>

                        <div className="text-sm mb-4">
                            {selectedNode.description}
                        </div>

                        <div className="flex justify-between">
                            <button
                                className={`px-4 py-1 rounded ${
                                    selectedNode.currentRank > 0 ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-700 cursor-not-allowed'
                                }`}
                                onClick={() => decreaseRank(selectedNode.id)}
                                disabled={selectedNode.currentRank === 0}
                            >
                                -
                            </button>
                            <button
                                className={`px-4 py-1 rounded ${
                                    selectedNode.currentRank < selectedNode.maxRank && selectedNode.unlocked ?
                                        'bg-green-700 hover:bg-green-600' : 'bg-gray-700 cursor-not-allowed'
                                }`}
                                onClick={() => increaseRank(selectedNode.id)}
                                disabled={selectedNode.currentRank === selectedNode.maxRank || !selectedNode.unlocked}
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TalentWindow;