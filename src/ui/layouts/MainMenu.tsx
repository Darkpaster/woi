import React from "react";
import {txtList} from "../../core/config/lang.ts";

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
        <button onClick={onStartGame} className={"ui-div menu-button"}>{txtList().create}</button>
        {onResume && <button onClick={onResume}>resume</button>}
        {onShortcuts && <button onClick={onShortcuts}>shortcuts</button>}
        {onSettings && <button onClick={onSettings}>settings</button>}
        {onMainMenu && <button onClick={onMainMenu}>main menu</button>}
    </div>
);