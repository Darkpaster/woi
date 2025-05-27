// components/Panel.tsx
import React, { useEffect, useState } from "react";
import SkillPanel from "./SkillPanel.tsx";
import {WindowConfig, WindowType} from "../types.ts";
import {player} from "../../../../core/main.ts";
import WindowsPanel from "./WindowsPanel.tsx";
import "../styles/panel.scss"
import {actions} from "../../../input/input.ts";

// Обновленный основной компонент Panel
const Panel = () => {
    const [spellBook, setSpellBook] = useState(player!.spellBook);

    useEffect(() => {
        const interval = setInterval(() => {
            setSpellBook([...player!.spellBook]);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleSkillUse = (skill: any) => {
        skill.useSkill();
    };

    const handleSkillReorder = (sourceIndex: number, targetIndex: number) => {
        const sourceSkill = player!.spellBook[sourceIndex];
        const targetSkill = player!.spellBook[targetIndex];

        // Swap skills
        player!.spellBook[sourceIndex] = targetSkill;
        player!.spellBook[targetIndex] = sourceSkill;

        setSpellBook([...player!.spellBook]);
    };

    const handleWindowOpen = (windowType: WindowType) => {
        try {
            actions[windowType]();
        }catch (error) {
            alert(`${windowType} does not exist!`);
            // console.error(error);
        }
    };

    // Конфигурация окон
    const windowConfigs: WindowConfig[] = [
        { type: 'characterWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.2_67.png', name: 'Персонаж', hotkey: 'C' },
        { type: 'inventoryWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.6_37.png', name: 'Инвентарь', hotkey: 'B' },
        { type: 'friendsWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.1_39.png', name: 'Друзья', hotkey: 'H' },
        { type: 'spellBookWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.6_88.png', name: 'Книга Заклинаний', hotkey: 'I' },
        { type: 'talentsWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.2_02.png', name: 'Таланты', hotkey: 'T' },
        { type: 'achievementsWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.5_10.png', name: 'Достижения', hotkey: 'J' },
        // { type: 'guild', icon: '/icons/guild.png', name: 'Гильдия', hotkey: 'G' },
        { type: 'professionsWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.1_53.png', name: 'Профессии', hotkey: 'P' },
        // { type: 'map', icon: '/icons/map.png', name: 'Карта', hotkey: 'M' },
        { type: 'questsWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.6_26.png', name: 'Квесты', hotkey: 'G' },
        { type: 'settingsWindow', icon: 'src/assets/icons/789_Lorc_RPG_icons/Icon.7_55.png', name: 'Настройки', hotkey: 'Esc' }
    ];

    return (
        <>
            {/* Основная панель навыков (горизонтальная, 10 слотов) */}
            <SkillPanel
                type="skills"
                orientation="horizontal"
                length={9}
                spellBook={spellBook}
                onSkillUse={handleSkillUse}
                onSkillReorder={handleSkillReorder}
            />

             {/*Панель окон (вертикальная, справа) */}
            <WindowsPanel
                type="windows"
                orientation="horizontal"
                length={9}
                position={{right: "0", top: "0"}}
                windows={windowConfigs}
                onWindowOpen={handleWindowOpen}
            />
        </>
    );
};

// Экспорт компонентов для использования отдельно
export { SkillPanel, WindowsPanel };
export default Panel;