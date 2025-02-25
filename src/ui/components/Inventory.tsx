// Компонент инвентаря
import Button from "./Button.tsx";

interface InventoryProps {
    onShowInfo: (item: never, rect: DOMRect) => void;
    onHideInfo: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ onShowInfo, onHideInfo }) => {
    const [inventory, setInventory] = useState(player.inventory);

    useEffect(() => {
        const interval = setInterval(() => {
            // Обновляем копию инвентаря из глобального объекта
            setInventory([...player.inventory]);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inventory-div">
            {inventory.map((item, index) => (
                <Button
                    key={index}
                    className="cell"
                    onClick={() => {
                        if (item) {
                            item.onUse();
                            player.inventory[index] = null;
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (item) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            onShowInfo(item, rect);
                        }
                    }}
                    onMouseLeave={onHideInfo}
                    style={{
                        backgroundImage: item ? `url(${item.spritePath})` : undefined,
                        borderColor: item ? getRarityColor(item.rarity) : 'black',
                        cursor: item ? 'pointer' : 'default',
                    }}
                >
                    {/* Содержимое кнопки оставляем пустым */}
                </Button>
            ))}
        </div>
    );
};