// Компонент инвентаря
import Button from "./Button.tsx";
import React, {useEffect, useState} from "react";
import {player} from "../../core/logic/update.ts";
import {Item} from "../../core/logic/items/item.ts";
import {ItemType} from "../GameUI.tsx";

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
        <div className="inventory-div">
            {inventory.map((item : Item, index) => (
                <Button
                    key={index}
                    className="cell"
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