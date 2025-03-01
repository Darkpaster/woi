// Компонент панели навыков
import Button from "./Button.tsx";
import React, {RefObject, useEffect, useRef, useState} from "react";
import {Item} from "../../core/logic/items/item.ts";
import {Skill} from "../../core/logic/skills/skill.ts";
import {Actor} from "../../core/logic/actors/actor.ts";
import {player} from "../../core/main.ts";
import {actions} from "../input/input.ts";
import {setInfoEntity, setInfoPosition} from "../../utils/stateManagement/uiSlice.ts";
import {useMyDispatch, useMySelector} from "../../utils/stateManagement/store.ts";
import {WritableDraft} from "immer";


// interface PanelProps {
//     onShowInfo: <T extends Item|Skill|Actor>(skill: T, rect: DOMRect) => void;
//     onHideInfo: () => void;
// }

export const Panel = () => {
    const [spellBook, setSpellBook] = useState(player!.spellBook);

    const dispatch = useMyDispatch();
    // const infoPosition = useMySelector((state: { ui: { infoPosition: never; }; }) => state.ui.infoPosition);

    const panelRef: RefObject<HTMLDivElement|null> = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setSpellBook([...player!.spellBook]);
        }, 100);

        // привязывание логики нажатия на кнопки на панели
        const panel = panelRef.current;
        const buttons: HTMLCollection = panel!.children;
        for (let i: number = 0; i < buttons.length; i++) {
            const action = actions[`b${i+1}`];
            if (action) {
                actions[`b${i+1}`] = () => {
                    (buttons.item(i) as HTMLElement).click();
                }
                console.log(`Successful: ${actions["b"+(i+1)]}`);
            } else {
                console.warn(`No such action: b${i+1}`);
            }
        }

        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={panelRef} className="ui-div panel-div cell-type">
            {spellBook.map((skill, index) => {
                let displayText = String(index + 1);
                let fontSize = '15px';
                if (skill) {
                    const left = skill.process.cooldown!.getLeftTime();
                    if (left > 0) {
                        displayText = (left / 1000).toFixed(1);
                        fontSize = '20px';
                    }
                }
                return (
                    <Button
                        key={index}
                        styleType="ui-div cell"
                        onMouseEnter={(e) => {
                            if (skill) {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                dispatch(setInfoPosition({left: rect.x, top: rect.y}));
                                dispatch(setInfoEntity(skill));
                            }
                        }}
                        onMouseLeave={() => {
                            dispatch(setInfoEntity(null));
                            dispatch(setInfoPosition(null));
                        }}
                        onClick={() => {
                            if (skill) {
                                skill.useSkill();
                            }
                        }}
                        style={{
                            backgroundImage: skill ? `url(${skill.sprite})` : undefined,
                            borderColor: 'black',
                            cursor: skill ? 'pointer' : 'default',
                            fontSize,
                        }}
                    >
                        {displayText}
                    </Button>
                );
            })}
        </div>
    );
};