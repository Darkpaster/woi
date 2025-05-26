import React, { useState } from 'react';
// SCSS стили включены в компонент

// Типы для демонстрации
enum QuestNodeType {
    DIALOGUE = 'DIALOGUE',
    BATTLE = 'BATTLE',
    PUZZLE = 'PUZZLE',
    COLLECTION = 'COLLECTION',
    DECISION = 'DECISION'
}

export interface QuestDecision {
    id: string;
    text: string;
    nextNodeId: string;
    isAvailable: boolean;
    tooltip?: string;
}

interface QuestNode {
    id: string;
    description: string;
    type: QuestNodeType;
    decisions: QuestDecision[];
    characterName?: string;
    characterPortrait?: string;
}

interface QuestDialogProps {
    node: QuestNode;
    isVisible: boolean;
    onDecisionSelect: (decision: QuestDecision) => void;
    onClose: () => void;
}

export const QuestDialog: React.FC<QuestDialogProps> = ({
                                                     node,
                                                     isVisible,
                                                     onDecisionSelect,
                                                     onClose
                                                 }) => {
    if (!isVisible) return null;

    const handleDecisionClick = (decision: QuestDecision) => {
        if (decision.isAvailable) {
            onDecisionSelect(decision);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="quest-dialog-overlay" onClick={handleBackdropClick}>
            <div className="quest-dialog">
                {/* Заголовок с персонажем */}
                {node.characterName && (
                    <div className="quest-dialog__header">
                        <div className="quest-dialog__character">
                            <div className="quest-dialog__portrait">
                                {node.characterPortrait || '💬'}
                            </div>
                            <span className="quest-dialog__name">{node.characterName}</span>
                        </div>
                        <button className="quest-dialog__close" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                )}

                {/* Текст диалога */}
                <div className="quest-dialog__content">
                    <p className="quest-dialog__text">{node.description}</p>
                </div>

                {/* Варианты ответов */}
                <div className="quest-dialog__decisions">
                    {node.decisions.map((decision) => (
                        <button
                            key={decision.id}
                            className={`quest-dialog__decision ${
                                !decision.isAvailable ? 'quest-dialog__decision--disabled' : ''
                            }`}
                            onClick={() => handleDecisionClick(decision)}
                            disabled={!decision.isAvailable}
                            title={decision.tooltip || ''}
                        >
                            {decision.text}
                            {!decision.isAvailable && (
                                <span className="quest-dialog__decision-lock">🔒</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
