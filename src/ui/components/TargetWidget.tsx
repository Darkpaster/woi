import React from "react";
import {ProgressBar} from "./progressBar.ts";

interface HealthBarProps {
    value: number;
    max: number;
    id?: string;
    className?: string;
}

const TargetWidget: React.FC<HealthBarProps> = ({ value, max, id, className }) => (
    <ProgressBar
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