// InGame.tsx - CODE REVIEW COMMENTS

import {gameRTC, initWebSocket, player} from "../../core/main.ts";
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
import TradeWindow from "../features/trade/ui/TradeWindow.tsx";

// ISSUE 1: Повторное создание функции isMounted
// ❌ Проблема: Дублирование кода, импорт из другого компонента
const check = isMounted();

// SUGGESTIONS FOR IMPROVEMENT:
// 1. Создать отдельный хук useGameLoop для игровой логики
// 2. Мемоизировать тяжелые селекторы
// 3. Добавить типизацию для player объекта
// 4. Использовать useCallback для обработчиков
// 5. Разделить UI логику и игровую логику

export const InGame = () => {
    // ISSUE 2: Небезопасное обращение к player без проверки на null
    // ❌ Проблема: player! может быть null, что приведет к ошибке
    const [health, setHealth] = useState(player!.HP);
    const [maxHealth, setMaxHealth] = useState(player!.HT);
    const [targetHealth, setTargetHealth] = useState(player!.target ? player!.target.HP : 0);
    const [targetMaxHealth, setTargetMaxHealth] = useState(player!.target ? player!.target.HT : 100);

    const [loading, setLoading] = useState(false);
    const dispatch = useMyDispatch();

    // ISSUE 3: Множественные селекторы - можно оптимизировать
    // ❌ Проблема: Каждый селектор создает отдельную подписку
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
        // ISSUE 4: Мутация объекта memoize без useState
        // ❌ Проблема: Прямая мутация объекта, не React way
        const memoize = {x: player.x, y: player.y}

        // ISSUE 5: Частые проверки в setInterval (каждые 50мс)
        // ❌ Проблема: Может повлиять на производительность
        const interval = setInterval(() => {
            // Небезопасные обращения к player
            setHealth(player!.HP);
            setMaxHealth(player!.HT);

            if (player!.target) {
                setTargetHealth(player!.target.HP);
                setTargetMaxHealth(player!.target.HT);
            }

            // ISSUE 6: Проверка позиции в каждом тике
            if (player.x !== memoize.x || player.y !== memoize.y) {
                gameRTC.sendPlayerPosition(); // Может выбросить ошибку
                [memoize.x, memoize.y] = [player.x, player.y];
            }
        }, 50);

        // ISSUE 7: Закомментированный код
        // setTimeout(() => setLoading(false), randomInt(500, 700));

        return () => {
            clearInterval(interval)
        };
    }, []); // ISSUE 8: Пустой массив зависимостей при использовании внешних переменных

    // ISSUE 9: Условный рендеринг с тернарным оператором для большого JSX
    return (
        !loading ? (
            <div id="interface-layer">
                <div id="static-interface">
                    {/* ISSUE 10: Закомментированный код в JSX */}
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

                {/* ISSUE 11: Множественные условные рендеринги без группировки */}
                {isInventoryOpen && <InventoryWindow/>}
                {isCharMenuOpen && <CharacterWindow/>}
                {isTalentsWindowOpen && <TalentsWindow/>}

                {/* ISSUE 12: Неправильное отображение компонента */}
                {/* TradeWindow отображается при isAchievementsWindowOpen */}
                {isAchievementsWindowOpen && <TradeWindow onClose={() => null}/>}

                {isProfessionsWindowOpen && <ProfessionsWindow/>}
                {isQuestsWindowOpen && <QuestsWindow/>}
                {isFriendsWindowOpen && <FriendsListWindow/>}
                {isSpellBookWindowOpen && <SpellBookWindow/>}

                {/* ISSUE 13: Много закомментированного кода */}
                {/*{isCharMenuOpen && <ExchangeWindow onTradeComplete={() => dispatch(toggleCharMenu())}></ExchangeWindow>}*/}

                {/* Огромный блок закомментированного кода с книгой */}

                {infoEntity && infoPosition && (
                    <InfoWindow entity={infoEntity} position={infoPosition}/>
                )}
            </div>
        ) : (
            <LoadingScreen></LoadingScreen>
        )
    )
}

// РЕКОМЕНДАЦИИ ПО РЕФАКТОРИНГУ:
/*
1. Создать хук usePlayerState для управления состоянием игрока
2. Использовать useMemo для оптимизации селекторов:
   const uiState = useMySelector(state => state.ui, shallowEqual);
3. Добавить проверки на null для player
4. Вынести игровой цикл в отдельный хук useGameLoop
5. Создать компонент WindowManager для управления окнами
6. Удалить закомментированный код
7. Добавить обработку ошибок для gameRTC вызовов
8. Использовать requestAnimationFrame вместо setInterval для плавности
9. Добавить типизацию для player и других игровых объектов
10. Создать константы для интервалов обновления
*/