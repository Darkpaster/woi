import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import Tab from "../../../shared/ui/Tab.tsx";
import "../styles/questItem.scss"
import "../styles/questWindow.scss"

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

const QuestsWindow: React.FC = () => {
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
        <div className="quest-window">
            {/* Левая часть - список квестов */}
            <div className="quest-window__sidebar">
                <div className="quest-window__tabs">
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

                <div className="quest-window__quest-list">
                    {filteredQuests.map(quest => (
                        <div
                            key={quest.id}
                            className={`quest-item ${selectedQuest === quest.id ? 'quest-item--selected' : ''}`}
                            onClick={() => {
                                setSelectedQuest(quest.id);
                                setShowDialog(false);
                            }}
                        >
                            <div className="quest-item__title">{quest.title}</div>
                            <div className="quest-item__level">Уровень: {quest.level}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Правая часть - детали квеста */}
            {currentQuest && (
                <div className="quest-window__content">
                    <div className="quest-window__header">
                        <h2 className="quest-window__title">{currentQuest.title}</h2>
                        <div className="quest-window__controls">
                            {currentQuest.dialogHistory && (
                                <button
                                    className={`quest-window__dialog-btn ${showDialog ? 'quest-window__dialog-btn--active' : ''}`}
                                    onClick={() => setShowDialog(!showDialog)}
                                >
                                    <MessageCircle size={16} />
                                    Диалог
                                </button>
                            )}
                            <button className="quest-window__close-btn">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {showDialog && currentQuest.dialogHistory ? (
                        <div className="quest-window__dialog">
                            {currentQuest.dialogHistory.map((entry, index) => (
                                <div key={index} className="dialog-entry">
                                    <div className={`dialog-entry__speaker ${entry.speaker === 'Игрок' ? 'dialog-entry__speaker--player' : 'dialog-entry__speaker--npc'}`}>
                                        {entry.speaker}:
                                    </div>
                                    <div className="dialog-entry__text">{entry.text}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="quest-window__description">{currentQuest.description}</div>

                            <div className="quest-window__section">
                                <h3 className="quest-window__section-title">Задачи:</h3>
                                {currentQuest.objectives.map((objective, idx) => (
                                    <div key={idx} className="objective">
                                        <input
                                            type="checkbox"
                                            checked={objective.completed}
                                            readOnly
                                            className="objective__checkbox"
                                        />
                                        <span className={`objective__text ${objective.completed ? 'objective__text--completed' : ''}`}>
                                            {objective.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="quest-window__section">
                                <h3 className="quest-window__section-title">Награды:</h3>
                                <ul className="rewards-list">
                                    {currentQuest.rewards.map((reward, idx) => (
                                        <li key={idx} className="rewards-list__item">{reward}</li>
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

export default QuestsWindow;