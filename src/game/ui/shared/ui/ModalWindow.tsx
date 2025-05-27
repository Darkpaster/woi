import React from 'react';
import { createPortal } from 'react-dom';
import {txtList} from "../../../core/config/lang.ts";

type WindowProps = {
    children?: React.ReactNode;
    buttons?: {
        name: string;
        onClick?: () => void;
    }[];
}

const ModalWindow: React.FC<WindowProps> = ({ children = "Undefined", buttons = [{ name: txtList().ok }]}) => {
    const [visible, setVisible] = React.useState(true);
    return createPortal(
        <dialog open={visible} style={{position: "relative", zIndex: 9999}} className={"ui-div ui-border"}>
            <div className='dialogDiv'>
                <b className='windowContent'>{children}</b>
            </div>
            <div className='dialogButtonDiv'>
                {buttons.map((button, i) => <button key={button.name+i} className={"ui-div"} onClick={button.onClick || (() => setVisible(false))}>{button.name}</button>)}
            </div>
        </dialog>,
        (document.getElementById("root") as Element)
    );
}

export default ModalWindow;
