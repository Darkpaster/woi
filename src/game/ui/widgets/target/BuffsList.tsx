import React, { useState } from "react";
import InfoWindow from "../info-window/InfoWindow";

export interface Buff {
    id: string;
    name: string;
    description: string;
    icon: string;
    duration: number; // в секундах
    maxDuration: number;
    type: 'buff' | 'debuff';
    rarity?: string;
    note?: string;
}

interface BuffsListProps {
    buffs: Buff[];
    className?: string;
}

const BuffsList: React.FC<BuffsListProps> = ({ buffs, className = "" }) => {
    const [hoveredBuff, setHoveredBuff] = useState<Buff | null>(null);
    const [mousePosition, setMousePosition] = useState({ left: 0, top: 0 });

    const handleMouseEnter = (buff: Buff, event: React.MouseEvent) => {
        setHoveredBuff(buff);
        setMousePosition({
            left: event.clientX,
            top: event.clientY
        });
    };

    const handleMouseLeave = () => {
        setHoveredBuff(null);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (hoveredBuff) {
            setMousePosition({
                left: event.clientX,
                top: event.clientY
            });
        }
    };

    if (!buffs || buffs.length === 0) {
        return null;
    }

    return (
        <>
            <div className={`buffs-list ${className}`}>
                {buffs.map((buff) => (
                    <div
                        key={buff.id}
                        className={`buff-icon ${buff.type}`}
                        onMouseEnter={(e) => handleMouseEnter(buff, e)}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                    >
                        <img src={buff.icon} alt={buff.name} />
                        <div className="buff-duration">
                            <div
                                className="buff-duration-fill"
                                style={{
                                    width: `${(buff.duration / buff.maxDuration) * 100}%`
                                }}
                            />
                        </div>
                        <div className="buff-timer">
                            {Math.ceil(buff.duration)}
                        </div>
                    </div>
                ))}
            </div>

            {hoveredBuff && (
                <InfoWindow
                    entity={hoveredBuff}
                    position={mousePosition}
                />
            )}
        </>
    );
};

export default BuffsList;