import {SelfWidget} from "../components/SelfWidget.tsx";
import {player} from "../../core/main.ts";
import {TargetWidget} from "../components/TargetWidget.tsx";
import {Panel} from "../components/Panel.tsx";
import {Chat} from "../components/Chat.tsx";
import {Inventory} from "../components/Inventory.tsx";
import {InfoWindow} from "../components/InfoWindow.tsx";
import {useEffect, useState} from "react";
import {useMySelector} from "../../utils/stateManagement/store.ts";
import {UIState} from "../../utils/stateManagement/uiSlice.ts";

export const InGame = () => {
    const [health, setHealth] = useState(player!.HP);
    const [maxHealth, setMaxHealth] = useState(player!.HT);
    const [targetHealth, setTargetHealth] = useState(player!.target ? player!.target.HP : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player!.target ? player!.target.HT : 100);

    const infoEntity = useMySelector((state: { ui: UIState}) => state.ui.infoEntity);
    const infoPosition = useMySelector((state: { ui: UIState}) => state.ui.infoPosition);
    const isInventoryOpen = useMySelector((state: { ui: UIState}) => state.ui.isInventoryOpen);

    useEffect(() => {
        const interval = setInterval(() => {
            setHealth(player!.HP);
            setMaxHealth(player!.HT);
            if (player!.target) {
                setTargetHealth(player!.target.HP);
                setTargetMaxHealth(player!.target.HT);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="interface-layer">
            <div id="static-interface">
                <SelfWidget value={health} max={maxHealth}/>
                {player!.target && (
                    <TargetWidget value={targetHealth} max={targetMaxHealth}/>
                )}
                <Panel />
                <Chat/>
            </div>
            {isInventoryOpen && <Inventory />}
            {
                infoEntity && infoPosition && (<InfoWindow entity={infoEntity} position={infoPosition}/>)
            }
        </div>
    )
}