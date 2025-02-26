import React from "react";
import Button from "../components/Button.tsx";

interface MenuProps {
    onNewGame?: () => void;
    onLoadGame?: () => void;
    onShortcuts?: () => void;
    onSettings?: () => void;
    onResume?: () => void;
    onSave?: () => void;
    onMainMenu?: () => void;
}

export const PauseMenu: React.FC<MenuProps> = ({ onResume, onSave, onShortcuts, onSettings, onMainMenu }) => (
    <div className="pause-menu-div">
        <Button onClick={onResume}>resume</Button>
        {onSave && <Button onClick={onSave}>save</Button>}
        {onShortcuts && <Button onClick={onShortcuts}>shortcuts</Button>}
        {onSettings && <Button onClick={onSettings}>settings</Button>}
        {onMainMenu && <Button onClick={onMainMenu}>main menu</Button>}
    </div>
);