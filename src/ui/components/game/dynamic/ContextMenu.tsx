import { useEffect, useRef } from "react";
import "../static/contextMenu.scss"

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    playerName: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, playerName }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // Действия в контекстном меню
    const menuItems = [
        { icon: "heart", label: "Осмотреть", action: () => console.log(`Healing ${playerName}`) },
        { icon: "shield", label: "Добавить в друзья", action: () => console.log(`Buffing ${playerName}`) },
        { icon: "swords", label: "Дуэль", action: () => console.log(`Dueling ${playerName}`) },
        { icon: "share", label: "Поделиться опытом", action: () => console.log(`Sharing XP with ${playerName}`) },
        { icon: "maximize", label: "Пригласить в группу", action: () => console.log(`Inviting ${playerName} to party`) },
        { icon: "logout", label: "Сообщить о нарушении", action: () => console.log(`Reporting ${playerName}`), danger: true }
    ];

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                left: `${x}px`,
                top: `${y}px`
            }}
        >
            {menuItems.map((item, index) => (
                <div
                    key={index}
                    className={`menu-item ${item.danger ? 'danger' : ''}`}
                    onClick={() => {
                        item.action();
                        onClose();
                    }}
                >
                    <span className={`menu-icon ${item.icon}`}></span>
                    {item.label}
                </div>
            ))}
        </div>
    );
};

export default ContextMenu;