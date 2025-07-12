import { useState, useEffect } from 'react';
import '../styles/characterWindow.scss';

// Mock player data - replace with actual import
const player = { id: '1' };

// Icon component
interface IconProps {
    icon?: string;
    count?: number;
    displayText?: string;
    fontSize?: string;
    textAlign?: string;
}

const Icon: React.FC<IconProps> = ({
                                       icon,
                                       count,
                                       displayText = '',
                                       fontSize = '15px',
                                       textAlign = 'end'
                                   }) => {
    return (
        <div
            className="item-icon"
            style={{
                backgroundImage: icon ? `url(${icon})` : "",
            }}
        >
            {displayText && (
                <div
                    className="item-icon__text"
                    style={{
                        textAlign: textAlign as any,
                        fontSize,
                    }}
                >
                    {displayText}
                </div>
            )}
            {count && count > 1 && (
                <div className="item-icon__count">
                    {count}
                </div>
            )}
        </div>
    );
};

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
        health: number;
        rage: number;
        itemLevel: number;
        speed: number;
    };
    equipment: {
        head: { name: string; icon?: string };
        neck: { name: string; icon?: string };
        shoulder: { name: string; icon?: string };
        chest: { name: string; icon?: string };
        waist: { name: string; icon?: string };
        legs: { name: string; icon?: string };
        feet: { name: string; icon?: string };
        wrists: { name: string; icon?: string };
        hands: { name: string; icon?: string };
        finger1: { name: string; icon?: string };
        finger2: { name: string; icon?: string };
        trinket1: { name: string; icon?: string };
        trinket2: { name: string; icon?: string };
        mainHand: { name: string; icon?: string };
        offHand: { name: string; icon?: string };
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
    playerScore: {
        gearScore: number;
        raidScore: number;
        pvpGearScore: number;
        pvpScore: number;
        playerRating: number;
    };
    defense: {
        armor: number;
        dodge: number;
        parry: number;
        block: number;
        resilience: number;
        mastery: number;
        totalAvoidance: number;
        critImmunity: number;
    };
    melee: {
        damage: string;
        dps: number;
        attackPower: number;
        hitRating: number;
        critChance: number;
        expertise: number;
        haste: number;
    };
};

type FriendStatus = 'none' | 'friend' | 'pending' | 'incoming';

const getCharacter = async (id: number): Promise<CharacterType> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                id,
                username: "player123",
                characterName: "Abrams",
                level: 85,
                class: "Protection Warrior",
                online: true,
                lastOnline: Date.now(),
                avatar: "/character-avatar.png",
                friendCount: 15,
                stats: {
                    strength: 68,
                    dexterity: 120,
                    intelligence: 75,
                    vitality: 82,
                    health: 197417,
                    rage: 100,
                    itemLevel: 395,
                    speed: 118
                },
                equipment: {
                    head: { name: "Helmet of Shadows", icon: "/icons/helmet.png" },
                    neck: { name: "Necklace of Power", icon: "/icons/necklace.png" },
                    shoulder: { name: "Shoulder Guards", icon: "/icons/shoulder.png" },
                    chest: { name: "Breastplate of Valor", icon: "/icons/chest.png" },
                    waist: { name: "Belt of Strength", icon: "/icons/belt.png" },
                    legs: { name: "Legguards of Might", icon: "/icons/legs.png" },
                    feet: { name: "Boots of Speed", icon: "/icons/boots.png" },
                    wrists: { name: "Bracers of Defense", icon: "/icons/wrists.png" },
                    hands: { name: "Gauntlets of Power", icon: "/icons/gloves.png" },
                    finger1: { name: "Ring of Wisdom", icon: "/icons/ring.png" },
                    finger2: { name: "Band of Courage", icon: "/icons/ring.png" },
                    trinket1: { name: "Trinket of Might", icon: "/icons/trinket.png" },
                    trinket2: { name: "Charm of Fortune", icon: "/icons/trinket.png" },
                    mainHand: { name: "Sword of Kings", icon: "/icons/sword.png" },
                    offHand: { name: "Shield of Heroes", icon: "/icons/shield.png" }
                },
                skills: [
                    {
                        id: 1,
                        name: "Shield Slam",
                        level: 3,
                        description: "Strike with your shield dealing damage and generating threat",
                        icon: "/skill-icons/shield-slam.png"
                    },
                    {
                        id: 2,
                        name: "Heroic Strike",
                        level: 2,
                        description: "A powerful weapon strike that increases damage",
                        icon: "/skill-icons/heroic-strike.png"
                    }
                ],
                achievements: [
                    {
                        id: 1,
                        name: "Tank Master",
                        description: "Successfully tank 100 dungeons",
                        completed: true,
                        progress: 100,
                        totalRequired: 100
                    }
                ],
                guild: {
                    id: 1,
                    name: "Crimson Legion",
                    rank: "Officer",
                    memberSince: "2024-03-15"
                },
                playerScore: {
                    gearScore: 10660,
                    raidScore: 1930,
                    pvpGearScore: 8729,
                    pvpScore: 1361,
                    playerRating: 1071
                },
                defense: {
                    armor: 30486,
                    dodge: 15.12,
                    parry: 17.24,
                    block: 63.35,
                    resilience: 0,
                    mastery: 28.90,
                    totalAvoidance: 32.36,
                    critImmunity: 100.71
                },
                melee: {
                    damage: "2712-3676",
                    dps: 1228.4,
                    attackPower: 8557,
                    hitRating: 258,
                    critChance: 6.84,
                    expertise: 26,
                    haste: 3.20
                }
            });
        }, 300);
    });
};

const CharacterWindow = () => {
    const characterId = parseInt(player.id || '0');
    const currentUserId = 1;

    const [character, setCharacter] = useState<CharacterType | null>(null);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const characterData = await getCharacter(characterId);
                setCharacter(characterData);
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

    if (loading) {
        return (
            <div className="character-window__loading">
                <div>Loading character...</div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="character-window__error">
                <div>{error || 'Character not found'}</div>
            </div>
        );
    }

    // Equipment layout - left side, character model, right side
    const leftEquipment = ['head', 'neck', 'shoulder', 'chest', 'waist', 'legs', 'feet'];
    const rightEquipment = ['wrists', 'hands', 'finger1', 'finger2', 'trinket1', 'trinket2'];
    const bottomEquipment = ['mainHand', 'offHand'];

    return (
        <div className="character-window ui-div ui-border">
            {/* Header with close button */}
            <div className="character-header">
                <div className="character-header__content">
                    <h1 className="character-header__name">{character.characterName}</h1>
                    <div className="character-header__level">Level {character.level} {character.class}</div>
                </div>
                <button className="character-header__close-btn">
                    ×
                </button>
            </div>

            <div className="character-main">
                {/* Left Panel - Character Model and Equipment */}
                <div className="character-equipment">
                    {/* Equipment and Character Layout */}
                    <div className="character-equipment__layout">
                        {/* Left Equipment Slots */}
                        <div className="character-equipment__slots">
                            {leftEquipment.map((slot) => {
                                const item = character.equipment[slot as keyof typeof character.equipment];
                                return (
                                    <div
                                        key={slot}
                                        className="character-equipment__slot"
                                        title={item.name}
                                    >
                                        <Icon icon={item.icon} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Character Model */}
                        <div className="character-equipment__model">
                            <div className="character-equipment__model-display">
                                <div>🛡️</div>
                            </div>

                            {/* Weapon Slots */}
                            <div className="character-equipment__model-weapons">
                                {bottomEquipment.map((slot) => {
                                    const item = character.equipment[slot as keyof typeof character.equipment];
                                    return (
                                        <div
                                            key={slot}
                                            className="character-equipment__slot"
                                            title={item.name}
                                        >
                                            <Icon icon={item.icon} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Equipment Slots */}
                        <div className="character-equipment__slots">
                            {rightEquipment.map((slot) => {
                                const item = character.equipment[slot as keyof typeof character.equipment];
                                return (
                                    <div
                                        key={slot}
                                        className="character-equipment__slot"
                                        title={item.name}
                                    >
                                        <Icon icon={item.icon} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="character-equipment__actions">
                        <button className="inspect">
                            Inspect
                        </button>
                        <button className="invite">
                            Invite
                        </button>
                    </div>
                </div>

                {/* Right Panel - Stats with Scroll */}
                <div className="character-stats">
                    <div className="character-stats__container">
                        {/* PlayerScore Section */}
                        <div className="character-stats__section">
                            <h3 className="character-stats__title">PlayerScore</h3>
                            <div className="character-stats__list">
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">GearScore:</span>
                                    <span className="character-stats__item-value">{character.playerScore.gearScore}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Raid Score:</span>
                                    <span className="character-stats__item-value">{character.playerScore.raidScore}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">PvP GearScore:</span>
                                    <span className="character-stats__item-value">{character.playerScore.pvpGearScore}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">PvP Score:</span>
                                    <span className="character-stats__item-value">{character.playerScore.pvpScore}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Player Rating:</span>
                                    <span className="character-stats__item-value character-stats__item-value--positive">{character.playerScore.playerRating}</span>
                                </div>
                            </div>
                        </div>

                        {/* General Section */}
                        <div className="character-stats__section">
                            <h3 className="character-stats__title">General</h3>
                            <div className="character-stats__list">
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Health:</span>
                                    <span className="character-stats__item-value">{character.stats.health}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Rage:</span>
                                    <span className="character-stats__item-value">{character.stats.rage}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Item Level:</span>
                                    <span className="character-stats__item-value">{character.stats.itemLevel} / 396</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Speed:</span>
                                    <span className="character-stats__item-value">{character.stats.speed}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Defense Section */}
                        <div className="character-stats__section">
                            <h3 className="character-stats__title">Defense</h3>
                            <div className="character-stats__list">
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Armor:</span>
                                    <span className="character-stats__item-value">{character.defense.armor}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Dodge:</span>
                                    <span className="character-stats__item-value">{character.defense.dodge}%</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Parry:</span>
                                    <span className="character-stats__item-value">{character.defense.parry}%</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Block:</span>
                                    <span className="character-stats__item-value">{character.defense.block}%</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Resilience:</span>
                                    <span className="character-stats__item-value">{character.defense.resilience}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Mastery:</span>
                                    <span className="character-stats__item-value">{character.defense.mastery}%</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Total Avoidance:</span>
                                    <span className="character-stats__item-value">{character.defense.totalAvoidance}%</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Crit Immunity:</span>
                                    <span className="character-stats__item-value">{character.defense.critImmunity}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Melee Section */}
                        <div className="character-stats__section">
                            <h3 className="character-stats__title">Melee</h3>
                            <div className="character-stats__list">
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Damage:</span>
                                    <span className="character-stats__item-value">{character.melee.damage}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">DPS:</span>
                                    <span className="character-stats__item-value">{character.melee.dps}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Attack Power:</span>
                                    <span className="character-stats__item-value">{character.melee.attackPower}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Hit Rating:</span>
                                    <span className="character-stats__item-value">{character.melee.hitRating}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Crit Chance:</span>
                                    <span className="character-stats__item-value">{character.melee.critChance}%</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Expertise:</span>
                                    <span className="character-stats__item-value">{character.melee.expertise}</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Haste:</span>
                                    <span className="character-stats__item-value">{character.melee.haste}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Ranged Section */}
                        <div className="character-stats__section">
                            <h3 className="character-stats__title">Ranged</h3>
                            <div className="character-stats__list">
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Ranged Attack:</span>
                                    <span className="character-stats__item-value character-stats__item-value--na">N/A</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Ranged Speed:</span>
                                    <span className="character-stats__item-value character-stats__item-value--na">N/A</span>
                                </div>
                            </div>
                        </div>

                        {/* Spell Section */}
                        <div className="character-stats__section">
                            <h3 className="character-stats__title">Spell</h3>
                            <div className="character-stats__list">
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Spell Power:</span>
                                    <span className="character-stats__item-value">156</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Spell Hit:</span>
                                    <span className="character-stats__item-value">3.2%</span>
                                </div>
                                <div className="character-stats__item">
                                    <span className="character-stats__item-label">Spell Crit:</span>
                                    <span className="character-stats__item-value">8.45%</span>
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