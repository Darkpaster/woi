import {settings} from "../../../core/config/settings.ts";

const SettingsWindow = () => {

    return (
        <div className={"ui-div settings-div"}>
            <div>
                <label htmlFor={"show-fps"}>показывать фпс: </label>
                <input id={"show-fps"} type={"checkbox"} className={"ui-div"} defaultChecked={false} onChange={(event) =>
                    settings.showFPS = event.target.checked}/>
            </div>

            <div>
                <label htmlFor={"max-fps"}>максимальный фпс: </label>
                <input id={"max-fps"} type={"number"} max={60} min={1} defaultValue={settings.fps} className={"ui-div"}
                onChange={(event) => settings.fps = Number(event.target.value)}/>
            </div>

            <div>
                <label htmlFor={"language"}>язык: </label>
                <select name="язык" id="language" className={"ui-div"} onChange={(event) => {
                    settings.language = event.target.value
                }
                    }>
                    <option value="ru">Русский</option>
                    <option value="en">Английский</option>
                    <option value="ja">Японский</option>
                    <option value="ua">Украинский</option>
                </select>
            </div>

            <div>
                <label htmlFor={"music-volume"}>громкость музыки: </label>
                <input id={"music-volume"} type={"range"} max={100} min={0} className={"ui-div"}/>
            </div>

            <div>
                <label htmlFor={"sound-volume"}>громкость звуков: </label>
                <input id={"sound-volume"} type={"range"} max={100} min={0} className={"ui-div"}/>
            </div>

        </div>
    )
}

export default SettingsWindow;