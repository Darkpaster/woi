import React, { useState } from 'react';
import { X, Star, Zap } from 'lucide-react';
import "../styles/professionsWindow.scss"

type Ability = {
    id: string;
    name: string;
    icon: string;
    description: string;
    type: 'passive' | 'active';
    unlocked: boolean;
    requiredLevel: number;
    cooldown?: number; // для активных способностей
    effect?: string; // для пассивных способностей
};

type Profession = {
    id: string;
    name: string;
    icon: string;
    level: number;
    currentExp: number;
    maxExp: number;
    description: string;
    abilities: Ability[];
};

const ProfessionsWindow: React.FC = () => {
    const [professions] = useState<Profession[]>([
        {
            id: 'alchemy',
            name: 'Алхимия',
            icon: '🧪',
            level: 15,
            currentExp: 2450,
            maxExp: 3000,
            description: 'Искусство создания зелий и эликсиров',
            abilities: [
                {
                    id: 'basic_potion',
                    name: 'Базовое зелье лечения',
                    icon: '💊',
                    description: 'Создание простого зелья восстановления здоровья',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 1,
                    cooldown: 5
                },
                {
                    id: 'herb_knowledge',
                    name: 'Знание трав',
                    icon: '🌿',
                    description: 'Увеличивает эффективность сбора трав на 25%',
                    type: 'passive',
                    unlocked: true,
                    requiredLevel: 3,
                    effect: '+25% к сбору трав'
                },
                {
                    id: 'mana_potion',
                    name: 'Зелье маны',
                    icon: '🔮',
                    description: 'Создание зелья восстановления магической энергии',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 8,
                    cooldown: 8
                },
                {
                    id: 'potion_mastery',
                    name: 'Мастерство зелий',
                    icon: '⚗️',
                    description: 'Шанс создать двойное количество зелий: 15%',
                    type: 'passive',
                    unlocked: true,
                    requiredLevel: 12,
                    effect: '15% шанс удвоения'
                },
                {
                    id: 'greater_healing',
                    name: 'Великое зелье лечения',
                    icon: '🍶',
                    description: 'Создание мощного зелья восстановления здоровья',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 15,
                    cooldown: 12
                },
                {
                    id: 'poison_immunity',
                    name: 'Иммунитет к ядам',
                    icon: '🛡️',
                    description: 'Создание зелья временного иммунитета к ядам',
                    type: 'active',
                    unlocked: false,
                    requiredLevel: 20,
                    cooldown: 30
                }
            ]
        },
        {
            id: 'blacksmithing',
            name: 'Кузнечное дело',
            icon: '🔨',
            level: 8,
            currentExp: 850,
            maxExp: 1200,
            description: 'Ковка оружия и доспехов',
            abilities: [
                {
                    id: 'basic_sword',
                    name: 'Простой меч',
                    icon: '⚔️',
                    description: 'Ковка базового железного меча',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 1,
                    cooldown: 15
                },
                {
                    id: 'metal_efficiency',
                    name: 'Экономия металла',
                    icon: '💎',
                    description: 'Снижает расход материалов при ковке на 10%',
                    type: 'passive',
                    unlocked: true,
                    requiredLevel: 5,
                    effect: '-10% расход материалов'
                },
                {
                    id: 'armor_crafting',
                    name: 'Создание доспехов',
                    icon: '🛡️',
                    description: 'Ковка базовых доспехов из железа',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 8,
                    cooldown: 25
                },
                {
                    id: 'steel_working',
                    name: 'Работа со сталью',
                    icon: '⛏️',
                    description: 'Создание стальных изделий повышенного качества',
                    type: 'active',
                    unlocked: false,
                    requiredLevel: 12,
                    cooldown: 20
                }
            ]
        },
        {
            id: 'enchanting',
            name: 'Зачарование',
            icon: '✨',
            level: 12,
            currentExp: 1800,
            maxExp: 2100,
            description: 'Наложение магических чар на предметы',
            abilities: [
                {
                    id: 'basic_enchant',
                    name: 'Базовое зачарование',
                    icon: '💫',
                    description: 'Наложение простых чар на оружие',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 1,
                    cooldown: 10
                },
                {
                    id: 'mana_efficiency',
                    name: 'Эффективность маны',
                    icon: '🔵',
                    description: 'Снижает затраты маны на зачарование на 20%',
                    type: 'passive',
                    unlocked: true,
                    requiredLevel: 6,
                    effect: '-20% затраты маны'
                },
                {
                    id: 'armor_enchant',
                    name: 'Зачарование доспехов',
                    icon: '🛡️',
                    description: 'Наложение защитных чар на доспехи',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 10,
                    cooldown: 15
                },
                {
                    id: 'enchant_mastery',
                    name: 'Мастерство зачарования',
                    icon: '⭐',
                    description: 'Увеличивает силу всех зачарований на 30%',
                    type: 'passive',
                    unlocked: true,
                    requiredLevel: 12,
                    effect: '+30% сила зачарований'
                }
            ]
        },
        {
            id: 'cooking',
            name: 'Кулинария',
            icon: '🍳',
            level: 6,
            currentExp: 450,
            maxExp: 800,
            description: 'Приготовление пищи и напитков',
            abilities: [
                {
                    id: 'basic_meal',
                    name: 'Простая еда',
                    icon: '🍞',
                    description: 'Приготовление базовой пищи для восстановления сытости',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 1,
                    cooldown: 3
                },
                {
                    id: 'ingredient_knowledge',
                    name: 'Знание ингредиентов',
                    icon: '📖',
                    description: 'Увеличивает качество готовых блюд на 15%',
                    type: 'passive',
                    unlocked: true,
                    requiredLevel: 4,
                    effect: '+15% качество блюд'
                },
                {
                    id: 'hearty_stew',
                    name: 'Сытное рагу',
                    icon: '🍲',
                    description: 'Приготовление питательного рагу с бонусами',
                    type: 'active',
                    unlocked: true,
                    requiredLevel: 6,
                    cooldown: 8
                },
                {
                    id: 'master_chef',
                    name: 'Мастер-повар',
                    icon: '👨‍🍳',
                    description: 'Шанс не потратить ингредиенты при готовке: 25%',
                    type: 'passive',
                    unlocked: false,
                    requiredLevel: 10,
                    effect: '25% шанс сохранить ингредиенты'
                }
            ]
        }
    ]);

    const [activeProfession, setActiveProfession] = useState(professions[0].id);
    const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);

    const currentProfession = professions.find(p => p.id === activeProfession)!;
    const expPercentage = (currentProfession.currentExp / currentProfession.maxExp) * 100;

    const useAbility = (abilityId: string) => {
        console.log(`Использовать способность ${abilityId}`);
    };

    const getAbilityTypeIcon = (type: 'passive' | 'active') => {
        return type === 'active' ? <Zap size={14} /> : <Star size={14} />;
    };

    return (
        <div className="profession-window">
            {/* Заголовок с вкладками профессий */}
            <div className="profession-window__header">
                <div className="profession-window__tabs">
                    {professions.map(profession => (
                        <div
                            key={profession.id}
                            className={`profession-tab ${
                                activeProfession === profession.id ? 'profession-tab--active' : ''
                            }`}
                            onClick={() => {
                                setActiveProfession(profession.id);
                                setSelectedAbility(null);
                            }}
                        >
                            <div className="profession-tab__icon">{profession.icon}</div>
                            <div className="profession-tab__info">
                                <div className="profession-tab__name">{profession.name}</div>
                                <div className="profession-tab__level">Ур. {profession.level}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="profession-window__close">
                    <X size={20} />
                </div>
            </div>

            <div className="profession-window__body">
                {/* Информация о профессии */}
                <div className="profession-window__info">
                    <div className="profession-info">
                        <div className="profession-info__header">
                            <div className="profession-info__icon">{currentProfession.icon}</div>
                            <div className="profession-info__details">
                                <h2 className="profession-info__name">{currentProfession.name}</h2>
                                <p className="profession-info__description">{currentProfession.description}</p>
                            </div>
                        </div>

                        <div className="profession-info__progress">
                            <div className="level-info">
                                <span className="level-info__current">Уровень {currentProfession.level}</span>
                                <span className="level-info__exp">
                                    {currentProfession.currentExp} / {currentProfession.maxExp} опыта
                                </span>
                            </div>
                            <div className="exp-bar">
                                <div
                                    className="exp-bar__fill"
                                    style={{ width: `${expPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Список способностей */}
                <div className="profession-window__abilities">
                    <div className="abilities-section">
                        <h3 className="abilities-section__title">Активные способности</h3>
                        <div className="abilities-grid">
                            {currentProfession.abilities
                                .filter(ability => ability.type === 'active')
                                .map(ability => (
                                    <div
                                        key={ability.id}
                                        className={`ability-card ${
                                            ability.unlocked ? 'ability-card--unlocked' : 'ability-card--locked'
                                        } ${selectedAbility?.id === ability.id ? 'ability-card--selected' : ''}`}
                                        onClick={() => setSelectedAbility(ability)}
                                    >
                                        <div className="ability-card__icon">{ability.icon}</div>
                                        <div className="ability-card__info">
                                            <div className="ability-card__name">{ability.name}</div>
                                            <div className="ability-card__level">Ур. {ability.requiredLevel}</div>
                                        </div>
                                        <div className="ability-card__type">
                                            {getAbilityTypeIcon(ability.type)}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="abilities-section">
                        <h3 className="abilities-section__title">Пассивные способности</h3>
                        <div className="abilities-grid">
                            {currentProfession.abilities
                                .filter(ability => ability.type === 'passive')
                                .map(ability => (
                                    <div
                                        key={ability.id}
                                        className={`ability-card ${
                                            ability.unlocked ? 'ability-card--unlocked' : 'ability-card--locked'
                                        } ${selectedAbility?.id === ability.id ? 'ability-card--selected' : ''}`}
                                        onClick={() => setSelectedAbility(ability)}
                                    >
                                        <div className="ability-card__icon">{ability.icon}</div>
                                        <div className="ability-card__info">
                                            <div className="ability-card__name">{ability.name}</div>
                                            <div className="ability-card__level">Ур. {ability.requiredLevel}</div>
                                        </div>
                                        <div className="ability-card__type">
                                            {getAbilityTypeIcon(ability.type)}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Детали выбранной способности */}
                {selectedAbility && (
                    <div className="profession-window__details">
                        <div className="ability-details">
                            <div className="ability-details__header">
                                <div className="ability-details__icon">{selectedAbility.icon}</div>
                                <div className="ability-details__info">
                                    <h3 className="ability-details__name">{selectedAbility.name}</h3>
                                    <div className="ability-details__meta">
                                        <span className={`ability-type ability-type--${selectedAbility.type}`}>
                                            {getAbilityTypeIcon(selectedAbility.type)}
                                            {selectedAbility.type === 'active' ? 'Активная' : 'Пассивная'}
                                        </span>
                                        <span className="ability-level">Требует ур. {selectedAbility.requiredLevel}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="ability-details__description">
                                {selectedAbility.description}
                            </div>

                            {selectedAbility.type === 'active' && selectedAbility.cooldown && (
                                <div className="ability-details__cooldown">
                                    <strong>Время восстановления:</strong> {selectedAbility.cooldown} сек
                                </div>
                            )}

                            {selectedAbility.type === 'passive' && selectedAbility.effect && (
                                <div className="ability-details__effect">
                                    <strong>Эффект:</strong> {selectedAbility.effect}
                                </div>
                            )}

                            {selectedAbility.unlocked && selectedAbility.type === 'active' && (
                                <button
                                    className="ability-details__use-btn"
                                    onClick={() => useAbility(selectedAbility.id)}
                                >
                                    Использовать
                                </button>
                            )}

                            {!selectedAbility.unlocked && (
                                <div className="ability-details__locked">
                                    Способность будет разблокирована на {selectedAbility.requiredLevel} уровне
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfessionsWindow;