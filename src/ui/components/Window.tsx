import {ReactNode} from "react";

export const Window = ({ children, styleType }: { children: ReactNode, styleType: string }) => {
  return (
    <div className={`ui-div ${styleType}`}>
      {children}
    </div>
  );
}