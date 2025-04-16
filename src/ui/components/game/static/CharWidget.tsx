import ContextMenu from "../dynamic/ContextMenu.tsx";
import {useState} from "react";
import StatusBar from "./StatusBar.tsx";

interface CharWidgetProps {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    stamina: number;
    maxStamina: number;
    level: number;
    name: string;
    characterClass: string;
    avatarUrl?: string;
}

const CharWidget: React.FC<CharWidgetProps> = ({
                                                   health,
                                                   maxHealth,
                                                   mana,
                                                   maxMana,
                                                   stamina,
                                                   maxStamina,
                                                   level,
                                                   name,
                                                   characterClass,
                                                   avatarUrl
                                               }) => {
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
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white w-64 select-none"
            onContextMenu={handleContextMenu}
        >
            <div className="flex mb-3">
                {/* Аватар персонажа */}
                <div className="relative mr-3">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-700 overflow-hidden">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                        ) : (
                            <User size={32} />
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {level}
                    </div>
                </div>

                {/* Информация о персонаже */}
                <div className="flex flex-col justify-center">
                    <div className="font-bold">{name}</div>
                    <div className="text-sm text-gray-400">{characterClass}</div>
                </div>
            </div>

            {/* Индикаторы показателей */}
            <div className="space-y-1">
                <StatusBar
                    value={health}
                    max={maxHealth}
                    color="bg-red-600"
                    label="Здоровье"
                />
                <StatusBar
                    value={mana}
                    max={maxMana}
                    color="bg-blue-600"
                    label="Мана"
                />
                <StatusBar
                    value={stamina}
                    max={maxStamina}
                    color="bg-green-600"
                    label="Выносливость"
                />
            </div>

            {/* Иконки состояний персонажа (можно добавить больше) */}
            <div className="flex mt-2 justify-end">
                {health < maxHealth / 3 && (
                    <div className="text-red-500 text-xs mr-2 flex items-center">
                        <Heart size={12} className="mr-1" />
                        Низкое здоровье
                    </div>
                )}
                {mana < maxMana / 4 && (
                    <div className="text-blue-500 text-xs flex items-center">
                        <Droplet size={12} className="mr-1" />
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
                    playerName={name}
                />
            )}
        </div>
    );
};

export default CharWidget;