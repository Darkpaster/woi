// components/Panel.tsx
import React, { useEffect, useState } from "react";
import SkillPanel from "./SkillPanel.tsx";
import {WindowConfig, WindowType} from "../types.ts";
import {player} from "../../../../core/main.ts";
import WindowsPanel from "./WindowsPanel.tsx";
import "../styles/panel.scss"

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
        // Здесь должна быть логика открытия окон
        console.log(`Opening ${windowType} window`);
        // Пример: dispatch(openWindow(windowType));
    };

    // Конфигурация окон
    const windowConfigs: WindowConfig[] = [
        { type: 'character', icon: '/icons/character.png', name: 'Персонаж', hotkey: 'C' },
        { type: 'inventory', icon: '/icons/inventory.png', name: 'Инвентарь', hotkey: 'I' },
        { type: 'guild', icon: '/icons/guild.png', name: 'Гильдия', hotkey: 'G' },
        { type: 'profession', icon: '/icons/profession.png', name: 'Профессии', hotkey: 'P' },
        { type: 'map', icon: '/icons/map.png', name: 'Карта', hotkey: 'M' },
        { type: 'quest', icon: '/icons/quest.png', name: 'Квесты', hotkey: 'Q' },
        { type: 'settings', icon: '/icons/settings.png', name: 'Настройки', hotkey: 'Esc' }
    ];

    return (
        <>
            {/* Основная панель навыков (горизонтальная, 10 слотов) */}
            <SkillPanel
                type="skills"
                orientation="horizontal"
                length={10}
                spellBook={spellBook}
                onSkillUse={handleSkillUse}
                onSkillReorder={handleSkillReorder}
            />

             {/*Панель окон (вертикальная, справа) */}
            <WindowsPanel
                type="windows"
                orientation="vertical"
                length={7}
                windows={windowConfigs}
                onWindowOpen={handleWindowOpen}
            />
        </>
    );
};

// Экспорт компонентов для использования отдельно
export { SkillPanel, WindowsPanel };
export default Panel;