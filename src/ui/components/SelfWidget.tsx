import React from "react";

interface HealthBarProps {
    value: number;
    max: number;
    id?: string;
    className?: string;
}

export const SelfWidget: React.FC<HealthBarProps> = ({ value, max, id, className }) => (
    <progress
        id={id || 'health'}
        className={className || 'stat-bar'}
        value={value}
        max={max}
        style={{
            accentColor: 'green',
            backgroundColor: 'grey',
        }}
    />
);