import React from "react";

interface HealthBarProps {
    value: number;
    max: number;
    id?: string;
    className?: string;
}

export const CharWidget: React.FC<HealthBarProps> = ({ value, max, id, className }) => (
    <div className={className || 'stat-bar'}>
        {/*<circle radius={10} strokeWidth={2} string={"test"} style={{backgroundColor: "black"}}></circle>*/}
        <progress
            // id={id || 'health'}
            value={value}
            max={max}
        />
        <span>{`${value}/${max}`}</span>
    </div>

);