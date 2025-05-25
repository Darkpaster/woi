import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import "../styles/achievementsWindow.scss";
import { Achievement, AchievementRarity, AchievementType } from '../../../../core/logic/achievements/achievement';

// Моковые данные для примера (в реальном проекте это будет браться из player.achievementList)
const mockAchievements: Achievement[] = [
    // Боевые достижения
    new Achievement({
        id: 'first_kill',
        name: 'Первая кровь',
        description: 'Убейте своего первого врага',
        icon: '⚔️',
        type: AchievementType.COMBAT,
        rarity: AchievementRarity.COMMON,
        isUnlocked: true,
        unlockedDate: new Date('2024-01-15')
    }),
    new Achievement({
        id: 'slayer',
        name: 'Убийца',
        description: 'Убейте 100 врагов',
        icon: '💀',
        type: AchievementType.COMBAT,
        rarity: AchievementRarity.UNCOMMON,
        isUnlocked: true,
        progress: 100,
        maxProgress: 100,
        unlockedDate: new Date('2024-02-01')
    }),
    new Achievement({
        id: 'boss_hunter',
        name: 'Охотник на боссов',
        description: 'Победите 5 боссов',
        icon: '🐉',
        type: AchievementType.COMBAT,
        rarity: AchievementRarity.RARE,
        isUnlocked: false,
        progress: 3,
        maxProgress: 5
    }),
    new Achievement({
        id: 'legendary_warrior',
        name: 'Легендарный воин',
        description: 'Победите в 50 сражениях подряд без поражений',
        icon: '🏆',
        type: AchievementType.COMBAT,
        rarity: AchievementRarity.LEGENDARY,
        isUnlocked: false,
        progress: 23,
        maxProgress: 50
    }),

    // Исследование
    new Achievement({
        id: 'explorer',
        name: 'Исследователь',
        description: 'Откройте 10 новых локаций',
        icon: '🗺️',
        type: AchievementType.EXPLORATION,
        rarity: AchievementRarity.COMMON,
        isUnlocked: true,
        unlockedDate: new Date('2024-01-20')
    }),
    new Achievement({
        id: 'treasure_hunter',
        name: 'Охотник за сокровищами',
        description: 'Найдите 25 скрытых сундуков',
        icon: '💰',
        type: AchievementType.EXPLORATION,
        rarity: AchievementRarity.UNCOMMON,
        isUnlocked: false,
        progress: 18,
        maxProgress: 25
    }),
    new Achievement({
        id: 'world_traveler',
        name: 'Путешественник',
        description: 'Посетите все континенты',
        icon: '🌍',
        type: AchievementType.EXPLORATION,
        rarity: AchievementRarity.RARE,
        isUnlocked: false,
        progress: 2,
        maxProgress: 5
    }),

    // Коллекционирование
    new Achievement({
        id: 'collector',
        name: 'Коллекционер',
        description: 'Соберите 50 различных предметов',
        icon: '📦',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.COMMON,
        isUnlocked: true,
        unlockedDate: new Date('2024-01-25')
    }),
    new Achievement({
        id: 'rare_collector',
        name: 'Ценитель редкостей',
        description: 'Соберите 10 легендарных предметов',
        icon: '💎',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.ELITE,
        isUnlocked: false,
        progress: 4,
        maxProgress: 10
    }),

    // Сюжет
    new Achievement({
        id: 'story_begin',
        name: 'Начало пути',
        description: 'Завершите первую главу',
        icon: '📖',
        type: AchievementType.STORY,
        rarity: AchievementRarity.COMMON,
        isUnlocked: true,
        unlockedDate: new Date('2024-01-10')
    }),
    new Achievement({
        id: 'story_complete',
        name: 'Герой легенд',
        description: 'Завершите основную сюжетную линию',
        icon: '👑',
        type: AchievementType.STORY,
        rarity: AchievementRarity.LEGENDARY,
        isUnlocked: false,
        progress: 0,
        maxProgress: 1
    }),

    // Социальные
    new Achievement({
        id: 'friend',
        name: 'Общительный',
        description: 'Добавьте 5 друзей',
        icon: '👥',
        type: AchievementType.SOCIAL,
        rarity: AchievementRarity.COMMON,
        isUnlocked: true,
        unlockedDate: new Date('2024-02-05')
    }),
    new Achievement({
        id: 'guild_master',
        name: 'Мастер гильдии',
        description: 'Создайте и возглавьте гильдию',
        icon: '🏰',
        type: AchievementType.SOCIAL,
        rarity: AchievementRarity.RARE,
        isUnlocked: false,
        progress: 0,
        maxProgress: 1,
        isHidden: true
    }),

    // Крафт
    new Achievement({
        id: 'crafter',
        name: 'Ремесленник',
        description: 'Создайте 20 предметов',
        icon: '🔨',
        type: AchievementType.CRAFTING,
        rarity: AchievementRarity.COMMON,
        isUnlocked: true,
        unlockedDate: new Date('2024-02-10')
    }),
    new Achievement({
        id: 'master_crafter',
        name: 'Мастер-ремесленник',
        description: 'Создайте предмет каждого типа',
        icon: '⚒️',
        type: AchievementType.CRAFTING,
        rarity: AchievementRarity.ELITE,
        isUnlocked: false,
        progress: 6,
        maxProgress: 10
    })
];

type CategoryInfo = {
    id: AchievementType;
    name: string;
    icon: string;
};

const categories: CategoryInfo[] = [
    { id: AchievementType.COMBAT, name: 'Боевые', icon: '⚔️' },
    { id: AchievementType.EXPLORATION, name: 'Исследование', icon: '🗺️' },
    { id: AchievementType.COLLECTION, name: 'Коллекции', icon: '📦' },
    { id: AchievementType.STORY, name: 'Сюжет', icon: '📖' },
    { id: AchievementType.SOCIAL, name: 'Социальные', icon: '👥' },
    { id: AchievementType.CRAFTING, name: 'Ремесло', icon: '🔨' }
];

interface AchievementsWindowProps {
    onClose?: () => void;
}

const AchievementsWindow: React.FC<AchievementsWindowProps> = ({ onClose }) => {
    const [activeCategory, setActiveCategory] = useState<AchievementType>(AchievementType.COMBAT);

    // В реальном проекте это будет: player.achievementList
    const achievements = mockAchievements;

    const filteredAchievements = useMemo(() => {
        return achievements
            .filter(achievement => achievement.type === activeCategory)
            .filter(achievement => achievement.canBeDisplayed())
            .sort((a, b) => {
                if (a.isUnlocked && !b.isUnlocked) return -1;
                if (!a.isUnlocked && b.isUnlocked) return 1;
                return 0;
            });
    }, [achievements, activeCategory]);

    const stats = useMemo(() => {
        const total = achievements.filter(a => a.canBeDisplayed()).length;
        const unlocked = achievements.filter(a => a.isUnlocked).length;

        const categoryStats = categories.map(category => ({
            ...category,
            count: achievements.filter(a => a.type === category.id && a.isUnlocked).length
        }));

        return { total, unlocked, categoryStats };
    }, [achievements]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getRarityClassName = (rarity: AchievementRarity) => {
        return `achievement-card__rarity--${rarity}`;
    };

    const renderProgressBar = (achievement: Achievement) => {
        if (achievement.maxProgress <= 1) return null;

        const percentage = achievement.getProgressPercentage();

        return (
            <div className="achievement-card__progress">
                <div className="progress-bar">
                    <div
                        className="progress-bar__fill"
                        style={{ width: `${percentage}%` }}
                    />
                    <div className="progress-bar__text">
                        {achievement.progress}/{achievement.maxProgress}
                    </div>
                </div>
            </div>
        );
    };

    const renderAchievementCard = (achievement: Achievement) => {
        const cardClass = [
            'achievement-card',
            achievement.isUnlocked ? 'achievement-card--unlocked' : 'achievement-card--locked',
            achievement.isHidden && !achievement.isUnlocked ? 'achievement-card--hidden' : ''
        ].filter(Boolean).join(' ');

        const displayName = achievement.isHidden && !achievement.isUnlocked ? '???' : achievement.name;
        const displayDescription = achievement.isHidden && !achievement.isUnlocked ? 'Скрытое достижение' : achievement.description;

        return (
            <div key={achievement.id} className={cardClass}>
                <div className="achievement-card__content">
                    <div className="achievement-card__icon">
                        {achievement.isHidden && !achievement.isUnlocked ? '❓' : achievement.icon}
                    </div>
                    <div className="achievement-card__info">
                        <div className="achievement-card__header">
                            <div className="achievement-card__name">{displayName}</div>
                            <div className={`achievement-card__rarity ${getRarityClassName(achievement.rarity)}`}>
                                {achievement.rarity}
                            </div>
                        </div>
                        <div className="achievement-card__description">
                            {displayDescription}
                        </div>
                        {renderProgressBar(achievement)}
                    </div>
                </div>
                {achievement.isUnlocked && achievement.unlockedDate && (
                    <div className="achievement-card__date">
                        {formatDate(achievement.unlockedDate)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="achievements-window">
            <div className="achievements-window__header">
                <div className="achievements-window__title">Достижения</div>
                <div className="achievements-window__stats">
                    <div className="achievements-window__counter">
                        <div className="achievements-window__counter-number">{stats.unlocked}</div>
                        <div className="achievements-window__counter-label">Получено</div>
                    </div>
                    <div className="achievements-window__counter">
                        <div className="achievements-window__counter-number">{stats.total}</div>
                        <div className="achievements-window__counter-label">Всего</div>
                    </div>
                </div>
                <div className="achievements-window__close" onClick={onClose}>
                    <X size={16} />
                </div>
            </div>

            <div className="achievements-window__body">
                <div className="achievements-window__sidebar">
                    {categories.map(category => {
                        const categoryCount = stats.categoryStats.find(s => s.id === category.id)?.count || 0;

                        return (
                            <div
                                key={category.id}
                                className={`achievement-category ${
                                    activeCategory === category.id ? 'achievement-category--active' : ''
                                }`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.icon} {category.name}
                                {categoryCount > 0 && (
                                    <div className="achievement-category__badge">
                                        {categoryCount}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="achievements-window__content">
                    {filteredAchievements.length > 0 ? (
                        <div className="achievements-window__grid">
                            {filteredAchievements.map(achievement => renderAchievementCard(achievement))}
                        </div>
                    ) : (
                        <div className="achievements-empty">
                            <div className="achievements-empty__icon">🏆</div>
                            <div className="achievements-empty__text">
                                В этой категории пока нет достижений
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementsWindow;