import React from 'react';

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