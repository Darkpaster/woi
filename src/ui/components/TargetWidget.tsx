import React from "react";

interface HealthBarProps {
    value: number;
    max: number;
    id?: string;
    className?: string;
}

export const TargetWidget: React.FC<HealthBarProps> = ({ value, max, id, className }) => (
    <progress
        id={id || 'target-health'}
        className={className || 'stat-bar-enemy'}
        value={value}
        max={max}
        style={{
            accentColor: 'green',
            backgroundColor: 'grey',
        }}
    />
);