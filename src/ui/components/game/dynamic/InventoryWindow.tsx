import Icon from "./Icon.tsx";
import {useEffect, useState} from "react";
import {useMyDispatch} from "../../../../utils/stateManagement/store.ts";
import {player} from "../../../../core/main.ts";
import Item from "../../../../core/logic/items/item.ts";
import {setInfoEntity, setInfoPosition} from "../../../../utils/stateManagement/uiSlice.ts";
import {RarityTypes} from "../../../../core/types.ts";

const getRarityColor = (rarity: RarityTypes): string => {
    switch (rarity) {
        case 'common':
            return 'grey';
        case 'uncommon':
            return 'green';
        case 'rare':
            return 'blue';
        case 'epic':
            return 'violet';
        case 'legendary':
            return 'orange';
        case 'godlike':
            return 'red';
        default:
            return 'black';
    }
};

const InventoryWindow = () => {
    const [inventory, setInventory] = useState<(Item | null)[]>(player!.inventory);
    const [draggedItem, setDraggedItem] = useState<{ item: Item | null, index: number } | null>(null);

    const dispatch = useMyDispatch();

    useEffect(() => {
        const interval = setInterval(() => {
            setInventory([...player!.inventory]);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const handleDragStart = (e: React.DragEvent, item: Item | null, index: number) => {
        if (!item) return;

        e.dataTransfer.setData("text/plain", index.toString());
        setDraggedItem({ item, index });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (!draggedItem) return;

        const sourceIndex = draggedItem.index;
        const sourceItem = draggedItem.item;

        if (sourceIndex === targetIndex) return; // No change if same slot

        const targetItem = player!.inventory[targetIndex];

        // Handle stacking logic
        if (targetItem && sourceItem &&
            targetItem.name === sourceItem.name &&
            (sourceItem as any).stackable === true) {

            const targetCount = (targetItem as any).count || 1;
            const sourceCount = (sourceItem as any).count || 1;

            // If they can be fully stacked together
            if (targetCount + sourceCount <= 99) {
                (targetItem as any).count = targetCount + sourceCount;
                player!.inventory[sourceIndex] = null;
            } else {
                // Partial stack, fill target to max and keep remainder in source
                (targetItem as any).count = 99;
                (sourceItem as any).count = targetCount + sourceCount - 99;
            }
        } else {
            // Swap items
            player!.inventory[sourceIndex] = targetItem;
            player!.inventory[targetIndex] = sourceItem;
        }

        setInventory([...player!.inventory]);
        setDraggedItem(null);
    };

    return (
        <div className="inventory-div ui-div cell-type">
            {inventory.map((item, index) => (
                <button
                    key={index}
                    className={"ui-div cell"}
                    draggable={!!item}
                    onDragStart={(e) => handleDragStart(e, item, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
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
                            dispatch(setInfoEntity( {name: item.name, description: item.description, note: item.note, rarity: item.rarity, icon: item.icon, count: (item as any).count} ));
                        }
                    }}
                    onMouseLeave={() => {
                        dispatch(setInfoEntity(null));
                        dispatch(setInfoPosition(null));
                    }}
                    style={{
                        borderColor: item ? getRarityColor(item.rarity) : 'black',
                        cursor: item ? 'pointer' : 'default',
                        padding: 0
                    }}
                >
                    <Icon
                        icon={item?.icon}
                        count={(item as any)?.count}
                        borderColor={item ? getRarityColor(item.rarity) : undefined}
                        displayText={String(index)}
                    />
                </button>
            ))}
        </div>
    );
};

export default InventoryWindow;
