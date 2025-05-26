// Демо компонент
import React, {useState} from "react";
import {QuestDecision, QuestDialog} from "./QuestDialog";
import {QuestNodeType} from "../../../../core/logic/quests/questNode.ts";

import "../styles/questDialog.scss"


interface QuestNode {
    id: string;
    description: string;
    type: QuestNodeType;
    decisions: QuestDecision[];
    characterName?: string;
    characterPortrait?: string;
}

// Демо данные
const demoNodes: QuestNode[] = [
    {
        id: 'intro',
        description: 'Приветствую, путник! Я Элдер Марк, хранитель древних знаний. Вижу, ты новичок в наших краях. Не желаешь ли помочь старику с небольшим поручением?',
        type: QuestNodeType.DIALOGUE,
        characterName: 'Элдер Марк',
        characterPortrait: '🧙‍♂️',
        decisions: [
            {
                id: 'accept',
                text: 'Конечно, чем могу помочь?',
                nextNodeId: 'task_explain',
                isAvailable: true
            },
            {
                id: 'refuse',
                text: 'Извините, но у меня нет времени.',
                nextNodeId: 'refuse_response',
                isAvailable: true
            },
            {
                id: 'ask_reward',
                text: 'А что мне за это будет?',
                nextNodeId: 'reward_explain',
                isAvailable: true
            }
        ]
    },
    {
        id: 'task_explain',
        description: 'Превосходно! Видишь ли, в старой башне на востоке завелись крысы. Они портят мои древние свитки. Принеси мне 5 крысиных хвостов, и я щедро отблагодарю тебя.',
        type: QuestNodeType.DIALOGUE,
        characterName: 'Элдер Марк',
        characterPortrait: '🧙‍♂️',
        decisions: [
            {
                id: 'accept_task',
                text: 'Понял, сделаю это!',
                nextNodeId: 'end',
                isAvailable: true
            },
            {
                id: 'ask_details',
                text: 'Расскажите подробнее о башне.',
                nextNodeId: 'tower_details',
                isAvailable: true
            }
        ]
    },
    {
        id: 'refuse_response',
        description: 'Понимаю, молодость всегда торопится. Но если передумаешь - я буду здесь. Древние тайны никуда не денутся.',
        type: QuestNodeType.DIALOGUE,
        characterName: 'Элдер Марк',
        characterPortrait: '🧙‍♂️',
        decisions: [
            {
                id: 'end_conversation',
                text: 'До свидания.',
                nextNodeId: 'end',
                isAvailable: true
            },
            {
                id: 'reconsider',
                text: 'Подождите, я передумал...',
                nextNodeId: 'intro',
                isAvailable: true
            }
        ]
    },
    {
        id: 'reward_explain',
        description: 'Ах, практичный подход! Мне это нравится. За твою помощь я дам тебе 100 золотых монет и зелье восстановления здоровья. Достойная награда за простую работу, не так ли?',
        type: QuestNodeType.DIALOGUE,
        characterName: 'Элдер Марк',
        characterPortrait: '🧙‍♂️',
        decisions: [
            {
                id: 'accept_with_reward',
                text: 'Справедливо, я согласен!',
                nextNodeId: 'task_explain',
                isAvailable: true
            },
            {
                id: 'negotiate',
                text: 'Можно ли увеличить награду?',
                nextNodeId: 'negotiate_response',
                isAvailable: false,
                tooltip: 'Требуется: Навык торговли 15+'
            }
        ]
    }
];


const QuestDialogDemo: React.FC = () => {
    const [currentNodeId, setCurrentNodeId] = useState<string>('intro');
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

    const currentNode = demoNodes.find(node => node.id === currentNodeId);

    const handleDecisionSelect = (decision: QuestDecision) => {
        console.log('Selected decision:', decision);

        if (decision.nextNodeId === 'end') {
            setIsDialogVisible(false);
            return;
        }

        const nextNode = demoNodes.find(node => node.id === decision.nextNodeId);
        if (nextNode) {
            setCurrentNodeId(decision.nextNodeId);
        }
    };

    const handleCloseDialog = () => {
        setIsDialogVisible(false);
    };

    const startDialog = () => {
        setCurrentNodeId('intro');
        setIsDialogVisible(true);
    };

    return (
        <div className="demo-container" style={{position: "relative", zIndex: 99999}}>
            <div className="demo-background">
                <h1>Quest Dialog System</h1>
                <button className="demo-button" onClick={startDialog}>
                    Начать диалог с NPC
                </button>

                <div className="demo-info">
                    <h3>Особенности системы:</h3>
                    <ul>
                        <li>Полупрозрачный фон с блюром</li>
                        <li>Портрет и имя персонажа</li>
                        <li>Варианты ответов с условиями доступности</li>
                        <li>Подсказки для заблокированных вариантов</li>
                        <li>Плавные анимации появления</li>
                        <li>Закрытие по клику вне диалога</li>
                    </ul>
                </div>
            </div>

            {currentNode && (
                <QuestDialog
                    node={currentNode}
                    isVisible={isDialogVisible}
                    onDecisionSelect={handleDecisionSelect}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
};

export default QuestDialogDemo;