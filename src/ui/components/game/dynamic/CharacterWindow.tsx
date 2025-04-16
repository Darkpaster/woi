// Добавим мок сервис для получения данных персонажа
import {useEffect, useState} from "react";
import {friendService} from "../../../service/friendService.ts";

const getCharacter = async (id: number): Promise<User & {
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
}> => {
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
    const { id } = useParams<{ id: string }>();
    const characterId = parseInt(id || '0');
    const currentUserId = 1; // Здесь должен быть ID текущего пользователя из контекста/стора

    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [isPendingRequest, setIsPendingRequest] = useState(false);
    const [friendStatus, setFriendStatus] = useState<'none' | 'friend' | 'pending' | 'incoming'>('none');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Получаем данные персонажа
                const characterData = await getCharacter(characterId);
                setCharacter(characterData);

                // Проверяем статус дружбы, если это не текущий пользователь
                if (characterId !== currentUserId) {
                    const [friends, incomingRequests, outgoingRequests] = await Promise.all([
                        friendService.getFriends(currentUserId),
                        friendService.getIncomingRequests(currentUserId),
                        friendService.getOutgoingRequests(currentUserId)
                    ]);

                    setIsFriend(friends.some(friend => friend.id === characterId));

                    const incoming = incomingRequests.some(
                        request => request.sender.id === characterId
                    );

                    const outgoing = outgoingRequests.some(
                        request => request.receiver.id === characterId
                    );

                    if (isFriend) setFriendStatus('friend');
                    else if (incoming) setFriendStatus('incoming');
                    else if (outgoing) setFriendStatus('pending');
                    else setFriendStatus('none');
                }
            } catch (error) {
                console.error('Error fetching character data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (characterId) {
            fetchData();
        }
    }, [characterId, currentUserId]);

    const handleSendFriendRequest = async () => {
        try {
            await friendService.sendFriendRequest(currentUserId, characterId);
            setFriendStatus('pending');
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const handleAcceptFriendRequest = async () => {
        try {
            // Находим ID запроса (в реальном приложении вы бы получили его из API)
            const incomingRequests = await friendService.getIncomingRequests(currentUserId);
            const request = incomingRequests.find(req => req.sender.id === characterId);

            if (request) {
                await friendService.acceptFriendRequest(currentUserId, request.id);
                setFriendStatus('friend');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleRejectFriendRequest = async () => {
        try {
            // Находим ID запроса
            const incomingRequests = await friendService.getIncomingRequests(currentUserId);
            const request = incomingRequests.find(req => req.sender.id === characterId);

            if (request) {
                await friendService.rejectFriendRequest(currentUserId, request.id);
                setFriendStatus('none');
            }
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            await friendService.removeFriend(currentUserId, characterId);
            setFriendStatus('none');
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="text-white">Loading character...</div>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="text-white">Character not found</div>
            </div>
        );
    }

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
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Remove Friend
                    </button>
                );
            case 'pending':
                return (
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded cursor-not-allowed"
                        disabled
                    >
                        Friend Request Sent
                    </button>
                );
            case 'incoming':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleAcceptFriendRequest}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleRejectFriendRequest}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Decline
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        onClick={handleSendFriendRequest}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Add Friend
                    </button>
                );
        }
    };

    // Расчет процента прогресса для достижений
    const calculateProgress = (current: number, total: number) => {
        return Math.floor((current / total) * 100);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                {/* Шапка персонажа */}
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6 border border-gray-700">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row">
                            {/* Аватар и базовая информация */}
                            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                                <div className="relative">
                                    <img
                                        src={character.avatar || "/default-avatar.png"}
                                        alt={character.characterName}
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-700"
                                    />
                                    <span
                                        className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ${character.online ? 'bg-green-500' : 'bg-gray-500'}`}
                                    />
                                </div>
                            </div>

                            {/* Основная информация о персонаже */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold">{character.characterName}</h1>
                                        <div className="flex items-center space-x-2 text-gray-400">
                                            <span>Level {character.level}</span>
                                            <span>•</span>
                                            <span>{character.class}</span>
                                            {character.guild && (
                                                <>
                                                    <span>•</span>
                                                    <span>
                            <span className="text-yellow-500">{character.guild.name}</span> [{character.guild.rank}]
                          </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-1 text-gray-500 text-sm">
                                            {character.online
                                                ? 'Online now'
                                                : `Last seen ${new Date(character.lastOnline).toLocaleDateString()}`}
                                        </div>
                                    </div>

                                    {/* Кнопки действий (добавить в друзья и т.д.) */}
                                    <div className="flex space-x-2">
                                        {renderFriendActions()}
                                        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                                            Invite to Party
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Основной контент */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Левая колонка - статы и экипировка */}
                    <div className="col-span-1">
                        {/* Статы */}
                        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6 border border-gray-700">
                            <div className="bg-gray-700 px-4 py-2 font-semibold">Stats</div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Strength</span>
                                        <span className="text-yellow-500 font-semibold">{character.stats.strength}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Dexterity</span>
                                        <span className="text-yellow-500 font-semibold">{character.stats.dexterity}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Intelligence</span>
                                        <span className="text-yellow-500 font-semibold">{character.stats.intelligence}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Vitality</span>
                                        <span className="text-yellow-500 font-semibold">{character.stats.vitality}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Экипировка */}
                        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                            <div className="bg-gray-700 px-4 py-2 font-semibold">Equipment</div>
                            <div className="p-4">
                                <div className="space-y-2">
                                    {Object.entries(character.equipment).map(([slot, item]) => (
                                        <div key={slot} className="flex items-center justify-between">
                                            <span className="text-gray-400 capitalize">{slot.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="text-blue-400">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Средняя и правая колонки - навыки и достижения */}
                    <div className="col-span-1 md:col-span-2">
                        {/* Навыки */}
                        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6 border border-gray-700">
                            <div className="bg-gray-700 px-4 py-2 font-semibold">Skills</div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {character.skills.map(skill => (
                                        <div key={skill.id} className="bg-gray-900 rounded p-3 flex">
                                            <div className="flex-shrink-0 mr-3">
                                                <img
                                                    src={skill.icon || "/default-skill-icon.png"}
                                                    alt={skill.name}
                                                    className="w-12 h-12 rounded object-cover border border-gray-700"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h3 className="font-medium">{skill.name}</h3>
                                                    <span className="text-green-500">Lvl {skill.level}</span>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">{skill.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Достижения */}
                        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                            <div className="bg-gray-700 px-4 py-2 font-semibold">Achievements</div>
                            <div className="p-4">
                                <div className="space-y-4">
                                    {character.achievements.map(achievement => (
                                        <div key={achievement.id} className="bg-gray-900 rounded p-3">
                                            <div className="flex justify-between mb-1">
                                                <h3 className={`font-medium ${achievement.completed ? 'text-yellow-500' : 'text-white'}`}>
                                                    {achievement.name}
                                                </h3>
                                                <span className="text-gray-400">
                          {achievement.progress}/{achievement.totalRequired}
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${achievement.completed ? 'bg-yellow-500' : 'bg-blue-600'}`}
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