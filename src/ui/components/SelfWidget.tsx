import React from "react";
import {ProgressBar} from "./progressBar.ts";

interface HealthBarProps {
    value: number;
    max: number;
    id?: string;
    className?: string;
}

const SelfWidget: React.FC<HealthBarProps> = ({ value, max, id, className }) => (
    <ProgressBar
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