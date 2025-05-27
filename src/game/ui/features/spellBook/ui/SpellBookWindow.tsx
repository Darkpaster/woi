// components/SpellBookWindow.tsx
import React, { useEffect, useState } from "react";
import { useMyDispatch } from "../../../../../utils/stateManagement/store.ts";
import { player } from "../../../../core/main.ts";
import { Skill } from "../../../../core/logic/skills/skill";
import { setInfoEntity, setInfoPosition } from "../../../../../utils/stateManagement/uiSlice.ts";
import Icon from "../../../shared/ui/Icon.tsx";
import "../styles/spellBook.scss";

type SpellType = 'active' | 'passive';

interface SpellBookWindowProps {
    onSpellDragToPanel?: (skill: Skill) => void;
}

const SpellBookWindow: React.FC<SpellBookWindowProps> = ({ onSpellDragToPanel }) => {
    const [activeTab, setActiveTab] = useState<SpellType>('active');
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [draggedSkill, setDraggedSkill] = useState<Skill | null>(null);

    const dispatch = useMyDispatch();

    useEffect(() => {
        // Получаем все доступные навыки игрока
        const interval = setInterval(() => {
            // Предполагаем, что у игрока есть свойство allSkills или skills
            // Если нет, адаптируйте под вашу структуру данных
            if (player?.inventory.find(skill => !!skill)) {
                setAllSkills([...player.spellBook.filter(skill => !!skill)]);
            }
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Фильтруем навыки по типу
    const getFilteredSkills = (): Skill[] => {
        return allSkills.filter(skill => {
            if (activeTab === 'active') {
                return skill.type === 'active' || !skill.type; // если type не определен, считаем активным
            } else {
                return skill.type === 'passive';
            }
        });
    };

    const handleDragStart = (e: React.DragEvent, skill: Skill) => {
        e.dataTransfer.setData("text/plain", skill.name);
        e.dataTransfer.setData("skill-data", JSON.stringify({
            name: skill.name,
            source: 'spellbook'
        }));
        e.dataTransfer.effectAllowed = "copy";
        setDraggedSkill(skill);
    };

    const handleDragEnd = () => {
        setDraggedSkill(null);
    };

    const handleMouseEnter = (e: React.MouseEvent, skill: Skill) => {
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
            level: skill.level || 1,
            note: `Уровень: ${skill.level || 1}`
        }));
    };

    const handleMouseLeave = () => {
        dispatch(setInfoEntity(null));
        dispatch(setInfoPosition(null));
    };

    const getSkillRarityColor = (skill: Skill): string => {
        switch (skill.rarity) {
            case 'common':
                return 'grey';
            case 'uncommon':
                return 'green';
            case 'rare':
                return 'blue';
            case 'epic':
                return 'violet';
            case 'legendary':
                return 'orange';
            case 'godlike':
                return 'red';
            default:
                return 'black';
        }
    };

    const getSkillAvailability = (skill: Skill): boolean => {
        // Логика проверки доступности навыка
        // Можно проверять уровень игрока, выученные навыки и т.д.
        return skill.name.length > 4;
    };

    const filteredSkills = getFilteredSkills();

    return (
        <div className="spellbook-window ui-border ui-div">
            <div className="spellbook-header">
                <h2>Книга Заклинаний</h2>
                <div className="spellbook-tabs">
                    <button
                        className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Активные
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'passive' ? 'active' : ''}`}
                        onClick={() => setActiveTab('passive')}
                    >
                        Пассивные
                    </button>
                </div>
            </div>

            <div className="spellbook-content">
                <div className="skills-grid">
                    {filteredSkills.map((skill, index) => {
                        const isAvailable = getSkillAvailability(skill);
                        const isDragging = draggedSkill === skill;

                        return (
                            <div
                                key={`${skill.name}-${index}`}
                                className={`skill-slot ${!isAvailable ? 'skill-slot--unavailable' : ''} ${isDragging ? 'skill-slot--dragging' : ''}`}
                                draggable={isAvailable && activeTab === 'active'} // Только активные навыки можно перетаскивать
                                onDragStart={(e) => handleDragStart(e, skill)}
                                onDragEnd={handleDragEnd}
                                onMouseEnter={(e) => handleMouseEnter(e, skill)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    className="cell"
                                    style={{
                                        borderColor: getSkillRarityColor(skill),
                                        borderWidth: "2px",
                                        opacity: isAvailable ? 1 : 0.5,
                                        cursor: isAvailable ? (activeTab === 'active' ? 'grab' : 'default') : 'not-allowed',
                                        padding: 0,
                                    }}
                                    disabled={!isAvailable}
                                >
                                    <Icon
                                        icon={skill.icon}
                                        borderColor={getSkillRarityColor(skill)}
                                        displayText={skill.level ? String(skill.level) : '1'}
                                        fontSize="14px"
                                        textAlign="center"
                                    />

                                    {/* Индикатор уровня */}
                                    <div className="skill-level">
                                        {skill.level || 1}
                                    </div>

                                    {/* Индикатор типа навыка */}
                                    <div className={`skill-type-indicator ${activeTab}`}>
                                        {activeTab === 'active' ? 'A' : 'P'}
                                    </div>

                                    {/* Индикатор изученности */}
                                    {!isAvailable && (
                                        <div className="skill-locked-overlay">
                                            <span>🔒</span>
                                        </div>
                                    )}
                                </button>

                                <div className="skill-name">
                                    {skill.name}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredSkills.length === 0 && (
                    <div className="empty-state">
                        <p>Нет доступных {activeTab === 'active' ? 'активных' : 'пассивных'} заклинаний</p>
                    </div>
                )}
            </div>

            <div className="spellbook-footer">
                <p className="drag-hint">
                    {activeTab === 'active'
                        ? "Перетащите активные заклинания на панель навыков"
                        : "Пассивные заклинания действуют автоматически"
                    }
                </p>
            </div>
        </div>
    );
};

export default SpellBookWindow;