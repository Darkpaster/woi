import React from "react";

const Button = ({children, onClick = () => alert("Undefined onClick handler."), styleType = "default", onMouseEnter}: {
                    children: React.ReactNode,
                    styleType?: "primary" | "secondary" | "default",
                    onClick?: () => void,
                    onMouseEnter?: (e: never) => void
                } & React.HTMLAttributes<HTMLButtonElement>
)=> {
    return (
        <>
            <button onMouseEnter={onMouseEnter} className={styleType} onClick={onClick}>{children}</button>
        </>
    );
}

export default Button;