import {useEffect, useRef} from "react";

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
        { icon: <Heart size={16} />, label: "Исцелить", action: () => console.log(`Healing ${playerName}`) },
        { icon: <Shield size={16} />, label: "Защитить", action: () => console.log(`Buffing ${playerName}`) },
        { icon: <Swords size={16} />, label: "Дуэль", action: () => console.log(`Dueling ${playerName}`) },
        { icon: <Share size={16} />, label: "Поделиться опытом", action: () => console.log(`Sharing XP with ${playerName}`) },
        { icon: <Maximize2 size={16} />, label: "Пригласить в группу", action: () => console.log(`Inviting ${playerName} to party`) },
        { icon: <LogOut size={16} className="text-red-500" />, label: "Сообщить о нарушении", action: () => console.log(`Reporting ${playerName}`), danger: true }
    ];

    return (
        <div
            ref={menuRef}
            className="absolute bg-gray-800 border border-gray-700 rounded shadow-lg py-1 w-56"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                zIndex: 1000
            }}
        >
            {menuItems.map((item, index) => (
                <div
                    key={index}
                    className={`flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer ${item.danger ? 'text-red-500' : ''}`}
                    onClick={() => {
                        item.action();
                        onClose();
                    }}
                >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                </div>
            ))}
        </div>
    );
};

export default ContextMenu;