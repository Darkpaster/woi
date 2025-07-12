import React, {useEffect, useState} from "react";
import Player from "../../../../core/logic/actors/player.ts";
import {camera, entityManager, init, initCamera, player} from "../../../../core/main.ts";
import UseInitAPI from "../api/initAPI.ts";
import Wanderer from "../../../../core/logic/actors/characters/wanderer.ts";
import axios from "axios";
import {SmallPotionOfHealing} from "../../../../core/logic/items/consumable/potions/smallPotionOfHealing.ts";
import LoadingScreen from "../LoadingScreen.tsx";
import {settings} from "../../../../core/config/settings.ts";

import "../styles/charMenu.scss"


export const CharacterMenu = ({onEnter, onBack}: { onEnter: () => void, onBack: () => void }) => {
    const [mode, setMode] = useState<"select" | "create">("select");
    const [characters, setCharacters] = useState<Player[]>([]);
    const [screenLoading, setScreenLoading] = useState(false);
    const [charType, setCharType] = useState<'wanderer' | 'knight'>('wanderer');
    const [selected, setSelected] = useState<null | number>(null);
    const [name, setName] = useState("");
    const [lever, setLever] = useState(false);


    function requestType(): {
        url: string,
        method: 'POST' | 'GET',
        body?: { name: string, characterType: string }
    } {
        return mode === "create" ? {
                url: "/createChar",
                method: "POST",
                body: {
                    name: name,
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
                    setCharacters([]);
                    try {
                        for (const char of response) {
                            const player = new Player();
                            player.name = char.name;
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
        if (!name || loading) return
        setLever(!lever);
    }

    const handleEnter = async () => {
        if (!selected || loading) {
            return
        }


        const target = characters?.filter(char => char.id === selected)[0];
        if (target) {
            setScreenLoading(true);
            init(target).then(answer => {
                console.log(answer)
                setTimeout(async () => {
                    const itemList = await axios.request({url: "/item/init", method: "get"});
                    // const inventory = await axios.request({url: "/item/initInventory", method: "get"});
                    // const stats = await axios.request({url: "/player/initStats", method: "get"});
                    const mobList = await axios.request({url: "/mob/init", method: "get"});
                    const playerData = (await axios.request({url: "/player/getCharData?characterId="+target.id, method: "get"})).data;
                    // alert(JSON.stringify(mobList.data))
                    for (const item of itemList.data) {
                        const newItem = new SmallPotionOfHealing([item.itemId]);
                        newItem.x = item.x * settings.defaultTileScale;
                        newItem.y = item.y * settings.defaultTileScale;
                        entityManager.addItem(item);
                    }
                    for (const mob of mobList.data) {
                        // console.log(JSON.stringify(mob))
                        entityManager.addMob(mob);
                    }
                    player.HP = playerData.health;
                    player.HT = player.HP;
                    player.name = playerData.name;
                    player.id = playerData.id;
                    player.x = playerData.x;
                    player.y = playerData.y;
                    initCamera();
                    player!.experience = playerData.experience;
                    player.level = playerData.level;
                    player!.gold = playerData.gold;
                    onEnter()
                }, 1000);
            });
        }
    }

    return (
        !screenLoading ? <>
            <button className={"ui-div"} onClick={mode === "create" ? () => setMode("select") : onBack}>{"<—"}</button>
            <div className={"ui-div char-menu-div ui-border"}>

                {mode === "select" ? (
                    <>
                        <div className={"char-list-div"}>
                            {characters.length > 0 ? characters?.map((character) => (
                                <div style={{
                                    backgroundColor: `${character.id === selected ? "#D4A017FF" : ""}`
                                }} key={`select${character.id}`}
                                     onClick={() => {
                                         setSelected(character.id === selected ? null : character.id);
                                     }}><h3 style={{color: "lightblue"}}>{character.name}</h3>
                                    {`${character.level} уровень, Сокрытый Лес`}</div>
                            )) : (<p style={{textAlign: "center"}}>Список персонажей пуст</p>)}
                        </div>
                        <button disabled={selected === null} className={"ui-div"} onClick={handleEnter}>Войти</button>
                        <button className={"ui-div"} onClick={() => setMode('create')} disabled={false}>
                            Создать персонажа
                        </button>
                    </>
                ) : (
                    <>
                        <h1>Странник</h1>
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