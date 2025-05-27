import Icon from "../../../shared/ui/Icon.tsx";
import React, {useEffect, useState} from "react";
import {useMyDispatch} from "../../../../../utils/stateManagement/store.ts";
import {player} from "../../../../core/main.ts";
import Item from "../../../../core/logic/items/item.ts";
import {setInfoEntity, setInfoPosition} from "../../../../../utils/stateManagement/uiSlice.ts";
import {RarityTypes} from "../../../../core/types.ts";
import "../styles/inventory.scss"
import ModalWindow from "../../../shared/ui/ModalWindow.tsx";
import {Coins, X} from "lucide-react";

export const getRarityColor = (rarity: RarityTypes): string => {
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
    const [inventory, setInventory] = useState<(Item | undefined)[]>(player!.inventory);
    const [draggedItem, setDraggedItem] = useState<{ item: Item | null, index: number } | null>(null);
    const [showDropConfirm, setShowDropConfirm] = useState<{ item: Item, index: number } | null>(null);

    const dispatch = useMyDispatch();

    useEffect(() => {
        const interval = setInterval(() => {
            setInventory([...player!.inventory]);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const handleDragStart = (e: React.DragEvent, item: Item | undefined, index: number) => {
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
            sourceItem.stackable) {

            const targetCount = targetItem.amount;
            const sourceCount = sourceItem.amount;

            // If they can be fully stacked together
            if (targetCount + sourceCount <= targetItem.maxStackSize) {
                // Combine the IDs arrays
                const combinedIds = [...targetItem.ids, ...sourceItem.ids];
                targetItem.amount = combinedIds;
                player!.inventory[sourceIndex] = undefined;
            } else {
                // Partial stack, fill target to max and keep remainder in source
                const maxCanAdd = targetItem.maxStackSize - targetCount;
                const sourceIds = [...sourceItem.ids];
                const idsToMove = sourceIds.splice(0, maxCanAdd);

                // Update target item
                const newTargetIds = [...targetItem.ids, ...idsToMove];
                targetItem.amount = newTargetIds;

                // Update source item with remaining IDs
                sourceItem.amount = sourceIds;
            }
        } else {
            // Swap items
            player!.inventory[sourceIndex] = targetItem;
            player!.inventory[targetIndex] = sourceItem;
        }

        setInventory([...player!.inventory]);
        setDraggedItem(null);
    };

    const handleItemClick = (item: Item | undefined, index: number) => {
        if (item) {
            item.onUse();
            // Remove one instance of the item
            if (item.stackable && item.amount > 1) {
                const newIds = [...item.ids];
                newIds.pop(); // Remove one ID
                item.amount = newIds;
            } else {
                // Remove the entire item if it's not stackable or only one left
                player!.inventory[index] = undefined;
            }
        }
    };

    const handleMouseEnter = (e: React.MouseEvent, item: Item | undefined) => {
        if (item) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            dispatch(setInfoPosition({left: rect.x, top: rect.y}));
            dispatch(setInfoEntity({
                name: item.name,
                description: item.description,
                note: item.note,
                rarity: item.rarity,
                icon: item.icon,
                count: item.amount
            }));
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (!draggedItem) return;

        // Get inventory container bounds
        const inventoryElement = e.currentTarget.closest('.inventory-div');
        if (!inventoryElement) return;

        const inventoryRect = inventoryElement.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Check if drag ended outside inventory bounds
        const isOutsideInventory =
            mouseX < inventoryRect.left ||
            mouseX > inventoryRect.right ||
            mouseY < inventoryRect.top ||
            mouseY > inventoryRect.bottom;

        if (isOutsideInventory && draggedItem.item) {
            // Show drop confirmation dialog
            setShowDropConfirm({
                item: draggedItem.item,
                index: draggedItem.index
            });
        }

        setDraggedItem(null);
    };

    const confirmDrop = () => {
        if (showDropConfirm) {
            const { item, index } = showDropConfirm;

            // Drop the item using player's drop method
            player!.drop(item);

            // Update local state
            setInventory([...player!.inventory]);

            // Close confirmation dialog
            setShowDropConfirm(null);

            console.log(`Dropped ${item.name} from slot ${index}`);
        }
    };

    const cancelDrop = () => {
        setShowDropConfirm(null);
    };

    // Initialize imaginary drop confirmation component
    const initializeDropConfirmDialog = () => {
        if (showDropConfirm) {
            // This would initialize your drop confirmation component
            // For now, we'll auto-confirm the drop
            // setTimeout(() => {
            //     confirmDrop();
            // }, 0);
        }
    };

    useEffect(() => {
        initializeDropConfirmDialog();
    }, [showDropConfirm]);

    const handleMouseLeave = () => {
        dispatch(setInfoEntity(null));
        dispatch(setInfoPosition(null));
    };

    return (
        <div className="inventory-div cell-type ui-border">
            {inventory.map((item, index) => (
                <button
                    key={index}
                    className={"cell"}
                    draggable={!!item}
                    onDragStart={(e) => handleDragStart(e, item, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleItemClick(item, index)}
                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        borderColor: item ? getRarityColor(item.rarity) : 'black',
                        borderWidth: "2px",
                        cursor: item ? 'pointer' : 'default',
                        padding: 0,
                    }}
                >
                    <Icon
                        icon={item?.icon}
                        count={item?.amount}
                        borderColor={item ? getRarityColor(item.rarity) : undefined}
                        // displayText={String(index)}
                    />
                </button>
            ))}
            {showDropConfirm && <ModalWindow buttons={[{ name: "да", onClick: confirmDrop }, {name: "нет", onClick: cancelDrop }]}>
                {`Вы точно хотите выбросить ${showDropConfirm.item.name}?`}
            </ModalWindow>}
            <div className={"currency-div"}>
                <p>{player?.gold}</p>
                <Coins size={20} color={"yellow"} />
                <p>{24}</p>
                <Coins size={20} color={"silver"} />
                <p>{58}</p>
                <Coins size={20} color={"#D17019FF"} />
            </div>
        </div>
    );
};

export default InventoryWindow;