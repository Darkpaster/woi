import React from 'react';
import Button from './Button.tsx'
import { createPortal } from 'react-dom';

type WindowProps = {
    children?: React.ReactNode;
    buttons?: string[];
}

const ModalWindow: React.FC<WindowProps> = ({ children = "Undefined", buttons = ["ok"]}) => {
    const [visible, setVisible] = React.useState(true);
    return createPortal(
        <dialog open={visible}>
            <div className='dialogDiv'>
                <b className='windowContent'>{children}</b>
            </div>
            <div className='dialogButtonDiv'>
                {buttons.map((content) => <Button key={content} onClick={() => setVisible(false)}>{content}</Button>)}
            </div>
        </dialog>,
        (document.getElementById("root") as Element)
    );
}

export default Window;
