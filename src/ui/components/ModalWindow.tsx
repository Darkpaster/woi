import React from 'react';
import { createPortal } from 'react-dom';
import {txtList} from "../../core/config/lang.ts";

type WindowProps = {
    children?: React.ReactNode;
    buttons?: string[];
}

const ModalWindow: React.FC<WindowProps> = ({ children = "Undefined", buttons = [txtList().ok]}) => {
    const [visible, setVisible] = React.useState(true);
    return createPortal(
        <dialog open={visible}>
            <div className='dialogDiv'>
                <b className='windowContent'>{children}</b>
            </div>
            <div className='dialogButtonDiv'>
                {buttons.map((content) => <button key={content} className={"ui-div"} onClick={() => setVisible(false)}>{content}</button>)}
            </div>
        </dialog>,
        (document.getElementById("root") as Element)
    );
}

export default Window;
