type TabProps = {
    title: string;
    isActive: boolean;
    onClick: () => void;
};


const Tab: React.FC<TabProps> = ({ title, isActive, onClick }) => (
    <div
        className={`px-4 py-2 cursor-pointer border-b-2 ${isActive ? 'border-blue-500 font-bold' : 'border-transparent'}`}
        onClick={onClick}
    >
        {title}
    </div>
);

export default Tab;