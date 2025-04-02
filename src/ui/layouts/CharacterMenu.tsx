import React, {useEffect, useState} from "react";
import {Player} from "../../core/logic/actors/player.ts";

export const CharacterMenu = ( {onEnter}: {onEnter: () => void}) => {
    const [mode, setMode] = useState<"select" | "create">("select")

    const [characters, setCharacters] = useState<null|Player[]>(null)

    const [selected, setSelected] = useState()

    useEffect(() => {
        //fetch за списком персонажей по access_token
    }, []);

    return (
        <>
            <div className={"ui-div menu-div"}>

                {mode === "select" ? (
                    <>
                        <div className={"char-list-div"}>
                            {characters?.map(character => (
                                <div onClick={() => setCharacters(character)}>{character.name}</div>
                            ))}
                        </div>
                        <button className={"ui-div"} onClick={onEnter}>Войти</button>
                        <button className={"ui-div"} onClick={() => setMode('create')} disabled={false}>
                            Создать персонажа
                        </button>
                    </>
                ) : (
                    <>
                        <button className={"ui-div"} onClick={() => setMode('select')}>{"<--"}</button>
                        <div className={"char-div"}>
                            <button className={"ui-div"}>{"сюда"}</button>
                            <button className={"ui-div"}>{"туда"}</button>
                        </div>
                        <button className={"ui-div"} onClick={onEnter}>создать</button>
                    </>
                ) }

            </div>
        </>
    )
}