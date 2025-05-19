import React, {
    useEffect,
    useRef
} from "react";
import {Skill} from "../../../core/logic/skills/skill.ts";
import {EntityType} from "../../game/GameUI.tsx";

interface InfoWindowProps {
    entity: EntityType;
    position: { left: number; top: number };
}

const InfoWindow: React.FC<InfoWindowProps> = ({entity, position}: InfoWindowProps) => {
    const divRef = useRef<HTMLDivElement>(null);

    const getColor = (rarity: string) => {
        switch (rarity) {
            case "common": return "grey"
            case "uncommon": return "green"
            case "rare": return "blue"
            case "elite": return "blueviolet"
            case "legendary": return "orange"
            case "godlike": return "red"
        }
    }

    useEffect(() => {
        const window = divRef.current as HTMLDivElement;

        window.style.left = `${position.left - window.offsetWidth}px`;
        window.style.top = `${position.top - window.offsetHeight}px`;

    }, [position.left, position.top]);

    return (
        <div ref={divRef} className={`ui-div info-div`}>
            <big style={
                entity instanceof Skill ? {color: "gold"} : {color: getColor(entity!.rarity), borderColor: getColor(entity!.rarity)}}>{entity!.name}</big>
            <br/>
            <br/>
            {entity!.description}
            {entity instanceof Skill && (
                <>
                    <br/>
                    <br/>
                    {`Cooldown: ${entity.cooldown / 1000}`}
                </>
            )}
            {entity!.note && (
                <>
                    <br/>
                    <br/>
                    {entity!.note}
                </>
            )}
        </div>
    );
}

export default InfoWindow;