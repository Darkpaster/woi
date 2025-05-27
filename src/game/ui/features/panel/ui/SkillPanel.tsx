// components/SkillPanel.tsx (обновленная версия)
import React, { RefObject, useEffect, useRef, useState } from "react";
import "../styles/panel.scss"
import { actions } from "../../../input/input";
import {useMyDispatch} from "../../../../../utils/stateManagement/store.ts";
import { Skill } from "../../../../core/logic/skills/skill";
import { SkillPanelProps } from "../types.ts";
import {setInfoEntity, setInfoPosition} from "../../../../../utils/stateManagement/uiSlice.ts";
import Icon from "../../../shared/ui/Icon.tsx";
import {player} from "../../../../core/main.ts";

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
    const [externalDragData, setExternalDragData] = useState<any>(null);

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
        e.dataTransfer.setData("skill-panel", JSON.stringify({
            index,
            source: 'panel'
        }));
        e.dataTransfer.effectAllowed = "move";
        setDraggedSkill({ skill, index });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();

        // Проверяем, что это перетаскивание навыка
        const hasSkillData = e.dataTransfer.types.includes("skill-data") ||
            e.dataTransfer.types.includes("skill-panel");

        if (hasSkillData) {
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();

        // Проверяем, что это навык
        const hasSkillData = e.dataTransfer.types.includes("skill-data") ||
            e.dataTransfer.types.includes("skill-panel");

        if (hasSkillData) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();

        // Проверяем, что мы действительно покинули элемент, а не его дочерний элемент
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        try {
            // Проверяем, откуда идет перетаскивание
            const skillPanelData = e.dataTransfer.getData("skill-panel");
            const spellBookData = e.dataTransfer.getData("skill-data");

            if (skillPanelData) {
                // Перетаскивание внутри панели навыков
                const data = JSON.parse(skillPanelData);
                const sourceIndex = data.index;

                if (sourceIndex === targetIndex) return;

                onSkillReorder(sourceIndex, targetIndex);
            } else if (spellBookData) {
                // Перетаскивание из книги заклинаний
                const data = JSON.parse(spellBookData);

                if (data.source === 'spellbook') {
                    // Находим навык по имени в доступных навыках игрока
                    const skillName = data.name;
                    const skill = findSkillByName(skillName);

                    if (skill) {
                        // Добавляем навык в панель
                        addSkillToPanel(skill, targetIndex);
                    }
                }
            }
        } catch (error) {
            console.error('Error handling drop:', error);
        }

        setDraggedSkill(null);
        setExternalDragData(null);
    };

    const handleDragEnd = () => {
        setDraggedSkill(null);
        setDragOverIndex(null);
        setExternalDragData(null);
    };

    // Функция для поиска навыка по имени
    const findSkillByName = (skillName: string): Skill | null => {
        // Здесь нужно адаптировать под вашу структуру данных
        // Предполагаем, что у игрока есть массив всех доступных навыков
        // if (player?.allSkills) {
        //     return player.allSkills.find((skill: Skill) => skill.name === skillName) || null;
        // }
        return null;
    };

    // Функция для добавления навыка в панель
    const addSkillToPanel = (skill: Skill, targetIndex: number) => {
        // Создаем копию навыка для панели или используем ссылку
        const skillForPanel = { ...skill };

        // Обновляем книгу заклинаний игрока
        if (player && player.spellBook) {
            player.spellBook[targetIndex] = skillForPanel;

            // Если у вас есть callback для обновления состояния, вызовите его
            // onSkillAdd?.(skillForPanel, targetIndex);
        }
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
                let displayText;
                let fontSize = '15px';
                let textAlign = "end";

                if (skill) {
                    const left = skill.process?.cooldown?.getLeftTime ? skill.process.cooldown.getLeftTime() : 0;
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
                                    rarity: skill.rarity || "common",
                                    level: skill.level || 1
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
                            // borderColor={skill ? getSkillRarityColor(skill) : undefined}
                        />

                        {/* Хоткей индикатор */}
                        {index < 9 && (
                            <div className="panel-slot__hotkey">
                                {index + 1}
                            </div>
                        )}

                        {/* Индикатор уровня навыка */}
                        {skill && skill.level && (
                            <div className="panel-slot__level">
                                {skill.level}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default SkillPanel;