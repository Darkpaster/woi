import {ItemType} from "../GameUI.tsx";
import React, {
    useEffect,
    useRef
} from "react";
import {Item} from "../../core/logic/items/item.ts";
import {Actor} from "../../core/logic/actors/actor.ts";
import {Skill} from "../../core/logic/skills/skill.ts";

// export const InfoWindow: ForwardRefExoticComponent<InfoWindowProps> = forwardRef<HTMLDivElement, InfoWindowProps>(
//     function InfoWindow({entity, position}: InfoWindowProps, ref: ForwardedRef<HTMLDivElement>) {

//interface InfoWindowProps extends React.RefAttributes<HTMLDivElement>{

interface InfoWindowProps {
    entity: ItemType<Item | Actor | Skill>;
    position: { left: number; top: number };
}

export const InfoWindow: React.FC<InfoWindowProps> = ({entity, position}: InfoWindowProps) => {
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const window = divRef.current as HTMLDivElement;

        window.style.left = `${position.left - window.offsetWidth}px`;
        window.style.top = `${position.top - window.offsetHeight}px`;

    }, [position.left, position.top]);

    return (
        <div ref={divRef} className={`ui-div info-div`}>
            <big style={
                entity instanceof Skill ? {color: "gold"} : {color: entity!.rarity}}>{entity!.name}</big>
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