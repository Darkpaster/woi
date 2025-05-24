import StatusBar from "../status-bar/StatusBar.tsx";
import { player } from "../../../core/main.ts";
import BuffsList from "./BuffsList.tsx";

const TargetWidget: React.FC = () => {
    // Не отображаем виджет, если нет выбранной цели
    if (!player.target) {
        return null;
    }

    // Определяем, является ли цель вражеской (можно добавить проверку на faction или другие параметры)
    const isEnemy = player.target.isEnemy || true; // Предполагаем, что все цели враги

    // Пример данных баффов (в реальном приложении будут браться из player.target.buffs)
    const targetBuffs = [
        {
            id: "poison",
            name: "Отравление",
            description: "Персонаж отравлен и теряет здоровье со временем",
            icon: "src/assets/icons/poison.png",
            duration: 15,
            maxDuration: 30,
            type: "debuff" as const,
            rarity: "common",
            note: "Эффект можно снять зельем противоядия"
        },
        {
            id: "strength",
            name: "Сила",
            description: "Увеличивает физический урон на 25%",
            icon: "src/assets/icons/strength.png",
            duration: 45,
            maxDuration: 60,
            type: "buff" as const,
            rarity: "uncommon"
        },
        {
            id: "slow",
            name: "Замедление",
            description: "Снижает скорость передвижения на 50%",
            icon: "src/assets/icons/slow.png",
            duration: 8,
            maxDuration: 10,
            type: "debuff" as const,
            rarity: "common"
        }
    ];

    return (
        <>
            <div className={`target-widget ${isEnemy ? 'enemy' : 'friendly'}`}>
                <div className="target-header">
                    {/* Аватар цели */}
                    <div className="avatar-container">
                        <div className="avatar">
                            {player.target.HP ? (
                                <img src={"src/assets/icons/Icon_09.png"} alt={player.target.name} />
                            ) : (
                                <div />
                            )}
                        </div>
                        <div className="level-indicator">
                            {player.target.level}
                        </div>
                    </div>

                    {/* Информация о цели */}
                    <div className="character-info">
                        <div className="character-name">{player.target.name}</div>
                        <div className="character-class">{player.target.characterClass}</div>
                    </div>
                </div>

                {/* Индикаторы показателей */}
                <div className="status-bars">
                    <StatusBar
                        value={player.target.HP}
                        max={player.target.HT}
                        color="health"
                        label="Здоровье"
                    />
                    {/* Отображаем ману только если она есть у цели (например, для NPC-мобов может не быть) */}
                    {player.target.MT > 0 && (
                        <StatusBar
                            value={player.target.MP}
                            max={player.target.MT}
                            color="mana"
                            label="Мана"
                        />
                    )}
                    {/* Отображаем выносливость только если она есть у цели */}
                    {player.target.MT > 0 && (
                        <StatusBar
                            value={player.target.MP}
                            max={player.target.MT}
                            color="stamina"
                            label="Выносливость"
                        />
                    )}
                </div>

                {/* Иконки состояний цели */}
                <div className="status-indicators">
                    {player.target.HP < player.target.HP / 3 && (
                        <div className="status-low-health">
                            Низкое здоровье
                        </div>
                    )}
                </div>
            </div>

            {/* Список баффов цели */}
            <BuffsList
                buffs={targetBuffs}
                className="target-buffs-list"
            />
        </>
    );
};

export default TargetWidget;