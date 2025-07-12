import React, { useState } from 'react';
import InfoWindow from "../../../../widgets/infoWindow/InfoWindow.tsx";
import "../styles/lootWindow.scss"
import {player} from "../../../../../core/main.ts";
import Item from "../../../../../core/logic/items/item.ts";
import {SmallPotionOfHealing} from "../../../../../core/logic/items/consumable/potions/smallPotionOfHealing.ts";
import {randomInt} from "../../../../../../utils/math/random.ts";
import {setInfoEntity, setInfoPosition} from "../../../../../../utils/stateManagement/uiSlice.ts";
import {useMyDispatch} from "../../../../../../utils/stateManagement/store.ts";


// const InfoWindow = ({ entity, position }) => {
//     if (!entity || !position) return null;
//
//     return (
//         <div
//             className="info-window"
//             style={{
//                 left: `${position.left - 200}px`,
//                 top: `${position.top}px`,
//             }}
//         >
//             <div className={`info-window__title info-window__title--${entity.rarity}`}>
//                 {entity.name}
//             </div>
//             <div className="info-window__description">
//                 {entity.description}
//             </div>
//             {entity.note && (
//                 <div className="info-window__note">
//                     {entity.note}
//                 </div>
//             )}
//             {entity.amount > 1 && (
//                 <div className="info-window__amount">
//                     Amount: {entity.amount}
//                 </div>
//             )}
//         </div>
//     );
// };

const LootWindow = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mousePosition, setMousePosition] = useState({ left: 0, top: 0 });

    const dispatch = useMyDispatch();

    const lootItems = [
        { name: "24 Silver", amount: 24, rarity: "common", icon: "🪙", description: "Shiny silver coins that jingle pleasantly in your pouch.", note: "Standard currency used by merchants across the realm." },
        { name: "12 Copper", amount: 12, rarity: "common", icon: "🟤", description: "Basic copper coins, worn from countless transactions.", note: "The most common form of currency." },
        { name: "Netherweave Cloth", amount: 2, rarity: "uncommon", icon: "🧵", description: "Dark magical cloth woven from shadow essence. Useful for crafting enchanted garments.", note: "Required for advanced tailoring recipes." },
        { name: "Greaves of Desolation", amount: 1, rarity: "rare", icon: "🦵", description: "Heavy leg armor imbued with dark magic. Provides excellent protection at the cost of mobility.", note: "+15 Defense, -5 Speed" },
        { name: "Crow Wing Reaper", amount: 1, rarity: "rare", icon: "🗡️", description: "A deadly scythe forged from the wings of ancient crows. Its blade whispers with the voices of the fallen.", note: "+25 Attack, Chance to inflict Fear" },
        { name: "Spaulders of Dementia", amount: 1, rarity: "elite", icon: "🛡️", description: "Cursed shoulder armor that constantly whispers maddening secrets to its wearer.", note: "+20 Defense, -10 Sanity, Immunity to Charm" },
        { name: "Primal Nether", amount: 1, rarity: "legendary", icon: "🔮", description: "Pure essence of elemental energy contained within a crystalline sphere. Radiates immense power.", note: "Required for legendary enchantments" },
        { name: "Timeless Tanzanite", amount: 1, rarity: "godlike", icon: "💎", description: "A perfect gem that exists outside the flow of time itself. Its facets reflect moments that never were and always will be.", note: "Artifact-level crafting material" }
    ];

    const handleMouseEnter = (e: React.MouseEvent, item: Item | undefined) => {
        if (item) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            (setInfoPosition({left: rect.x, top: rect.y}));
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

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleItemClick = (item: any) => {
        player?.pickUp(new SmallPotionOfHealing(new Array(randomInt(10)).fill(randomInt(10000))));
        console.log(`Clicked on ${item.name}`);
    };

    const handleTakeAll = () => {
        console.log('Taking all items');
        setIsVisible(false);
    };

    // const handleMouseEnter = (e, item) => {
    //     const rect = e.currentTarget.getBoundingClientRect();
    //     setMousePosition({ left: rect.x, top: rect.y });
    //     setHoveredItem(item);
    // };

    // const handleMouseLeave = () => {
    //     setHoveredItem(null);
    // };

    if (!isVisible) return null;

    return (
        <div className="loot-window-overlay">
            <div className="loot-window">
                {/* Header */}
                <div className="loot-header">
                    <div className="loot-header__left">
                        <div className="loot-header__icon">
                            💀
                        </div>
                        <span className="loot-header__title">
              Items
            </span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="loot-header__close-button"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="loot-content">
                    {lootItems.map((item, index) => (
                        <div
                            key={index}
                            className="loot-item"
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={(e) => handleMouseEnter(e, item)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Icon */}
                            <div className={`loot-item__icon loot-item__icon--${item.rarity}`}>
                                {item.icon}
                            </div>

                            {/* Item Info */}
                            <div className="loot-item__info">
                                <div className={`loot-item__name loot-item__name--${item.rarity}`}>
                                    {item.amount > 1 ? `${item.amount} ` : ''}{item.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="loot-footer">
                    <div className="loot-footer__hint">
                        Click items to loot
                    </div>
                    <button
                        onClick={handleTakeAll}
                        className="loot-footer__take-all-button"
                    >
                        Take All
                    </button>
                </div>
            </div>

            {/* Info Window */}
            {/*<InfoWindow*/}
            {/*    entity={hoveredItem}*/}
            {/*    position={mousePosition}*/}
            {/*/>*/}
        </div>
    );
};

export default LootWindow;