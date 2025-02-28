// Компонент инвентаря
import Button from "./Button.tsx";
import React, {useEffect, useState} from "react";
import {Item} from "../../core/logic/items/item.ts";
import {ItemType} from "../GameUI.tsx";
import {player} from "../../core/main.ts";


interface InventoryProps {
    onShowInfo: (item: ItemType, rect: DOMRect) => void;
    onHideInfo: () => void;
}

// Вспомогательная функция для определения цвета редкости
const getRarityColor = (rarity: string): string => {
    switch (rarity) {
        case 'common':
            return 'grey';
        case 'rare':
            return 'blue';
        default:
            return 'white';
    }
};

export const Inventory: React.FC<InventoryProps> = ({ onShowInfo, onHideInfo }) => {
    const [inventory, setInventory] = useState(player!.inventory);

    useEffect(() => {
        const interval = setInterval(() => {
            // Обновляем копию инвентаря из глобального объекта
            setInventory([...player!.inventory]);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inventory-div ui-div cell-type">
            {inventory.map((item : Item, index) => (
                <Button
                    key={index}
                    className="cell ui-div"
                    onClick={() => {
                        if (item) {
                            item.onUse();
                            player!.inventory[index] = null;
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (item) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            onShowInfo(item, rect);
                        }
                    }}
                    onMouseLeave={onHideInfo}
                    style={{
                        backgroundImage: item ? `url(${item.image})` : undefined,
                        borderColor: item ? getRarityColor(item.rarity) : 'black',
                        cursor: item ? 'pointer' : 'default',
                    }}
                >
                    {index}
                </Button>
            ))}
        </div>
    );
};