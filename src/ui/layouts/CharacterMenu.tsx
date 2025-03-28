import {useState} from "react";

export const CharacterMenu = () => {
    const [mode, setMode] = useState<"select" | "create">()

    const handleEnterGame = () => {
        alert("enter!")
    }

    const handleCreateChar = () => {
        alert("enter!")
    }

    return (
        <div className={"ui-div menu-div"}>
            mode === {"select"} ?
            (
            <div className={"charlist-div"}>

            </div>
            <button className={"ui-div"} onClick={handleEnterGame}>Войти</button>
            ) :
            (
            <div className={"char-div"}>

            </div>
            <button className={"ui-div"} onClick={handleCreateChar}>создать</button>
            )
        </div>
    )
}