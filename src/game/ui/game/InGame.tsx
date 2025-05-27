import {gameRTC, initWS, player} from "../../core/main.ts";
import {memo, useEffect, useState} from "react";
import {useMyDispatch, useMySelector} from "../../../utils/stateManagement/store.ts";
import {toggleCharMenu, UIState} from "../../../utils/stateManagement/uiSlice.ts";
import {isMounted} from "./GameUI.tsx";
import Panel from "../features/panel/ui/Panel.tsx";
import Chat from "../features/chat/ui/Chat.tsx";
import InventoryWindow from "../features/inventory/ui/InventoryWindow.tsx";
import InfoWindow from "../widgets/infoWindow/InfoWindow.tsx";
import LoadingScreen from "../features/menu/LoadingScreen.tsx";
import PlayerWidget from "../widgets/actor/player/PlayerWidget.tsx";
import TargetWidget from "../widgets/actor/target/TargetWidget.tsx";
import PartyWidget from "../widgets/actor/groupMembers/PartyWidget.tsx";
import ExchangeWindow from "../features/exchange/ui/ExchangeWindow.tsx";
import CharacterWindow from "../features/character/ui/CharacterWindow.tsx";
import TalentsWindow from "../features/talents/ui/TalentsWindow.tsx";
import AchievementsWindow from "../features/achievements/ui/AchievementsWindow.tsx";
import ProfessionsWindow from "../features/professions/ui/ProfessionsWindow.tsx";
import QuestsWindow from "../features/quests/ui/QuestsWindow.tsx";
import FriendsListWindow from "../features/friends/ui/FriendsListWindow.tsx";
import SpellBookWindow from "../features/spellBook/ui/SpellBookWindow.tsx";

const check = isMounted();

export const InGame = () => {
    const [health, setHealth] = useState(player!.HP);
    const [maxHealth, setMaxHealth] = useState(player!.HT);
    const [targetHealth, setTargetHealth] = useState(player!.target ? player!.target.HP : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player!.target ? player!.target.HT : 100);

    const [loading, setLoading] = useState(false);

    const dispatch = useMyDispatch();

    const infoEntity = useMySelector((state: { ui: UIState }) => state.ui.infoEntity);
    const infoPosition = useMySelector((state: { ui: UIState }) => state.ui.infoPosition);
    const isInventoryOpen = useMySelector((state: { ui: UIState }) => state.ui.isInventoryOpen);
    const isQuestsWindowOpen = useMySelector((state: { ui: UIState }) => state.ui.isQuestsWindowOpen);
    const isSpellBookWindowOpen = useMySelector((state: { ui: UIState }) => state.ui.isSpellBookWindowOpen);
    const isProfessionsWindowOpen = useMySelector((state: { ui: UIState }) => state.ui.isProfessionsWindowOpen);
    const isTalentsWindowOpen = useMySelector((state: { ui: UIState }) => state.ui.isTalentsWindowOpen);
    const isFriendsWindowOpen = useMySelector((state: { ui: UIState }) => state.ui.isFriendsWindowOpen);
    const isAchievementsWindowOpen = useMySelector((state: { ui: UIState }) => state.ui.isAchievementsWindowOpen);
    const isCharMenuOpen = useMySelector((state: { ui: UIState }) => state.ui.isCharMenuOpen);


    useEffect(() => {


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
                <PartyWidget></PartyWidget>

                <Panel/>
                <Chat/>
            </div>
            {isInventoryOpen && <InventoryWindow/>}
            {isCharMenuOpen && <CharacterWindow/>}
            {isTalentsWindowOpen && <TalentsWindow/>}
            {isAchievementsWindowOpen && <AchievementsWindow/>}
            {isProfessionsWindowOpen && <ProfessionsWindow/>}
            {isQuestsWindowOpen && <QuestsWindow/>}
            {isFriendsWindowOpen && <FriendsListWindow/>}
            {isSpellBookWindowOpen && <SpellBookWindow/>}
            {/*{isCharMenuOpen && <ExchangeWindow onTradeComplete={() => dispatch(toggleCharMenu())}></ExchangeWindow>}*/}
            {/*{isCharMenuOpen && <BookWindow title={"Хуя у меня пресак мощный"} content={"Шёл шестой день дороги. Метель в эту ночь была особенно неистовой... И утихать явно не собиралась. Нет. Не в ближайшее время. Единственным твоим спасением от этих ужасных условий пути - была лишь тёплая мантия и книги. И если первое - защищало твоё тело, то книги - оберегали рассудок от мрачных мыслей о безнадёжности твоего путешествия.\n" +*/}
            {/*    "\n" +*/}
            {/*    "Наверное, стоит обозначить как ты вообще попал в эту ситуацию, не так ли? Если ветер ещё не отшиб остатки твоей памяти, то ты прекрасно помнишь, что ты - выходец магической академии, адепт кафедры Пути Восстановления и Пути Изменения. Тебя отправили на фронт, с целью практики и усовершенствования своих навыков на раненых солдатах. Война. От одного лишь этого слова у тебя стынет кровь в жилах. Тебя всегда ужасало тяга людей к насилию, наверное поэтому ты и отдал предпочтение наиболее созидательным ответвлениям магии. Но увы, от насилия как явления - тебя это не уберегло. Ты чувствуешь, что тебе всё равно придётся с ним столкнуться. И уже скоро.\n" +*/}
            {/*    "\n" +*/}
            {/*    "Внезапно дилижанс остановился. Ты выглянул в окно, чтобы разглядеть что послужило причиной остановки, однако из-за сильной вьюги - рассмотреть что-либо не предоставлялось возможным. До пункта назначения был ещё минимум день пути, поэтому вариант с твоим прибытием - также отпадает в сторону. Какое-то время ты просто сидишь и ничего не предпринимаешь, ожидая, что кучер сам придёт и объяснит ситуацию. Однако, он так и не явился. После этого ты наконец решаешься выйти из дилижанса и проверить всё лично. Подойдя к лошадям ты замечаешь лежащим в кровавом снегу - мужчину. Сквозь метель ты еле разглядываешь его черты и одежду, после чего подступающая тревога не заставила себя долго ждать. В нём ты опознал кучера, который был ответственен за твою перевозку на фронт. Ты не понимал как это могло произойти, если бы это было нападением, то лошади подали тревогу, однако они не издали и звука, продолжая смирно стоять. (edited)\n" +*/}
            {/*    "Ты осмотрелся по сторонам, в поисках потенциальной угрозы, но убедившись, что ничего подходящего под неё не попало в твоё поле зрения - ты решаешься подойти к телу мужчины, чтобы выяснить причины его состояния. Быть может, его ещё можно спасти? (edited)\n"}/>}*/}
            {/*{*/}
            {
                infoEntity && infoPosition && (<InfoWindow entity={infoEntity} position={infoPosition}/>)
            }
        </div>) : (<LoadingScreen></LoadingScreen>)
    )
}