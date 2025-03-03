// Компонент инвентаря
import Button from "./Button.tsx";
import React, {useEffect, useState} from "react";
import {Item} from "../../core/logic/items/item.ts";
import {ItemType} from "../GameUI.tsx";
import {player} from "../../core/main.ts";
import {setInfoEntity, setInfoPosition} from "../../utils/stateManagement/uiSlice.ts";
import {useMyDispatch} from "../../utils/stateManagement/store.ts";


// interface InventoryProps {
//     onShowInfo: (item: ItemType<Item>, rect: DOMRect) => void;
//     onHideInfo: () => void;
// }

// Вспомогательная функция для определения цвета редкости
const getRarityColor = (rarity: string): string => {
    switch (rarity) {
        case 'common':
            return 'grey';
        case 'rare':
            return 'blue';
        case 'uncommon':
            return 'green';
        default:
            return 'white';
    }
};

export const Inventory = () => {
    const [inventory, setInventory] = useState(player!.inventory);

    const dispatch = useMyDispatch();

    useEffect(() => {
        const interval = setInterval(() => {
            setInventory([...player!.inventory]);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inventory-div ui-div cell-type">
            {inventory.map((item : Item, index) => (
                <Button
                    key={index}
                    styleType="ui-div cell"
                    onClick={() => {
                        if (item) {
                            item.onUse();
                            player!.inventory[index] = null;
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (item) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            dispatch(setInfoPosition({left: rect.x, top: rect.y}));
                            dispatch(setInfoEntity(item));
                        }
                    }}
                    onMouseLeave={() => {
                        dispatch(setInfoEntity(null));
                        dispatch(setInfoPosition(null));
                    }}
                    style={{
                        backgroundImage: item ? `url(${item.icon})` : undefined,
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