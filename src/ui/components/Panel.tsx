// Компонент панели навыков
import Button from "./Button.tsx";
import {useEffect, useState} from "react";
import {player} from "../../core/logic/update.ts";

interface PanelProps {
    onShowInfo: (skill: never, rect: DOMRect) => void;
    onHideInfo: () => void;
}

const Panel: React.FC<PanelProps> = ({ onShowInfo, onHideInfo }) => {
    const [spellBook, setSpellBook] = useState(player.spellBook);

    useEffect(() => {
        const interval = setInterval(() => {
            setSpellBook([...player.spellBook]);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="panel-div">
            {spellBook.map((skill, index) => {
                let displayText = String(index + 1);
                let fontSize = '15px';
                if (skill) {
                    const left = skill.process.cooldown.getLeftTime();
                    if (left > 0) {
                        displayText = (left / 1000).toFixed(1);
                        fontSize = '20px';
                    }
                }
                return (
                    <Button
                        key={index}
                        className="cell"
                        onMouseEnter={(e) => {
                            if (skill) {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                onShowInfo(skill, rect);
                            }
                        }}
                        onMouseLeave={onHideInfo}
                        onClick={() => {
                            if (skill) {
                                skill.useSkill();
                            }
                        }}
                        style={{
                            backgroundImage: skill ? `url(${skill.icon})` : undefined,
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