import React from "react";

const Button = ({children, onClick = () => alert("Undefined onClick handler."), styleType = "default"}: {
    children: React.ReactNode;
    styleType?: "primary" | "secondary" | "default";
    onClick?: () => void;}
)=> {
    return (
        <>
            <button className={styleType} onClick={onClick}>{children}</button>
        </>
    );
}

export default Button;