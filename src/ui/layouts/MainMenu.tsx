import React from "react";
import {Button} from "./button.ts";

interface MenuProps {
    onNewGame?: () => void;
    onLoadGame?: () => void;
    onShortcuts?: () => void;
    onSettings?: () => void;
    onResume?: () => void;
    onSave?: () => void;
    onMainMenu?: () => void;
}

const MainMenu: React.FC<MenuProps> = ({ onNewGame, onLoadGame, onShortcuts, onSettings }) => (
    <div className="menuDiv">
        <Button onClick={onNewGame}>new game</Button>
        {onLoadGame && <Button onClick={onLoadGame}>load game</Button>}
        {onShortcuts && <Button onClick={onShortcuts}>shortcuts</Button>}
        {onSettings && <Button onClick={onSettings}>settings</Button>}
    </div>
);