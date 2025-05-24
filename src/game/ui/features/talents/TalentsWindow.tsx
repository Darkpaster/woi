import React, { useState } from 'react';
import { X } from 'lucide-react';

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
    const [selectedNode, setSelectedNode] = useState<TalentNode | null>(null);

    const currentCategory = categories.find(c => c.id === activeCategory)!;
    const currentTree = currentCategory.trees.find(t => t.id === activeTree)!;

    const drawArrow = (from: TalentNode, to: TalentNode) => {
        const fromX = from.position.x * 80 + 40;
        const fromY = from.position.y * 80 + 40;
        const toX = to.position.x * 80 + 40;
        const toY = to.position.y * 80 + 40;

        return (
            <line
                key={`${from.id}-${to.id}`}
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
        // Функция для увеличения ранга таланта
        console.log(`Увеличить ранг таланта ${nodeId}`);
    };

    const decreaseRank = (nodeId: string) => {
        // Функция для уменьшения ранга таланта
        console.log(`Уменьшить ранг таланта ${nodeId}`);
    };

    return (
        <div className="talent-window">
            {/* Верхние вкладки (категории) */}
            <div className="talent-window__header">
                <div className="talent-window__tabs">
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
                </div>
                <div className="talent-window__close">
                    <X size={16} />
                </div>
            </div>

            <div className="talent-window__body">
                {/* Боковые вкладки (деревья) */}
                <div className="talent-window__sidebar">
                    {currentCategory.trees.map(tree => (
                        <div
                            key={tree.id}
                            className={`tree-tab ${activeTree === tree.id ? 'tree-tab--active' : ''}`}
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
                <div className="talent-window__tree">
                    <svg className="talent-window__connections">
                        {currentTree.nodes.map(node =>
                            node.requires.map(reqId => {
                                const requiredNode = currentTree.nodes.find(n => n.id === reqId);
                                if (requiredNode) {
                                    return drawArrow(requiredNode, node);
                                }
                                return null;
                            })
                        )}
                    </svg>

                    <div className="talent-window__nodes">
                        {currentTree.nodes.map(node => (
                            <div
                                key={node.id}
                                className={`talent-node ${
                                    node.unlocked
                                        ? (node.currentRank > 0 ? 'talent-node--active' : 'talent-node--available')
                                        : 'talent-node--locked'
                                }`}
                                style={{
                                    left: `${node.position.x * 80}px`,
                                    top: `${node.position.y * 80}px`
                                }}
                                onClick={() => setSelectedNode(node)}
                            >
                                <div className="talent-node__icon">{node.icon}</div>
                                <div className="talent-node__rank">
                                    {node.currentRank}/{node.maxRank}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Детали выбранного таланта */}
                {selectedNode && (
                    <div className="talent-window__details">
                        <div className="talent-details">
                            <div className="talent-details__header">
                                <div className="talent-details__name">{selectedNode.name}</div>
                                <div className="talent-details__info">
                                    <div className="talent-details__icon">{selectedNode.icon}</div>
                                    <div className="talent-details__rank">
                                        Ранг: {selectedNode.currentRank}/{selectedNode.maxRank}
                                    </div>
                                </div>
                            </div>

                            <div className="talent-details__description">
                                {selectedNode.description}
                            </div>

                            <div className="talent-details__controls">
                                <button
                                    className={`talent-btn talent-btn--decrease ${
                                        selectedNode.currentRank > 0 ? '' : 'talent-btn--disabled'
                                    }`}
                                    onClick={() => decreaseRank(selectedNode.id)}
                                    disabled={selectedNode.currentRank === 0}
                                >
                                    -
                                </button>
                                <button
                                    className={`talent-btn talent-btn--increase ${
                                        selectedNode.currentRank < selectedNode.maxRank && selectedNode.unlocked
                                            ? '' : 'talent-btn--disabled'
                                    }`}
                                    onClick={() => increaseRank(selectedNode.id)}
                                    disabled={selectedNode.currentRank === selectedNode.maxRank || !selectedNode.unlocked}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TalentWindow;