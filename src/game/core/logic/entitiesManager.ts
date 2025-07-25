import Mob from "./actors/mobs/mob.ts";
import Item from "./items/item.ts";
import Player from "./actors/player.ts";
import { MapManager } from "./world/mapManager.ts";
import { scaledTileSize } from "../../../utils/math/general.ts";
import BlueSlime from "./actors/mobs/enemies/blueSlime.ts";
import { settings } from "../config/settings.ts";
import { ActorDTO } from "../types.ts";

export class EntityManager {
    private readonly _players = new Map<number, Player>();
    private readonly _mobs = new Map<number, Mob>();
    private readonly _items = new Map<number[], Item>();
    private readonly playerStorage = new Map<string, Set<number>>();
    private readonly mobStorage = new Map<string, Set<number>>();
    private readonly itemStorage = new Map<string, Set<number[]>>();

    get items(): Map<number[], Item> {
        return this._items;
    }

    get mobs(): Map<number, Mob> {
        return this._mobs;
    }

    get players(): Map<number, Player> {
        return this._players;
    }

    private getChunkKey(x: number, y: number): string {
        const col = Math.floor(x / scaledTileSize() / MapManager.CHUNK_SIZE);
        const row = Math.floor(y / scaledTileSize() / MapManager.CHUNK_SIZE);
        return `${col},${row}`;
    }

    private getNearbyKeys(x: number, y: number): string[] {
        const unit = Math.round(window.innerHeight / 2);
        const result: string[] = [];
        const corners = [
            [x - unit, y - unit],
            [x - unit, y + unit],
            [x + unit, y - unit],
            [x + unit, y + unit]
        ];

        for (const [cornerX, cornerY] of corners) {
            const key = this.getChunkKey(cornerX, cornerY);
            if (!result.includes(key)) {
                result.push(key);
            }
        }

        return result;
    }

    private ensureStorageExists<T>(storage: Map<string, Set<T>>, key: string): void {
        if (!storage.has(key)) {
            storage.set(key, new Set());
        }
    }

    hasPlayer(id: number): boolean {
        return this._players.has(id);
    }

    hasItem(id: number[]): boolean {
        return this._items.has(id);
    }

    getPlayer(id: number): Player | undefined {
        return this._players.get(id);
    }

    getMob(id: number): Mob | undefined {
        return this._mobs.get(id);
    }

    addPlayer<P extends Player>(player: P): void {
        this._players.set(player.id, player);
        const key = this.getChunkKey(player.x, player.y);
        this.ensureStorageExists(this.playerStorage, key);
        this.playerStorage.get(key)!.add(player.id);
    }

    removePlayer(playerId: number): void {
        const player = this._players.get(playerId);
        if (!player) return;

        const key = this.getChunkKey(player.x, player.y);
        this.playerStorage.get(key)?.delete(playerId);
        this._players.delete(playerId);
    }

    addItem<I extends Item>(item: I): void {
        this._items.set(item.ids, item);
        const key = this.getChunkKey(item.x, item.y);
        this.ensureStorageExists(this.itemStorage, key);
        this.itemStorage.get(key)!.add(item.ids);
    }

    removeItem(itemId: number[]): void {
        const item = this._items.get(itemId);
        if (!item) return;

        const key = this.getChunkKey(item.x, item.y);
        this.itemStorage.get(key)?.delete(itemId);
        this._items.delete(itemId);
    }

    addMob(mobData: ActorDTO): void {
        const mob = new BlueSlime();
        mob.x = mobData.x * settings.defaultTileScale;
        mob.y = mobData.y * settings.defaultTileScale;
        mob.id = mobData.actorId;
        mob.HP = mob.HT = mobData.health;
        mob.name = mobData.name;

        this._mobs.set(mob.id, mob);
        const key = this.getChunkKey(mob.x, mob.y);
        this.ensureStorageExists(this.mobStorage, key);
        this.mobStorage.get(key)!.add(mob.id);
    }

    removeMob(mobId: number): void {
        const mob = this._mobs.get(mobId);
        if (!mob) return;

        const key = this.getChunkKey(mob.x, mob.y);
        this.mobStorage.get(key)?.delete(mobId);
        this._mobs.delete(mobId);
    }

    updatePlayer<P extends Player>(player: P): void {
        const existingPlayer = this._players.get(player.id);
        if (!existingPlayer) return;

        const oldKey = this.getChunkKey(existingPlayer.x, existingPlayer.y);
        const newKey = this.getChunkKey(player.x, player.y);

        if (oldKey !== newKey) {
            this.playerStorage.get(oldKey)?.delete(player.id);
            this.ensureStorageExists(this.playerStorage, newKey);
            this.playerStorage.get(newKey)!.add(player.id);
        }

        this._players.set(player.id, player);
    }

    updateMob(mob: ActorDTO): void {
        const existingMob = this._mobs.get(mob.actorId);

        if (!existingMob) {
            console.log("Mob respawned:", mob.actorId);
            this.addMob(mob);
            return;
        }

        const oldKey = this.getChunkKey(existingMob.x, existingMob.y);

        existingMob.x = mob.x * settings.defaultTileScale;
        existingMob.y = mob.y * settings.defaultTileScale;
        existingMob.HP = mob.health;
        existingMob.renderState = mob.renderState;

        const newKey = this.getChunkKey(existingMob.x, existingMob.y);

        if (oldKey !== newKey) {
            this.mobStorage.get(oldKey)?.delete(mob.actorId);
            this.ensureStorageExists(this.mobStorage, newKey);
            this.mobStorage.get(newKey)!.add(mob.actorId);
        }

        this._mobs.set(mob.actorId, existingMob);
    }

    findPlayersAt(x: number, y: number): Player[] {
        const key = this.getChunkKey(x, y);
        const ids = this.playerStorage.get(key);

        if (!ids) return [];

        return Array.from(ids)
            .map(id => this._players.get(id))
            .filter((player): player is Player => Boolean(player));
    }

    findMobsAt(x: number, y: number): Mob[] {
        const keys = this.getNearbyKeys(x, y);
        const result: Mob[] = [];

        for (const key of keys) {
            const ids = this.mobStorage.get(key);
            if (!ids) continue;

            const mobs = Array.from(ids)
                .map(id => this._mobs.get(id))
                .filter((mob): mob is Mob => Boolean(mob));

            result.push(...mobs);
        }

        return result;
    }

    findItemsAt(x: number, y: number): Item[] {
        const key = this.getChunkKey(x, y);
        const ids = this.itemStorage.get(key);

        if (!ids) return [];

        return Array.from(ids)
            .map(id => this._items.get(id))
            .filter((item): item is Item => Boolean(item));
    }
}