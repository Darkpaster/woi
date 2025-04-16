import React, {useEffect, useState} from "react";
import Item from "../../../../core/logic/items/item.ts";
import {player} from "../../../../core/main.ts";
import {setInfoEntity, setInfoPosition} from "../../../../utils/stateManagement/uiSlice.ts";
import {useMyDispatch} from "../../../../utils/stateManagement/store.ts";

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

const InventoryWindow = () => {
    const [inventory, setInventory] = useState(player!.inventory);

    const dispatch = useMyDispatch();

    useEffect(() => {
        const interval = setInterval(() => {
            setInventory([...player!.inventory]);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inventory-div ui-div cell-type">
            {inventory.map((item : Item, index) => (
                <button
                    key={index}
                    className={"ui-div cell"}
                    onClick={() => {
                        if (item) {
                            item.onUse();
                            player!.inventory[index] = null;
                            // document.getElementById("canvas").focus();
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (item) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            dispatch(setInfoPosition({left: rect.x, top: rect.y}));
                            dispatch(setInfoEntity( {name: item.name, description: item.description, note: item.note, rarity: item.rarity, icon: item.icon} ));
                        }
                    }}
                    onMouseLeave={() => {
                        dispatch(setInfoEntity(null));
                        dispatch(setInfoPosition(null));
                    }}
                    style={{
                        backgroundImage: item ? `url(${item.icon})` : "",
                        borderColor: item ? getRarityColor(item.rarity) : 'black',
                        cursor: item ? 'pointer' : 'default',
                    }}
                >
                    {index}
                </button>
            ))}
        </div>
    );
};

export default InventoryWindow;