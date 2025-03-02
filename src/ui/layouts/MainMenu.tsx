import React from "react";
import Button from "../components/Button.tsx";

export type ClickHandlerError = () => void;

export const clickHandlerError: ClickHandlerError = () => {
    alert("Undefined onClick handler.");
};


interface MenuProps {
    onStartGame?: () => void;
    onShortcuts?: () => void;
    onSettings?: () => void;
    onResume?: () => void;
    onMainMenu?: () => void;
}

export const MainMenu: React.FC<MenuProps> = ({ onStartGame, onShortcuts, onSettings, onMainMenu, onResume }) => (
    <div className={"ui-div menu-div"}>
        <Button onClick={onStartGame} styleType={"ui-div menu-button"}>start</Button>
        {onResume && <Button onClick={onResume}>resume</Button>}
        {onShortcuts && <Button onClick={onShortcuts}>shortcuts</Button>}
        {onSettings && <Button onClick={onSettings}>settings</Button>}
        {onMainMenu && <Button onClick={onMainMenu}>main menu</Button>}
    </div>
);