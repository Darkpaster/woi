import { useState } from "react";
import StatusBar from "../../statusBar/StatusBar.tsx";
import ContextMenu from "../../contextMenu/ContextMenu.tsx";
import { player } from "../../../../core/main.ts";
import "./playerWidget.scss"

const PlayerWidget: React.FC = () => {
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number }>({
        visible: false,
        x: 0,
        y: 0
    });

    // Обработчик правого клика для показа контекстного меню
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY
        });
    };

    // Закрытие контекстного меню
    const closeContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    return (
        <div
            className="player-widget"
            onContextMenu={handleContextMenu}
        >
            <div className="player-header">
                {/* Аватар персонажа */}
                <div className="avatar-container">
                    <div className="avatar">
                        {player?.AA ? (
                            <img src={"src/assets/raw.png"} alt={player.name} />
                        ) : (
                            <div />
                        )}
                    </div>
                    <div className="level-indicator">
                        {player.level}
                    </div>
                </div>

                {/* Информация о персонаже */}
                <div className="character-info">
                    <div className="character-name">{player.name}</div>
                    <div className="character-class">{"воин"}</div>
                </div>
            </div>

            {/* Индикаторы показателей */}
            <div className="status-bars">
                <StatusBar
                    value={player.HP}
                    max={player.HT}
                    color="health"
                    label="Здоровье"
                />
                <StatusBar
                    value={player.MP}
                    max={player.MT}
                    color="mana"
                    label="Мана"
                />
                <StatusBar
                    value={999999}
                    max={999999}
                    color="stamina"
                    label="Выносливость"
                />
            </div>

            {/* Иконки состояний персонажа */}
            <div className="status-indicators">
                {player.HP < player.HT / 3 && (
                    <div className="status-low-health">
                        Низкое здоровье
                    </div>
                )}
                {player.MP < player.MT / 4 && (
                    <div className="status-low-mana">
                        Мало маны
                    </div>
                )}
            </div>

            {/* Контекстное меню */}
            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    playerName={player.name}
                />
            )}
        </div>
    );
};

export default PlayerWidget;