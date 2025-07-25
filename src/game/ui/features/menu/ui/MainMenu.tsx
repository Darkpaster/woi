// components/MainMenu.tsx
import React, { useState, useCallback } from "react";
import { txtList } from "../../../../core/config/lang.ts";
import { CharacterMenu } from "./CharacterMenu.tsx";
import ShortcutsWindow from "./ShortcutsWindow.tsx";
import SettingsWindow from "./SettingsWindow.tsx";
import "../styles/menu.scss";

type MenuTab = 'main' | 'pause' | 'settings' | 'shortcuts' | 'select';

interface MenuProps {
    onStartGame?: () => void;
    onResume?: () => void;
    onMainMenu?: () => void;
}

export const MainMenu: React.FC<MenuProps> = ({
                                                  onStartGame,
                                                  onMainMenu,
                                                  onResume
                                              }) => {
    const getInitialTab = useCallback((): MenuTab => {
        return onMainMenu ? 'pause' : 'main';
    }, [onMainMenu]);

    const [tab, setTab] = useState<MenuTab>(getInitialTab());

    const handleLogout = useCallback(() => { //add request
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
        window.location.reload();
    }, []);

    const handleBackToMainMenu = useCallback(() => {
        if (onMainMenu && onResume) {
            onMainMenu();
            setTab('main');
            onResume();
        }
    }, [onMainMenu, onResume]);

    const navigateBack = useCallback(() => {
        setTab(getInitialTab());
    }, [getInitialTab]);

    const renderMainOrPauseMenu = () => (
        <div className="ui-div menu-div ui-border">
            {tab === "main" && (
                <button
                    onClick={() => setTab('select')}
                    className="ui-div menu-button"
                >
                    {txtList().create}
                </button>
            )}

            {tab === "pause" && (
                <button
                    className="ui-div menu-button"
                    onClick={onResume}
                >
                    {txtList().ok}
                </button>
            )}

            <button
                className="ui-div menu-button"
                onClick={() => setTab("shortcuts")}
            >
                {txtList().shortcuts}
            </button>

            <button
                className="ui-div menu-button"
                onClick={() => setTab("settings")}
            >
                {txtList().settings}
            </button>

            {tab === 'pause' ? (
                <button
                    onClick={handleBackToMainMenu}
                    className="ui-div menu-button"
                >
                    {txtList().menu}
                </button>
            ) : (
                <button
                    className="ui-div menu-button"
                    onClick={handleLogout}
                >
                    выйти из аккаунта
                </button>
            )}
        </div>
    );

    const renderCharacterSelect = () => (
        <CharacterMenu
            onBack={navigateBack}
            onEnter={onStartGame}
        />
    );

    const renderShortcuts = () => (
        <>
            <button
                className="ui-div"
                onClick={navigateBack}
                aria-label="Назад"
            >
                ←
            </button>
            <ShortcutsWindow onClose={navigateBack} />
        </>
    );

    const renderSettings = () => (
        <>
            <button
                className="ui-div"
                onClick={navigateBack}
                aria-label="Назад"
            >
                ←
            </button>
            <SettingsWindow onClose={navigateBack} />
        </>
    );

    const renderContent = () => {
        switch (tab) {
            case 'main':
            case 'pause':
                return renderMainOrPauseMenu();
            case 'select':
                return renderCharacterSelect();
            case 'shortcuts':
                return renderShortcuts();
            case 'settings':
                return renderSettings();
            default:
                return renderMainOrPauseMenu();
        }
    };

    return (
        <div className="main-menu-container">
            {renderContent()}
        </div>
    );
};