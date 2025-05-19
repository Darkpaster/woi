import React, {useState} from "react";
import {txtList} from "../../../core/config/lang.ts";
import {CharacterMenu} from "./CharacterMenu.tsx";
import ShortcutsWindow from "./ShortcutsWindow.tsx";
import SettingsWindow from "./SettingsWindow.tsx";


interface MenuProps {
    onStartGame?: () => void;
    onResume?: () => void;
    onMainMenu?: () => void;
}

export const MainMenu: React.FC<MenuProps> = ({onStartGame, onMainMenu, onResume}) => {
    const fuckGoBack = () => onMainMenu ? 'pause' : 'main';

    const [tab, setTab] = useState<'main' | 'pause' | 'settings' | 'shortcuts' | 'select'>(fuckGoBack());

    function renderSwitch(param: typeof tab) {
        switch(param) {
            case 'main':
            case 'pause':
                return (<div className={"ui-div menu-div"}>
                    {tab === "main" &&
                        <button onClick={() => setTab('select')} className={"ui-div menu-button"}>{txtList().create}</button>}
                    {tab === "pause" && <button className={"ui-div menu-button"} onClick={onResume}>{txtList().ok}</button>}
                    <button className={"ui-div menu-button"} onClick={() => setTab("shortcuts")}>{txtList().shortcuts}</button>
                    <button className={"ui-div menu-button"} onClick={() => setTab("settings")}>{txtList().settings}</button>
                    {tab === 'pause'
                        ?
                        <button onClick={() => {
                            onMainMenu();
                            setTab('main');
                            onResume();
                        }} className={"ui-div menu-button"}>{txtList().menu}</button>
                        :
                        <button className={"ui-div menu-button"} onClick={() => {
                            document.cookie.replace(document.cookie, "");
                            window.location.reload();
                        }}>выйти из аккаунта</button>}
                </div>)
            case "select":
                return (
                    <>
                        <CharacterMenu onBack={() => setTab(fuckGoBack())} onEnter={onStartGame}></CharacterMenu>
                    </>
                )
            case "shortcuts":
                return (
                    <>
                        <button className={"ui-div"} onClick={() => setTab(fuckGoBack())}>{"<—"}</button>
                        <ShortcutsWindow></ShortcutsWindow>
                    </>
                )
            case "settings":
                return (
                <>
                    <button className={"ui-div"} onClick={() => setTab(fuckGoBack())}>{"<—"}</button>
                    <SettingsWindow></SettingsWindow>
                </>
                )
        }
    }


    return renderSwitch(tab)
}