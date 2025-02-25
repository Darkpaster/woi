import {ReactNode} from "react";

const Window = ({ children }: { children: ReactNode }) => {
  return (
    <div className="window">
      {children}
    </div>
  );
}