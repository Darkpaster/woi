// components/WindowPanel.tsx
import React from "react";
import "../styles/panel.scss";
import {WindowConfig, WindowPanelProps} from "../types.ts";
import Icon from "../../../shared/ui/Icon.tsx";

const WindowsPanel: React.FC<WindowPanelProps> = ({
                                                     orientation = 'horizontal',
                                                     length,
                                                     windows,
                                                     onWindowOpen,
                                                     position,
                                                     className = ''
                                                 }) => {
    // Создаем массив слотов нужной длины
    const slots = Array.from({ length }, (_, index) => windows[index] || null);

    const getPositionClasses = () => {
        let classes = `panel-container panel-container--${orientation} window-panel`;

        if (position) {
            return `${classes} ${className}`;
        }

        // Позиция по умолчанию для панели окон - правый край
        if (orientation === 'vertical') {
            classes += ' panel-container--right-center';
        } else {
            classes += ' panel-container--top-center';
        }

        return `${classes} ${className}`;
    };

    const getSlotClasses = (windowConfig: WindowConfig | null) => {
        let classes = 'panel-slot';

        if (!windowConfig) {
            classes += ' panel-slot--empty';
        } else {
            classes += ` panel-slot--${windowConfig.type}`;
        }

        return classes;
    };

    const customStyle = position ? {
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        right: position.right,
    } : {};

    return (
        <div
            className={getPositionClasses()}
            style={customStyle}
        >
            {slots.map((windowConfig, index) => (
                <button
                    key={index}
                    className={getSlotClasses(windowConfig)}
                    onClick={() => {
                        if (windowConfig) {
                            onWindowOpen(windowConfig.type);
                        }
                    }}
                    title={windowConfig?.name}
                    style={{
                        padding: 0
                    }}
                >
                    <Icon
                        icon={windowConfig?.icon}
                        displayText=""
                    />

                    {/* Хоткей индикатор */}
                    {windowConfig?.hotkey && (
                        <div className="panel-slot__hotkey">
                            {windowConfig.hotkey}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};

export default WindowsPanel;