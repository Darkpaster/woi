import React from "react";
import Button from "../components/Button.tsx";
import {Window} from "../components/Window.tsx";

export type ClickHandlerError = () => void;

export const clickHandlerError: ClickHandlerError = () => {
    alert("Undefined onClick handler.");
};


interface MenuProps {
    onNewGame?: () => void;
    onLoadGame?: () => void;
    onShortcuts?: () => void;
    onSettings?: () => void;
    onResume?: () => void;
    onSave?: () => void;
    onMainMenu?: () => void;
}

export const MainMenu: React.FC<MenuProps> = ({ onNewGame, onLoadGame, onShortcuts, onSettings }) => (
    <Window styleType={"menu-div"}>
        <Button onClick={onNewGame} styleType={"menu-button"}>new game</Button>
        {onLoadGame && <Button onClick={onLoadGame}>load game</Button>}
        {onShortcuts && <Button onClick={onShortcuts}>shortcuts</Button>}
        {onSettings && <Button onClick={onSettings}>settings</Button>}
    </Window>
);