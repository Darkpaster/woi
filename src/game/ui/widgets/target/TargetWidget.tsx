import StatusBar from "../status-bar/StatusBar.tsx";
import { player } from "../../../core/main.ts";
import "./targetWidget.scss";

const TargetWidget: React.FC = () => {
    // Не отображаем виджет, если нет выбранной цели
    if (!player.target) {
        return null;
    }

    // Определяем, является ли цель вражеской (можно добавить проверку на faction или другие параметры)
    const isEnemy = player.target.isEnemy || true; // Предполагаем, что все цели враги

    return (
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
    );
};

export default TargetWidget;