// components/SkillPanel.tsx
import React, { RefObject, useEffect, useRef, useState } from "react";
import "../styles/panel.scss"
import { actions } from "../../../input/input";
import {useMyDispatch} from "../../../../../utils/stateManagement/store.ts";
import { Skill } from "../../../../core/logic/skills/skill";
import { SkillPanelProps } from "../types.ts";
import {setInfoEntity, setInfoPosition} from "../../../../../utils/stateManagement/uiSlice.ts";
import Icon from "../../../shared/ui/Icon.tsx";

const SkillPanel: React.FC<SkillPanelProps> = ({
                                                   orientation = 'horizontal',
                                                   length,
                                                   spellBook,
                                                   onSkillUse,
                                                   onSkillReorder,
                                                   position,
                                                   className = ''
                                               }) => {
    const [draggedSkill, setDraggedSkill] = useState<{ skill: Skill, index: number } | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const dispatch = useMyDispatch();
    const panelRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

    // Создаем массив слотов нужной длины
    const slots = Array.from({ length }, (_, index) => spellBook[index] || null);

    useEffect(() => {
        // Привязывание логики нажатия на кнопки на панели
        const panel = panelRef.current;
        if (!panel) return;

        const buttons: HTMLCollection = panel.children;
        for (let i: number = 0; i < Math.min(buttons.length, 10); i++) {
            const actionKey = `b${i + 1}`;
            if (actions[actionKey]) {
                actions[actionKey] = () => {
                    (buttons.item(i) as HTMLElement)?.click();
                }
            }
        }
    }, []);

    const handleDragStart = (e: React.DragEvent, skill: Skill, index: number) => {
        if (!skill) return;

        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.effectAllowed = "move";
        setDraggedSkill({ skill, index });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (!draggedSkill) return;

        const sourceIndex = draggedSkill.index;
        if (sourceIndex === targetIndex) return;

        onSkillReorder(sourceIndex, targetIndex);
        setDraggedSkill(null);
    };

    const handleDragEnd = () => {
        setDraggedSkill(null);
        setDragOverIndex(null);
    };

    const getPositionClasses = () => {
        let classes = `panel-container panel-container--${orientation}`;

        if (position) {
            // Кастомная позиция через пропсы
            return `${classes} ${className}`;
        }

        // Позиция по умолчанию для горизонтальной панели навыков
        if (orientation === 'horizontal') {
            classes += ' panel-container--bottom-center';
        }

        return `${classes} ${className}`;
    };

    const getSlotClasses = (index: number, skill: Skill | null) => {
        let classes = 'panel-slot';

        if (!skill) {
            classes += ' panel-slot--empty';
        }

        if (draggedSkill && draggedSkill.index === index) {
            classes += ' panel-slot--dragging';
        }

        if (dragOverIndex === index) {
            classes += ' panel-slot--drag-over';
        }

        return classes;
    };

    const customStyle = position ? {
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        right: position.right,
    } : {};

    return (
        <div
            ref={panelRef}
            className={getPositionClasses()}
            style={customStyle}
        >
            {slots.map((skill, index) => {
                let displayText = String(index + 1);
                let fontSize = '15px';
                let textAlign = "end";

                if (skill) {
                    const left = skill.process.cooldown!.getLeftTime();
                    if (left > 0) {
                        displayText = (left / 1000).toFixed(1);
                        fontSize = '20px';
                        textAlign = "center";
                    }
                }

                return (
                    <button
                        key={index}
                        className={getSlotClasses(index, skill)}
                        draggable={!!skill}
                        onDragStart={(e) => handleDragStart(e, skill!, index)}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onMouseEnter={(e) => {
                            if (skill) {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                dispatch(setInfoPosition({ left: rect.x, top: rect.y }));
                                dispatch(setInfoEntity({
                                    name: skill.name,
                                    description: skill.description,
                                    minDamage: skill.minDamage,
                                    maxDamage: skill.maxDamage,
                                    icon: skill.icon,
                                    cooldown: skill.cooldown,
                                    rarity: "none"
                                }));
                            }
                        }}
                        onMouseLeave={() => {
                            dispatch(setInfoEntity(null));
                            dispatch(setInfoPosition(null));
                        }}
                        onClick={() => {
                            if (skill) {
                                onSkillUse(skill);
                            }
                        }}
                        style={{
                            padding: 0
                        }}
                    >
                        <Icon
                            icon={skill?.icon}
                            displayText={displayText}
                            fontSize={fontSize}
                            textAlign={textAlign}
                        />

                        {/* Хоткей индикатор */}
                        {index < 9 && (
                            <div className="panel-slot__hotkey">
                                {index + 1}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default SkillPanel;