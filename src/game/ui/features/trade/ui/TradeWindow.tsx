import React, { useState, useEffect } from 'react';
import Icon from "../../../shared/ui/Icon.tsx";
import { useMyDispatch } from "../../../../../utils/stateManagement/store.ts";
import { player } from "../../../../core/main.ts";
import Item from "../../../../core/logic/items/item.ts";
import { setInfoEntity, setInfoPosition } from "../../../../../utils/stateManagement/uiSlice.ts";
import { RarityTypes } from "../../../../core/types.ts";
import ModalWindow from "../../../shared/ui/ModalWindow.tsx";

import "../styles/tradeWindow.scss"

// Интерфейс для торгового предмета
interface TradeItem extends Item {
    price: number;
    stock: number; // количество в наличии у торговца (-1 для бесконечного)
}

// Получение цвета редкости (та же функция что и в инвентаре)
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

// Мок-данные торговца
const mockTradeItems: TradeItem[] = [
    {
        id: "potion_health_small",
        name: "Малое зелье здоровья",
        description: "Восстанавливает 50 очков здоровья",
        icon: "src/assets/icons/potion_red.png",
        rarity: "common" as RarityTypes,
        price: 25,
        stock: 10,
        stackable: true,
        maxStackSize: 5,
        amount: 1,
        ids: ["hp_pot_1"],
        note: "Базовое лечебное зелье",
        onUse: () => console.log("Использовано малое зелье здоровья")
    },
    {
        id: "sword_iron",
        name: "Железный меч",
        description: "Надежный железный меч. Урон: 15-25",
        icon: "src/assets/icons/sword_iron.png",
        rarity: "uncommon" as RarityTypes,
        price: 150,
        stock: 3,
        stackable: false,
        maxStackSize: 1,
        amount: 1,
        ids: ["sword_1"],
        note: "Хорошее оружие для начинающих воинов",
        onUse: () => console.log("Экипирован железный меч")
    },
    {
        id: "scroll_fireball",
        name: "Свиток огненного шара",
        description: "Одноразовый свиток с заклинанием огненного шара",
        icon: "src/assets/icons/scroll_fire.png",
        rarity: "rare" as RarityTypes,
        price: 75,
        stock: 5,
        stackable: true,
        maxStackSize: 3,
        amount: 1,
        ids: ["scroll_fb_1"],
        note: "Мощное заклинание 3 круга",
        onUse: () => console.log("Использован свиток огненного шара")
    },
    {
        id: "armor_leather",
        name: "Кожаная броня",
        description: "Легкая кожаная броня. Защита: 8-12",
        icon: "src/assets/icons/armor_leather.png",
        rarity: "common" as RarityTypes,
        price: 120,
        stock: 2,
        stackable: false,
        maxStackSize: 1,
        amount: 1,
        ids: ["armor_1"],
        onUse: () => console.log("Экипирована кожаная броня")
    },
    {
        id: "gem_ruby",
        name: "Рубин",
        description: "Драгоценный рубин, сияющий внутренним огнем",
        icon: "src/assets/icons/gem_ruby.png",
        rarity: "epic" as RarityTypes,
        price: 500,
        stock: 1,
        stackable: true,
        maxStackSize: 10,
        amount: 1,
        ids: ["ruby_1"],
        note: "Можно использовать для создания магических предметов",
        onUse: () => console.log("Рубин сияет в руках")
    }
];

interface TradeWindowProps {
    traderName?: string;
    onClose?: () => void;
}

const TradeWindow: React.FC<TradeWindowProps> = ({
                                                     traderName = "Торговец Альберт",
                                                     onClose
                                                 }) => {
    const [tradeItems, setTradeItems] = useState<TradeItem[]>(mockTradeItems);
    const [playerGold, setPlayerGold] = useState<number>(500); // Мок-деньги игрока
    const [selectedAction, setSelectedAction] = useState<{
        type: 'buy' | 'sell';
        item: TradeItem | Item;
        index: number;
    } | null>(null);
    const [playerInventory, setPlayerInventory] = useState<(Item | undefined)[]>(player?.inventory || []);

    const dispatch = useMyDispatch();

    // Обновление инвентаря игрока
    useEffect(() => {
        const interval = setInterval(() => {
            if (player?.inventory) {
                setPlayerInventory([...player.inventory]);
            }
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Обработка клика по предмету торговца (покупка)
    const handleTradeItemClick = (item: TradeItem, index: number, isRightClick: boolean = false) => {
        if (isRightClick) {
            // ПКМ - показать подробную информацию (уже реализовано через onMouseEnter)
            return;
        }

        // ЛКМ - покупка
        if (item.stock === 0) {
            console.log(`${item.name} закончился у торговца`);
            return;
        }

        if (playerGold < item.price) {
            console.log("Недостаточно золота для покупки");
            return;
        }

        setSelectedAction({
            type: 'buy',
            item: item,
            index: index
        });
    };

    // Обработка клика по предмету игрока (продажа)
    const handlePlayerItemClick = (item: Item | undefined, index: number, isRightClick: boolean = false) => {
        if (!item || isRightClick) return;

        // ЛКМ - продажа
        const sellPrice = Math.floor((item as any).price * 0.6) || 10; // 60% от цены покупки или минимум 10 золота

        setSelectedAction({
            type: 'sell',
            item: { ...item, price: sellPrice } as TradeItem,
            index: index
        });
    };

    // Подтверждение покупки
    const confirmBuy = () => {
        if (!selectedAction || selectedAction.type !== 'buy') return;

        const item = selectedAction.item as TradeItem;
        const index = selectedAction.index;

        // Списываем золото
        setPlayerGold(prev => prev - item.price);

        // Уменьшаем запас у торговца
        const newTradeItems = [...tradeItems];
        if (newTradeItems[index].stock > 0) {
            newTradeItems[index].stock -= 1;
        }
        setTradeItems(newTradeItems);

        // Добавляем предмет в инвентарь игрока (упрощенная логика)
        const emptySlot = playerInventory.findIndex(slot => slot === undefined);
        if (emptySlot !== -1 && player?.inventory) {
            const newItem = { ...item };
            delete (newItem as any).price;
            delete (newItem as any).stock;
            player.inventory[emptySlot] = newItem as Item;
        }

        console.log(`Куплен ${item.name} за ${item.price} золота`);
        setSelectedAction(null);
    };

    // Подтверждение продажи
    const confirmSell = () => {
        if (!selectedAction || selectedAction.type !== 'sell') return;

        const item = selectedAction.item as TradeItem;
        const index = selectedAction.index;

        // Получаем золото
        setPlayerGold(prev => prev + item.price);

        // Убираем предмет из инвентаря игрока
        if (player?.inventory) {
            if (item.stackable && item.amount > 1) {
                const currentItem = player.inventory[index];
                if (currentItem && currentItem.amount > 1) {
                    const newIds = [...currentItem.ids];
                    newIds.pop();
                    currentItem.amount = newIds;
                } else {
                    player.inventory[index] = undefined;
                }
            } else {
                player.inventory[index] = undefined;
            }
        }

        console.log(`Продан ${item.name} за ${item.price} золота`);
        setSelectedAction(null);
    };

    const cancelAction = () => {
        setSelectedAction(null);
    };

    // Обработчики для отображения информации о предмете
    const handleMouseEnter = (e: React.MouseEvent, item: TradeItem | Item | undefined, isTradeItem: boolean = false) => {
        if (item) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            dispatch(setInfoPosition({ left: rect.x, top: rect.y }));

            const info: any = {
                name: item.name,
                description: item.description,
                note: item.note,
                rarity: item.rarity,
                icon: item.icon,
                count: item.amount
            };

            if (isTradeItem) {
                const tradeItem = item as TradeItem;
                info.price = tradeItem.price;
                info.stock = tradeItem.stock;
            }

            dispatch(setInfoEntity(info));
        }
    };

    const handleMouseLeave = () => {
        dispatch(setInfoEntity(null));
        dispatch(setInfoPosition(null));
    };

    return (
        <div className="trade-window">
            {/* Заголовок */}
            <div className="trade-header">
                <h3 className="trader-name">{traderName}</h3>
                <div className="player-gold">
                    <span className="gold-icon">💰</span>
                    <span className="gold-amount">{playerGold}</span>
                </div>
                {onClose && (
                    <button className="close-button" onClick={onClose}>×</button>
                )}
            </div>

            <div className="trade-content">
                {/* Секция торговца */}
                <div className="trade-section">
                    <h4 className="section-title">Товары торговца</h4>
                    <div className="trade-items-grid ui-div cell-type">
                        {tradeItems.map((item, index) => (
                            <button
                                key={`trade-${index}`}
                                className="ui-div cell trade-item"
                                onClick={() => handleTradeItemClick(item, index)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    handleTradeItemClick(item, index, true);
                                }}
                                onMouseEnter={(e) => handleMouseEnter(e, item, true)}
                                onMouseLeave={handleMouseLeave}
                                style={{
                                    borderColor: getRarityColor(item.rarity),
                                    borderWidth: "2px",
                                    cursor: item.stock > 0 && playerGold >= item.price ? 'pointer' : 'not-allowed',
                                    opacity: item.stock === 0 ? 0.5 : 1,
                                    padding: 0,
                                }}
                                disabled={item.stock === 0 || playerGold < item.price}
                            >
                                <Icon
                                    icon={item.icon}
                                    count={item.amount}
                                    borderColor={getRarityColor(item.rarity)}
                                />
                                <div className="item-price">
                                    <span className="price-text">{item.price}g</span>
                                </div>
                                {item.stock !== -1 && (
                                    <div className="item-stock">
                                        <span className="stock-text">×{item.stock}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Секция игрока */}
                <div className="trade-section">
                    <h4 className="section-title">Ваш инвентарь</h4>
                    <div className="player-items-grid ui-div cell-type">
                        {playerInventory.map((item, index) => (
                            <button
                                key={`player-${index}`}
                                className="ui-div cell"
                                onClick={() => handlePlayerItemClick(item, index)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    handlePlayerItemClick(item, index, true);
                                }}
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
                                {item && (
                                    <div className="sell-price">
                    <span className="sell-price-text">
                      {Math.floor(((item as any).price * 0.6) || 10)}g
                    </span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Модальное окно подтверждения */}
            {selectedAction && (
                <ModalWindow
                    buttons={[
                        {
                            name: "да",
                            onClick: selectedAction.type === 'buy' ? confirmBuy : confirmSell
                        },
                        {
                            name: "нет",
                            onClick: cancelAction
                        }
                    ]}
                >
                    {selectedAction.type === 'buy'
                        ? `Купить ${selectedAction.item.name} за ${(selectedAction.item as TradeItem).price} золота?`
                        : `Продать ${selectedAction.item.name} за ${(selectedAction.item as TradeItem).price} золота?`
                    }
                </ModalWindow>
            )}
        </div>
    );
};

export default TradeWindow;