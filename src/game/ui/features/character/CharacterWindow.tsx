import { useEffect, useState } from "react";
import "./characterWindow.scss";
import {player} from "../../../core/main.ts";

// Тип для персонажа
type CharacterType = {
    id: number;
    username: string;
    characterName: string;
    level: number;
    class: string;
    online: boolean;
    lastOnline: number;
    avatar: string;
    friendCount: number;
    stats: {
        strength: number;
        dexterity: number;
        intelligence: number;
        vitality: number;
    };
    equipment: {
        head: string;
        chest: string;
        hands: string;
        legs: string;
        feet: string;
        mainHand: string;
        offHand: string;
    };
    skills: Array<{
        id: number;
        name: string;
        level: number;
        description: string;
        icon: string;
    }>;
    achievements: Array<{
        id: number;
        name: string;
        description: string;
        completed: boolean;
        progress: number;
        totalRequired: number;
    }>;
    guild?: {
        id: number;
        name: string;
        rank: string;
        memberSince: string;
    };
};

// Тип для статуса дружбы
type FriendStatus = 'none' | 'friend' | 'pending' | 'incoming';

// Мок функция получения данных персонажа
const getCharacter = async (id: number): Promise<CharacterType> => {
    // Имитация запроса к API
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                id,
                username: "player123",
                characterName: "Eldric Shadowblade",
                level: 42,
                class: "Nightblade",
                online: true,
                lastOnline: Date.now(),
                avatar: "/character-avatar.png",
                friendCount: 15,
                stats: {
                    strength: 68,
                    dexterity: 120,
                    intelligence: 75,
                    vitality: 82
                },
                equipment: {
                    head: "Shadowy Hood",
                    chest: "Assassin's Tunic",
                    hands: "Gloves of Silence",
                    legs: "Pants of Shadows",
                    feet: "Swift Boots",
                    mainHand: "Dagger of Night",
                    offHand: "Obsidian Dagger"
                },
                skills: [
                    {
                        id: 1,
                        name: "Shadow Strike",
                        level: 3,
                        description: "Strike from the shadows dealing 150% weapon damage and applying Bleeding for 5s",
                        icon: "/skill-icons/shadow-strike.png"
                    },
                    {
                        id: 2,
                        name: "Vanish",
                        level: 2,
                        description: "Become invisible for 5s and gain 40% movement speed",
                        icon: "/skill-icons/vanish.png"
                    },
                    {
                        id: 3,
                        name: "Poison Blade",
                        level: 4,
                        description: "Coat your blades with poison, causing your attacks to deal additional poison damage for 10s",
                        icon: "/skill-icons/poison-blade.png"
                    }
                ],
                achievements: [
                    {
                        id: 1,
                        name: "Shadow Master",
                        description: "Kill 100 enemies while stealthed",
                        completed: true,
                        progress: 100,
                        totalRequired: 100
                    },
                    {
                        id: 2,
                        name: "Dungeon Delver",
                        description: "Complete 50 dungeons",
                        completed: false,
                        progress: 32,
                        totalRequired: 50
                    }
                ],
                guild: {
                    id: 1,
                    name: "Crimson Shadows",
                    rank: "Lieutenant",
                    memberSince: "2024-03-15"
                }
            });
        }, 300);
    });
};

const CharacterWindow: React.FC = () => {
    // const { id } = useParams<{ id: string }>();
    const characterId = parseInt(player.id || '0');
    const currentUserId = 1; // Здесь должен быть ID текущего пользователя из контекста/стора

    const [character, setCharacter] = useState<CharacterType | null>(null);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Получаем данные персонажа
                const characterData = await getCharacter(characterId);
                setCharacter(characterData);

                // Проверяем статус дружбы, если это не текущий пользователь
                if (characterId !== currentUserId) {
                    const [friends, incomingRequests, outgoingRequests] = await Promise.all([
                        // friendService.getFriends(currentUserId),
                        // friendService.getIncomingRequests(currentUserId),
                        // friendService.getOutgoingRequests(currentUserId)
                    ]);

                    const isFriend = friends.some(friend => friend.id === characterId);
                    const isIncoming = incomingRequests.some(request => request.sender.id === characterId);
                    const isOutgoing = outgoingRequests.some(request => request.receiver.id === characterId);

                    if (isFriend) {
                        setFriendStatus('friend');
                    } else if (isIncoming) {
                        setFriendStatus('incoming');
                    } else if (isOutgoing) {
                        setFriendStatus('pending');
                    } else {
                        setFriendStatus('none');
                    }
                }
            } catch (error) {
                console.error('Error fetching character data:', error);
                setError('Failed to load character data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (characterId) {
            fetchData();
        }
    }, [characterId, currentUserId]);

    // Отправка запроса в друзья
    const handleSendFriendRequest = async () => {
        // try {
        //     await friendService.sendFriendRequest(currentUserId, characterId);
        //     setFriendStatus('pending');
        // } catch (error) {
        //     console.error('Error sending friend request:', error);
        //     setError('Failed to send friend request. Please try again.');
        // }
    };

    // Принятие запроса в друзья
    const handleAcceptFriendRequest = async () => {
        // try {
        //     const incomingRequests = await friendService.getIncomingRequests(currentUserId);
        //     const request = incomingRequests.find(req => req.sender.id === characterId);
        //
        //     if (request) {
        //         await friendService.acceptFriendRequest(currentUserId, request.id);
        //         setFriendStatus('friend');
        //     }
        // } catch (error) {
        //     console.error('Error accepting friend request:', error);
        //     setError('Failed to accept friend request. Please try again.');
        // }
    };

    // Отклонение запроса в друзья
    const handleRejectFriendRequest = async () => {
        // try {
        //     const incomingRequests = await friendService.getIncomingRequests(currentUserId);
        //     const request = incomingRequests.find(req => req.sender.id === characterId);
        //
        //     if (request) {
        //         await friendService.rejectFriendRequest(currentUserId, request.id);
        //         setFriendStatus('none');
        //     }
        // } catch (error) {
        //     console.error('Error rejecting friend request:', error);
        //     setError('Failed to reject friend request. Please try again.');
        // }
    };

    // Удаление из друзей
    const handleRemoveFriend = async () => {
        // try {
        //     await friendService.removeFriend(currentUserId, characterId);
        //     setFriendStatus('none');
        // } catch (error) {
        //     console.error('Error removing friend:', error);
        //     setError('Failed to remove friend. Please try again.');
        // }
    };

    // Рендер действий для дружбы
    const renderFriendActions = () => {
        // Не показываем действия, если это профиль текущего пользователя
        if (characterId === currentUserId) {
            return null;
        }

        switch (friendStatus) {
            case 'friend':
                return (
                    <button
                        onClick={handleRemoveFriend}
                        className="character-window__button character-window__button--red"
                    >
                        Remove Friend
                    </button>
                );
            case 'pending':
                return (
                    <button
                        className="character-window__button character-window__button--gray"
                        disabled
                    >
                        Friend Request Sent
                    </button>
                );
            case 'incoming':
                return (
                    <div className="character-window__button-group">
                        <button
                            onClick={handleAcceptFriendRequest}
                            className="character-window__button character-window__button--green"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleRejectFriendRequest}
                            className="character-window__button character-window__button--red"
                        >
                            Decline
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        onClick={handleSendFriendRequest}
                        className="character-window__button character-window__button--blue"
                    >
                        Add Friend
                    </button>
                );
        }
    };

    // Расчет процента прогресса для достижений
    const calculateProgress = (current: number, total: number): number => {
        return Math.floor((current / total) * 100);
    };

    // Форматирование названия слота экипировки
    const formatSlotName = (slot: string): string => {
        return slot.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() +
            slot.replace(/([A-Z])/g, ' $1').trim().slice(1);
    };

    // Отображение состояния загрузки
    if (loading) {
        return (
            <div className="character-window__loading">
                <div className="text-white">Loading character...</div>
            </div>
        );
    }

    // Отображение ошибки
    if (error) {
        return (
            <div className="character-window__not-found">
                <div className="text-white">{error}</div>
            </div>
        );
    }

    // Если персонаж не найден
    if (!character) {
        return (
            <div className="character-window__not-found">
                <div className="text-white">Character not found</div>
            </div>
        );
    }

    return (
        <div className="character-window">
            <div className="character-window__container">
                {/* Шапка персонажа */}
                <div className="character-window__header">
                    <div className="character-window__header-content">
                        <div className="character-window__header-flex">
                            {/* Аватар и базовая информация */}
                            <div className="character-window__header-avatar">
                                <div className="character-window__header-avatar-container">
                                    <img
                                        src={character.avatar || "/default-avatar.png"}
                                        alt={character.characterName}
                                        className="character-window__header-avatar-image"
                                    />
                                    <span
                                        className={`character-window__header-avatar-status ${
                                            character.online
                                                ? 'character-window__header-avatar-status--online'
                                                : 'character-window__header-avatar-status--offline'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Основная информация о персонаже */}
                            <div className="character-window__header-info">
                                <div className="character-window__header-info-main">
                                    <div>
                                        <h1 className="character-window__header-info-name">{character.characterName}</h1>
                                        <div className="character-window__header-info-meta">
                                            <span>Level {character.level}</span>
                                            <span>•</span>
                                            <span>{character.class}</span>
                                            {character.guild && (
                                                <>
                                                    <span>•</span>
                                                    <span>
                            <span className="character-window__header-info-guild">{character.guild.name}</span> [{character.guild.rank}]
                          </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="character-window__header-info-status">
                                            {character.online
                                                ? 'Online now'
                                                : `Last seen ${new Date(character.lastOnline).toLocaleDateString()}`}
                                        </div>
                                    </div>

                                    {/* Кнопки действий */}
                                    <div className="character-window__button-group">
                                        {renderFriendActions()}
                                        <button className="character-window__button character-window__button--purple">
                                            Invite to Party
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Основной контент */}
                <div className="character-window__content">
                    {/* Левая колонка - статы и экипировка */}
                    <div>
                        {/* Статы */}
                        <div className="character-window__panel">
                            <div className="character-window__panel-header">Stats</div>
                            <div className="character-window__panel-content">
                                <div className="character-window__stats">
                                    <div className="character-window__stats-item">
                                        <span className="character-window__stats-item-label">Strength</span>
                                        <span className="character-window__stats-item-value">{character.stats.strength}</span>
                                    </div>
                                    <div className="character-window__stats-item">
                                        <span className="character-window__stats-item-label">Dexterity</span>
                                        <span className="character-window__stats-item-value">{character.stats.dexterity}</span>
                                    </div>
                                    <div className="character-window__stats-item">
                                        <span className="character-window__stats-item-label">Intelligence</span>
                                        <span className="character-window__stats-item-value">{character.stats.intelligence}</span>
                                    </div>
                                    <div className="character-window__stats-item">
                                        <span className="character-window__stats-item-label">Vitality</span>
                                        <span className="character-window__stats-item-value">{character.stats.vitality}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Экипировка */}
                        <div className="character-window__panel">
                            <div className="character-window__panel-header">Equipment</div>
                            <div className="character-window__panel-content">
                                <div className="character-window__equipment">
                                    {Object.entries(character.equipment).map(([slot, item]) => (
                                        <div key={slot} className="character-window__equipment-item">
                                            <span className="character-window__equipment-item-slot">{formatSlotName(slot)}</span>
                                            <span className="character-window__equipment-item-name">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - навыки и достижения */}
                    <div>
                        {/* Навыки */}
                        <div className="character-window__panel">
                            <div className="character-window__panel-header">Skills</div>
                            <div className="character-window__panel-content">
                                <div className="character-window__skills">
                                    {character.skills.map(skill => (
                                        <div key={skill.id} className="character-window__skills-item">
                                            <div className="character-window__skills-item-icon">
                                                <img
                                                    src={skill.icon || "/default-skill-icon.png"}
                                                    alt={skill.name}
                                                />
                                            </div>
                                            <div className="character-window__skills-item-content">
                                                <div className="character-window__skills-item-header">
                                                    <h3 className="character-window__skills-item-name">{skill.name}</h3>
                                                    <span className="character-window__skills-item-level">Lvl {skill.level}</span>
                                                </div>
                                                <p className="character-window__skills-item-description">{skill.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Достижения */}
                        <div className="character-window__panel">
                            <div className="character-window__panel-header">Achievements</div>
                            <div className="character-window__panel-content">
                                <div className="character-window__achievements">
                                    {character.achievements.map(achievement => (
                                        <div key={achievement.id} className="character-window__achievements-item">
                                            <div className="character-window__achievements-item-header">
                                                <h3 className={`character-window__achievements-item-name ${
                                                    achievement.completed ? 'character-window__achievements-item-name--completed' : ''
                                                }`}>
                                                    {achievement.name}
                                                </h3>
                                                <span className="character-window__achievements-item-progress">
                          {achievement.progress}/{achievement.totalRequired}
                        </span>
                                            </div>
                                            <p className="character-window__achievements-item-description">{achievement.description}</p>
                                            <div className="character-window__achievements-item-bar">
                                                <div
                                                    className={`character-window__achievements-item-bar-fill ${
                                                        achievement.completed
                                                            ? 'character-window__achievements-item-bar-fill--completed'
                                                            : 'character-window__achievements-item-bar-fill--progress'
                                                    }`}
                                                    style={{ width: `${calculateProgress(achievement.progress, achievement.totalRequired)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterWindow;