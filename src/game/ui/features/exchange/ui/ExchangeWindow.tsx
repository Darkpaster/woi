import Icon from "../../../shared/ui/Icon.tsx";
import {useEffect, useState} from "react";
import {useMyDispatch} from "../../../../../utils/stateManagement/store.ts";
import {player} from "../../../../core/main.ts";
import Item from "../../../../core/logic/items/item.ts";
import {setInfoEntity, setInfoPosition} from "../../../../../utils/stateManagement/uiSlice.ts";
import "../styles/exchangeWindow.scss"
import {getRarityColor} from "../../inventory/ui/InventoryWindow.tsx";

interface TradeWindowProps {
    onTradeComplete?: () => void;
    targetPlayerName?: string;
    targetPlayerAvatar?: string;
}

const ExchangeWindow: React.FC<TradeWindowProps> = ({
                                                    onTradeComplete,
                                                     targetPlayerName = "Bretlik",
                                                     targetPlayerAvatar
                                                 }) => {
    const [myTradeItems, setMyTradeItems] = useState<(Item | undefined)[]>(new Array(12).fill(undefined));
    const [theirTradeItems, setTheirTradeItems] = useState<(Item | undefined)[]>(new Array(12).fill(undefined));
    const [myReadyStatus, setMyReadyStatus] = useState(false);
    const [theirReadyStatus, setTheirReadyStatus] = useState(false);
    const [draggedItem, setDraggedItem] = useState<{ item: Item | null, index: number, source: 'inventory' | 'trade' } | null>(null);

    const dispatch = useMyDispatch();


    const handleDragStart = (e: React.DragEvent, item: Item | undefined, index: number, source: 'inventory' | 'trade') => {
        if (!item) return;

        e.dataTransfer.setData("text/plain", index.toString());
        setDraggedItem({ item, index, source });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropToTrade = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (!draggedItem) return;

        // Only allow dropping from inventory to trade slots
        if (draggedItem.source === 'inventory') {
            const item = player!.inventory[draggedItem.index];
            if (item && !myTradeItems[targetIndex]) {
                // Move item from inventory to trade
                const newTradeItems = [...myTradeItems];
                newTradeItems[targetIndex] = item;
                setMyTradeItems(newTradeItems);

                // Remove from inventory
                player!.inventory[draggedItem.index] = undefined;
            }
        } else if (draggedItem.source === 'trade') {
            // Move within trade slots
            const newTradeItems = [...myTradeItems];
            const draggedTradeItem = newTradeItems[draggedItem.index];
            newTradeItems[draggedItem.index] = newTradeItems[targetIndex];
            newTradeItems[targetIndex] = draggedTradeItem;
            setMyTradeItems(newTradeItems);
        }

        setDraggedItem(null);
    };

    const handleDropToInventory = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (!draggedItem) return;

        // Only allow dropping from trade to inventory
        if (draggedItem.source === 'trade') {
            const item = myTradeItems[draggedItem.index];
            if (item && !player!.inventory[targetIndex]) {
                // Move item from trade to inventory
                player!.inventory[targetIndex] = item;

                // Remove from trade
                const newTradeItems = [...myTradeItems];
                newTradeItems[draggedItem.index] = undefined;
                setMyTradeItems(newTradeItems);
            }
        }

        setDraggedItem(null);
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

    const handleMouseLeave = () => {
        dispatch(setInfoEntity(null));
        dispatch(setInfoPosition(null));
    };

    const handleTrade = () => {
        // Implement trade logic
        console.log("Trade executed");
        if (onTradeComplete) {
            onTradeComplete();
        }
    };

    const handleCancel = () => {
        // Return items to inventory
        myTradeItems.forEach((item, index) => {
            if (item) {
                const emptySlot = player!.inventory.findIndex(slot => !slot);
                if (emptySlot !== -1) {
                    player!.inventory[emptySlot] = item;
                }
            }
        });

        setMyTradeItems(new Array(12).fill(undefined));
        if (onTradeComplete) {
            onTradeComplete();
        }
    };

    const toggleReady = () => {
        setMyReadyStatus(!myReadyStatus);
    };

    return (
        <div className="trade-overlay">
            <div className="trade-window ui-div">
                <div className="trade-header">
                    <div className="player-info">
                        <div className="player-avatar">
                            <img src={player?.icon || "src/assets/avatars/default.png"} alt="Player" />
                        </div>
                        <span className="player-name">{player?.name || "Aron"}</span>
                    </div>

                    <div className="player-info">
                        <div className="player-avatar">
                            <img src={targetPlayerAvatar || "src/assets/avatars/default2.png"} alt="Target" />
                        </div>
                        <span className="player-name">{targetPlayerName}</span>
                    </div>

                    <button className="close-button" onClick={onTradeComplete}>×</button>
                </div>

                <div className="trade-content">
                    <div className="trade-section">
                        <div className="trade-status-indicators">
                            <div className={`status-dot ${myReadyStatus ? 'ready' : ''}`}></div>
                            <div className="status-dot"></div>
                            <div className="status-dot"></div>
                            <div className="status-dot"></div>
                        </div>

                        <div className="trade-grid">
                            {myTradeItems.map((item, index) => (
                                <button
                                    key={index}
                                    className="ui-div cell trade-cell"
                                    draggable={!!item}
                                    onDragStart={(e) => handleDragStart(e, item, index, 'trade')}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDropToTrade(e, index)}
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
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="trade-lock-area">
                            <span className="lock-text">Will not be traded</span>
                            <div className="lock-slot ui-div cell">
                                <Icon icon="src/assets/icons/lock.png" />
                            </div>
                        </div>
                    </div>

                    <div className="trade-section">
                        <div className="trade-status-indicators">
                            <div className={`status-dot ${theirReadyStatus ? 'ready' : ''}`}></div>
                            <div className="status-dot"></div>
                            <div className="status-dot"></div>
                            <div className="status-dot"></div>
                        </div>

                        <div className="trade-grid">
                            {theirTradeItems.map((item, index) => (
                                <button
                                    key={index}
                                    className="ui-div cell trade-cell"
                                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                                    onMouseLeave={handleMouseLeave}
                                    style={{
                                        borderColor: item ? getRarityColor(item.rarity) : 'black',
                                        borderWidth: "2px",
                                        cursor: 'default',
                                        padding: 0,
                                    }}
                                >
                                    <Icon
                                        icon={item?.icon}
                                        count={item?.amount}
                                        borderColor={item ? getRarityColor(item.rarity) : undefined}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="trade-lock-area">
                            <span className="lock-text">Will not be traded</span>
                            <div className="lock-slot ui-div cell">
                                <Icon icon="src/assets/icons/lock.png" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="trade-actions">
                    <button
                        className="trade-button ready-button"
                        onClick={toggleReady}
                        style={{ backgroundColor: myReadyStatus ? '#16a34a' : '#6b7280' }}
                    >
                        {myReadyStatus ? 'Ready' : 'Not Ready'}
                    </button>
                    <button className="trade-button trade-action" onClick={handleTrade}>
                        Trade
                    </button>
                    <button className="trade-button cancel-action" onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExchangeWindow;