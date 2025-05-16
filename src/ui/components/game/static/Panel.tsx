import React, { RefObject, useEffect, useRef, useState } from "react";
import { player } from "../../../../core/main.ts";
import { actions } from "../../../input/input.ts";
import { setInfoEntity, setInfoPosition } from "../../../../utils/stateManagement/uiSlice.ts";
import { useMyDispatch } from "../../../../utils/stateManagement/store.ts";
import Icon from "../dynamic/Icon.tsx";
import {Skill} from "../../../../core/logic/skills/skill.ts";

const Panel = () => {
    const [spellBook, setSpellBook] = useState(player!.spellBook);
    const [draggedSkill, setDraggedSkill] = useState<{ skill: Skill, index: number } | null>(null);

    const dispatch = useMyDispatch();
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
            }
        }

        return () => clearInterval(interval);
    }, []);

    const handleDragStart = (e: React.DragEvent, skill: Skill, index: number) => {
        if (!skill) return;

        e.dataTransfer.setData("text/plain", index.toString());
        setDraggedSkill({ skill, index });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (!draggedSkill) return;

        const sourceIndex = draggedSkill.index;
        const sourceSkill = draggedSkill.skill;

        if (sourceIndex === targetIndex) return; // No change if same slot

        const targetSkill = player!.spellBook[targetIndex];

        // Swap skills
        player!.spellBook[sourceIndex] = targetSkill;
        player!.spellBook[targetIndex] = sourceSkill;

        setSpellBook([...player!.spellBook]);
        setDraggedSkill(null);
    };

    return (
        <div ref={panelRef} className="ui-div panel-div cell-type">
            {spellBook.map((skill, index) => {
                let displayText = String(index + 1);
                let fontSize = '15px';
                let textAlign = "end";
                if (skill) {
                    const left = skill.process.cooldown!.getLeftTime();
                    if (left > 0) {
                        displayText = (left / 1000).toFixed(1);
                        fontSize = '20px';
                        textAlign = "center";
                    }
                }
                return (
                    <button
                        key={index}
                        className="ui-div cell"
                        draggable={!!skill}
                        onDragStart={(e) => handleDragStart(e, skill, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseEnter={(e) => {
                            if (skill) {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                dispatch(setInfoPosition({left: rect.x, top: rect.y}));
                                dispatch(setInfoEntity({
                                    name: skill.name,
                                    description: skill.description,
                                    minDamage: skill.minDamage,
                                    maxDamage: skill.maxDamage,
                                    icon: skill.icon,
                                    cooldown: skill.cooldown,
                                    rarity: "none"
                                }));
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
                            borderColor: 'black',
                            cursor: skill ? 'pointer' : 'default',
                            padding: 0
                        }}
                    >
                        <Icon
                            icon={skill?.icon}
                            displayText={displayText}
                            fontSize={fontSize}
                            textAlign={textAlign}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default Panel;