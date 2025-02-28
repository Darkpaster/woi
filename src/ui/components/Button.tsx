import React from "react";

const Button = ({children, onClick = () => alert("Undefined onClick handler."), styleType = "", onMouseEnter}: {
                    children: React.ReactNode,
                    styleType?: string,
                    onClick?: () => void,
                    onMouseEnter?: (e: never) => void
                } & React.HTMLAttributes<HTMLButtonElement>
)=> {
    return (
        <>
            <button onMouseEnter={onMouseEnter} className={`${styleType}`} onClick={onClick}>{children}</button>
        </>
    );
}

export default Button;