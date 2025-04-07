import React, {useEffect, useState} from "react";
import Player from "../../core/logic/actors/player.ts";
import {entityManager, init} from "../../core/main.ts";
import {LoadingScreen} from "../components/game/dynamic/LoadingScreen.tsx";
import UseInitAPI from "../service/hooks/initAPI.ts";
import Wanderer from "../../core/logic/actors/characters/wanderer.ts";
import {request} from "axios";
import {SmallPotionOfHealing} from "../../core/logic/items/consumable/potions/smallPotionOfHealing.ts";
import BlueSlime from "../../core/logic/actors/mobs/enemies/blueSlime.ts";

export type ItemPosition = {
    itemId: number,
    x: number,
    y: number
}

export const CharacterMenu = ({onEnter, onBack}: { onEnter: () => void, onBack: () => void }) => {
    const [mode, setMode] = useState<"select" | "create">("select");

    const [characters, setCharacters] = useState<Player[]>([]);

    const [screenLoading, setScreenLoading] = useState(false);

    const [charType, setCharType] = useState<'wanderer' | 'knight'>('wanderer');

    const [selected, setSelected] = useState<null | number>(null);

    const [name, setName] = useState("");

    const [lever, setLever] = useState(false);

    function requestType(): { url: string, method: 'POST' | 'GET', body?: {nickname: string, characterType: string} } {
        return mode === "create" ? {
            url: "/createChar",
            method: "POST",
            body: {
                nickname: name,
                characterType: charType,
            },
        } :
            {
                url: "/getCharList",
                method: "GET",
            }
    }

    const {data, error, loading} = UseInitAPI({
        ...requestType(),
        onLoad: (response) => {
            if (response) {
                if (mode === "select") {
                    // const data = JSON.parse(response);
                    setCharacters([]);
                    try {
                        for (const char of response) {
                            const player = new Player();
                            player.name = char.nickname;
                            player.id = char.id;
                            setCharacters(prev => [...prev, player]);
                        }
                    } catch (err) {
                        alert(err.toString())
                    }
                } else {
                    const player: Wanderer = new Wanderer();
                    player.name = name;
                    setCharacters(prev => [...prev, player]);
                    setName("");
                    setMode("select");
                }
            } else {
                alert("damn")
            }
        },
        deps: [lever],
    });

    const handleCreateChar = () => {
        if (!name) return
        setLever(!lever);
    }

    const handleEnter = async () => {
        if (!selected) {
            return
        }

        const target = characters?.filter(char => char.id === selected)[0];
        if (target) {
            setScreenLoading(true);
            init(target).then(answer => {
                console.log(answer)
                setTimeout(async () => {
                    const itemList = await request({url: "/item/init", method: "get"});
                    const mobList = await request({url: "/mob/init", method: "get"});
                    for (const item of JSON.parse(itemList.data)) {
                        const newItem = new SmallPotionOfHealing();
                        newItem.x = item.x;
                        newItem.y = item.y;
                        newItem.id = item.itemId;
                        entityManager.addItem(item);
                    }
                    for (const mob of JSON.parse(mobList.data)) {
                        const newMob = new BlueSlime();
                        newMob.x = mob.x;
                        newMob.y = mob.y;
                        newMob.id = mob.id;
                        newMob.HP = mob.health;
                        if (mob.isAlive) {
                            entityManager.addMob(newMob);
                        } else {
                            console.log("dead "+mob.id);
                        }
                    }
                    onEnter()
                }, 1000);
            });
        }
    }

    return (
        !screenLoading ? <>
            <button className={"ui-div"} onClick={mode === "create" ? () => setMode("select") : onBack}>{"<—"}</button>
            <div className={"ui-div char-menu-div"}>

                {mode === "select" ? (
                    <>
                        <div className={"char-list-div"}>
                            {characters.length > 0 ? characters?.map((character) => (
                                <div style={{
                                    width: "auto",
                                    padding: "0.5em",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: "0.2s",
                                    backgroundColor: `${character.id === selected ? "#D4A017FF" : ""}`
                                }} key={`select${character.id}`}
                                     onClick={() => {
                                         setSelected(character.id === selected ? null : character.id);
                                     }}><h3 style={{color: "lightblue"}}>{character.name}</h3>
                                    {`${character.level} уровень, Сокрытый Лес`}</div>
                            )) : (<p style={{textAlign: "center"}}>Список персонажей пуст</p>)}
                        </div>
                        <button className={"ui-div"} onClick={handleEnter}>Войти</button>
                        <button className={"ui-div"} onClick={() => setMode('create')} disabled={false}>
                            Создать персонажа
                        </button>
                    </>
                ) : (
                    <>
                        <h1 style={{textAlign: "center"}}>Странник</h1>
                        <div className={"char-div"}>
                            <button className={"ui-div"}>{"<-"}</button>
                            <button className={"ui-div"}>{"->"}</button>
                        </div>
                        <div style={{height: "20vh", width: "100%", overflow: "auto"}}>
                            <h3 style={{textAlign: "center"}}>Описание:</h3>
                            По природе своей - искатель приключений. Вы никогда не откажетесь от попыток попробовать
                            себя в чём-то новом, а слова "таинственный лес", "загадочное озеро" и "неизвестный артефакт"
                            вызывают в вас непреодолимый трепет.
                        </div>
                        <div style={{textAlign: "center"}}>
                            <h3>Имя персонажа:</h3>
                            <input className={"ui-div"} type={"text"}
                                   onChange={(event) => setName(event.target.value)}></input>
                        </div>
                        <button style={{marginTop: "2em"}} className={"ui-div"} onClick={handleCreateChar}>создать
                        </button>
                        {loading && <p style={{color: "yellow"}}>Загрузка...</p>}
                        {error && <p style={{color: "red"}}>Ошибка: {error.toString()}</p>}
                    </>
                )}

            </div>
        </> : <LoadingScreen></LoadingScreen>
    )
}