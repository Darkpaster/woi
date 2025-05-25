import React from 'react';
import "../styles/tab.scss"

type TabProps = {
    title: string;
    isActive: boolean;
    onClick: () => void;
};

const Tab: React.FC<TabProps> = ({ title, isActive, onClick }) => (
    <div
        className={`tab ${isActive ? 'tab--active' : ''}`}
        onClick={onClick}
    >
        {title}
    </div>
);

export default Tab;