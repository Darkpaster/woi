// Компонент миниатюрной полосы статуса
import React from "react";

interface MiniStatusBarProps {
    value: number;
    max: number;
    color: 'health' | 'mana' | "stamina";
}

export const MiniStatusBar: React.FC<MiniStatusBarProps> = ({ value, max, color }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="mini-status-bar">
            <div
                className={`mini-status-fill ${color}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};
