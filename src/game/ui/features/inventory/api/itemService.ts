import axios from 'axios';

export interface ItemPosition {
    id: number;
    itemId: number;
    x: number;
    y: number;
    z: number;
    // Add other item position properties as needed
}

export interface InventoryItem {
    id: number;
    itemId: number;
    playerId: number;
    slot: number;
    quantity: number;
    // Add other inventory item properties as needed
}

export interface EquippedItem {
    id: number;
    itemId: number;
    playerId: number;
    slot: string; // e.g., "HEAD", "CHEST", "WEAPON"
    // Add other equipped item properties as needed
}

export class ItemService {
    private baseUrl = '/item';

    async initAllItems(): Promise<ItemPosition[]> {
        const response = await axios.get<ItemPosition[]>(`${this.baseUrl}/init`);
        return response.data;
    }

    async equipItem(inventoryItem: InventoryItem): Promise<void> {
        await axios.post(`${this.baseUrl}/equipItem`, inventoryItem);
    }

    async unequipItem(equippedItem: EquippedItem, inventorySlot: number): Promise<void> {
        await axios.post(`${this.baseUrl}/unequipItem`, equippedItem, {
            params: { inventorySlot }
        });
    }

    async dropItem(inventoryItem: InventoryItem, itemPosition: ItemPosition): Promise<void> {
        await axios.post(`${this.baseUrl}/dropItem`, inventoryItem, {
            params: { itemPosition }
        });
    }

    async pickUpItem(inventoryItem: InventoryItem): Promise<void> {
        await axios.post(`${this.baseUrl}/pickUpItem`, inventoryItem);
    }

    async lootItem(itemPosition: ItemPosition): Promise<void> {
        await axios.post(`${this.baseUrl}/lootItem`, itemPosition);
    }
}

export default new ItemService();