import React, {CSSProperties, MouseEventHandler} from "react";

const Button = ({children, onClick = () => alert("Undefined onClick handler."), styleType, style, onMouseLeave, onMouseEnter}: {
                    children: React.ReactNode,
                    onClick?: () => void,
                    onMouseLeave?: () => void;
                    styleType: string,
                    style?: CSSProperties,
                    onMouseEnter?: MouseEventHandler<HTMLButtonElement>
                }
)=> {
    return (
        <>
            <button className={styleType} style={style} onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} onClick={onClick}>{children}</button>
        </>
    );
}

export default Button;