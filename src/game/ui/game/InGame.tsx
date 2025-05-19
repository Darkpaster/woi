import {gameRTC, initWS, player} from "../../core/main.ts";
import {memo, useEffect, useState} from "react";
import {useMySelector} from "../../../utils/stateManagement/store.ts";
import {UIState} from "../../../utils/stateManagement/uiSlice.ts";
import {isMounted} from "./GameUI.tsx";
import CharWidget from "../components/game/static/CharWidget.tsx";
import Panel from "../features/panel/Panel.tsx";
import Chat from "../features/chat/Chat.tsx";
import InventoryWindow from "../features/inventory/InventoryWindow.tsx";
import InfoWindow from "../widgets/info-window/InfoWindow.tsx";
import LoadingScreen from "../features/menu/LoadingScreen.tsx";
import PlayerWidget from "../widgets/player/PlayerWidget.tsx";
import TargetWidget from "../widgets/target/TargetWidget.tsx";
import CharacterWindow from "../features/character/CharacterWindow.tsx";
import {CharacterMenu} from "../features/menu/CharacterMenu.tsx";

const check = isMounted();

export const InGame = () => {
    const [health, setHealth] = useState(player!.HP);
    const [maxHealth, setMaxHealth] = useState(player!.HT);
    const [targetHealth, setTargetHealth] = useState(player!.target ? player!.target.HP : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player!.target ? player!.target.HT : 100);

    const [loading, setLoading] = useState(false);

    const infoEntity = useMySelector((state: { ui: UIState }) => state.ui.infoEntity);
    const infoPosition = useMySelector((state: { ui: UIState }) => state.ui.infoPosition);
    const isInventoryOpen = useMySelector((state: { ui: UIState }) => state.ui.isInventoryOpen);
    const isCharMenuOpen = useMySelector((state: { ui: UIState }) => state.ui.isCharMenuOpen);


    useEffect(() => {
        // if (check()) {
        //     return
        // }

        const memoize = {x: player.x, y: player.y}

        const interval = setInterval(() => {
            setHealth(player!.HP);
            setMaxHealth(player!.HT);
            if (player!.target) {
                setTargetHealth(player!.target.HP);
                setTargetMaxHealth(player!.target.HT);
            }
            if (player.x !== memoize.x || player.y !== memoize.y) {
                // console.log(`x: ${player.x}, y: ${player.y}`)
                gameRTC.sendPlayerPosition();
                [memoize.x, memoize.y] = [player.x, player.y];
            }
        }, 50);

        // setTimeout(() => setLoading(false), randomInt(500, 700));

        return () => {
            clearInterval(interval)
        };
    }, []);

    return (
        !loading ? (<div id="interface-layer">
            <div id="static-interface">
                {/*<CharWidget value={health} max={maxHealth} className={"stat-bar"}/>*/}
                {/*{player!.target && (*/}
                {/*    <CharWidget value={targetHealth} max={targetMaxHealth} className={"stat-bar-enemy"}/>*/}
                {/*)}*/}

                <PlayerWidget />
                {player!.target && (
                    <TargetWidget />
                )}

                <Panel/>
                <Chat/>
            </div>
            {isInventoryOpen && <InventoryWindow/>}
            {isCharMenuOpen && <CharacterWindow/>}
            {
                infoEntity && infoPosition && (<InfoWindow entity={infoEntity} position={infoPosition}/>)
            }
        </div>) : (<LoadingScreen></LoadingScreen>)
    )
}