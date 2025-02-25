// Компонент для отображения информационного окна при наведении на элемент
interface InfoWindowProps {
    item: any;
    position: { left: number; top: number };
    onClose: () => void;
}

const InfoWindow: React.FC<InfoWindowProps> = ({ item, position, onClose }) => {
    return (
        <div className={`info-window ${item.rarity}`}
             style={{
                 position: 'absolute',
                 left: position.left,
                 top: position.top,
                 background: '#222',
                 color: 'white',
                 padding: '8px',
                 border: '1px solid white',
                 zIndex: 1000,
             }}
             onMouseLeave={onClose}
        >
            <big>{item.name}</big>
            <br />
            <br />
            {item.description}
            {item.note && (
                <>
                    <br />
                    <br />
                    {item.note}
                </>
            )}
        </div>
    );
};