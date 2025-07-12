import React, { useState, useEffect } from 'react';
import { X, Coins } from 'lucide-react';
import '../styles/tradeWindow.scss';
import {getRarityColor} from "../../inventory/ui/InventoryWindow.tsx";

// Mock data - replace with your actual imports
const mockTradeItems = [
    {
        id: "mining_pick",
        name: "Mining Pick",
        description: "A sturdy mining pick for extracting ore",
        icon: "⛏️",
        rarity: "common",
        price: 99,
        stock: -1, // unlimited
        stackable: false,
        maxStackSize: 1,
        amount: 1,
        ids: ["pick_1"]
    },
    {
        id: "mining_sack",
        name: "Mining Sack",
        description: "A large sack for carrying mining materials",
        icon: "🎒",
        rarity: "common",
        price: 8,
        stock: -1,
        stackable: true,
        maxStackSize: 5,
        amount: 1,
        ids: ["sack_1"]
    },
    {
        id: "weak_flux",
        name: "Weak Flux",
        description: "Basic flux material for smithing",
        icon: "⚗️",
        rarity: "common",
        price: 80,
        stock: 5,
        stackable: true,
        maxStackSize: 10,
        amount: 1,
        ids: ["flux_1"]
    },
    {
        id: "strong_flux",
        name: "Strong Flux",
        description: "Advanced flux material for advanced smithing",
        icon: "🧪",
        rarity: "uncommon",
        price: 16,
        stock: 3,
        stackable: true,
        maxStackSize: 10,
        amount: 1,
        ids: ["flux_2"]
    },
    {
        id: "coal",
        name: "Coal",
        description: "Basic fuel for smelting",
        icon: "🪨",
        rarity: "common",
        price: 4,
        stock: 20,
        stackable: true,
        maxStackSize: 20,
        amount: 1,
        ids: ["coal_1"]
    },
    {
        id: "jewelers_toolset",
        name: "Jeweler's Toolset",
        description: "Professional tools for jewelry crafting",
        icon: "🔧",
        rarity: "rare",
        price: 640,
        stock: 1,
        stackable: false,
        maxStackSize: 1,
        amount: 1,
        ids: ["jewel_tools_1"]
    }
];

const mockPlayerInventory = [
    {
        id: "sword_iron",
        name: "Iron Sword",
        description: "A reliable iron sword",
        icon: "⚔️",
        rarity: "common",
        originalPrice: 150,
        stackable: false,
        amount: 1
    },
    {
        id: "potion_health",
        name: "Health Potion",
        description: "Restores health",
        icon: "🧪",
        rarity: "common",
        originalPrice: 25,
        stackable: true,
        amount: 3
    },
    undefined,
    undefined,
    {
        id: "gem_ruby",
        name: "Ruby",
        description: "A precious ruby",
        icon: "💎",
        rarity: "epic",
        originalPrice: 500,
        stackable: true,
        amount: 1
    }
];

const TradeWindow = ({ traderName = "Lutah", onClose }) => {
    const [tradeItems, setTradeItems] = useState(mockTradeItems);
    const [playerInventory, setPlayerInventory] = useState(mockPlayerInventory);
    const [playerGold, setPlayerGold] = useState(1209062);
    const [silverCoins, setSilverCoins] = useState(98);
    const [copperCoins, setCopperCoins] = useState(68);

    const [hoveredInventoryItem, setHoveredInventoryItem] = useState(null);

    const handleBuyItem = (item, index) => {
        if (item.stock === 0 || playerGold < item.price) return;

        // Deduct gold
        setPlayerGold(prev => prev - item.price);

        // Update stock
        if (item.stock > 0) {
            const newItems = [...tradeItems];
            newItems[index].stock -= 1;
            setTradeItems(newItems);
        }

        // Add to player inventory (simplified)
        const emptySlot = playerInventory.findIndex(slot => slot === undefined);
        if (emptySlot !== -1) {
            const newInventory = [...playerInventory];
            newInventory[emptySlot] = {
                ...item,
                originalPrice: item.price
            };
            setPlayerInventory(newInventory);
        }

        console.log(`Bought ${item.name} for ${item.price} gold`);
    };

    const getSellPrice = (item) => {
        return Math.floor((item.originalPrice || 10) * 0.6);
    };

    const handleSellItem = (item, index) => {
        if (!item) return;

        const sellPrice = getSellPrice(item);
        setPlayerGold(prev => prev + sellPrice);

        // Remove from inventory
        const newInventory = [...playerInventory];
        if (item.stackable && item.amount > 1) {
            newInventory[index].amount -= 1;
        } else {
            newInventory[index] = undefined;
        }
        setPlayerInventory(newInventory);

        console.log(`Sold ${item.name} for ${sellPrice} gold`);
    };

    return (
        <div className="trade-window">
            {/* Header */}
            <div className="trade-header">
                <div className="trader-info">
                    <div className="trader-avatar">
                        🧙‍♂️
                    </div>
                    <span className="trader-name">
                        {traderName}
                    </span>
                </div>
                {onClose && (
                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="trade-content">
                <div className="merchant-items">
                    {tradeItems.map((item, index) => (
                        <button
                            key={index}
                            className={`trade-item ${item.stock === 0 || playerGold < item.price ? 'disabled' : ''}`}
                            onClick={() => handleBuyItem(item, index)}
                            disabled={item.stock === 0 || playerGold < item.price}
                            style={{ borderColor: getRarityColor(item.rarity) }}
                        >
                            <div className="item-icon">{item.icon}</div>
                            {item.amount > 1 && (
                                <span className="item-amount">{item.amount}</span>
                            )}
                            <div className="item-price">
                                {item.price}
                                <Coins size={8} color="#ffd700" />
                            </div>
                            {item.stock > 0 && (
                                <span className="item-stock">{item.stock}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="player-inventory">
                    <div className="inventory-grid">
                        {playerInventory.map((item, index) => (
                            <button
                                key={index}
                                className={`inventory-item ${!item ? 'empty' : ''}`}
                                onClick={() => handleSellItem(item, index)}
                                onMouseEnter={() => setHoveredInventoryItem(item)}
                                onMouseLeave={() => setHoveredInventoryItem(null)}
                                disabled={!item}
                                style={{ borderColor: item ? getRarityColor(item.rarity) : '#333' }}
                            >
                                <div className="item-icon">{item?.icon}</div>
                                {item && item.amount > 1 && (
                                    <span className="item-amount">{item.amount}</span>
                                )}
                                {item && hoveredInventoryItem === item && (
                                    <div className="sell-price">
                                        {getSellPrice(item)}
                                        <Coins size={6} color="#90EE90" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="currency-display">
                <div className="currency-item gold">
                    <span className="currency-amount">{playerGold.toLocaleString()}</span>
                    <Coins size={16} color="#ffd700" />
                </div>
                <div className="currency-item silver">
                    <span className="currency-amount">{silverCoins}</span>
                    <Coins size={16} color="#c0c0c0" />
                </div>
                <div className="currency-item copper">
                    <span className="currency-amount">{copperCoins}</span>
                    <Coins size={16} color="#cd7f32" />
                </div>
            </div>
        </div>
    );
};

export default TradeWindow;