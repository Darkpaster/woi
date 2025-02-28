import React, {ReactNode} from "react";

export const Window = ({ children, styleType }: {
  children: ReactNode, styleType: string } & React.HTMLAttributes<HTMLDivElement>
) => {
  return (
    <div className={`ui-div ${styleType}`}>
      {children}
    </div>
  );
}