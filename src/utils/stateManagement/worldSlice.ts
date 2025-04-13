// src/store/slices/worldSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorldState {
    currentRegionId: string;
    regions: Record<string, WorldRegion>;
    visiblePlayers: Record<string, {
        id: string;
        username: string;
        characterName: string;
        characterClass: string;
        level: number;
        position: Position;
        rotation: number;
        isMoving: boolean;
        isInCombat: boolean;
        isDead: boolean;
        guildName?: string;
    }>;
    npcs: Record<string, NPC>;
    monsters: Record<string, Monster>;
    worldObjects: Record<string, WorldObject>;
    weather: 'SUNNY' | 'RAINY' | 'FOGGY' | 'SNOWY';
    timeOfDay: number; // 0-24 hours
    isLoading: boolean;
    error: string | null;
}

const initialState: WorldState = {
    currentRegionId: '',
    regions: {},
    visiblePlayers: {},
    npcs: {},
    monsters: {},
    worldObjects: {},
    weather: 'SUNNY',
    timeOfDay: 12,
    isLoading: false,
    error: null,
};

export const worldSlice = createSlice({
    name: 'world',
    initialState,
    reducers: {
        setCurrentRegion: (state, action: PayloadAction<string>) => {
            state.currentRegionId = action.payload;
        },
        addRegion: (state, action: PayloadAction<WorldRegion>) => {
            state.regions[action.payload.id] = action.payload;
        },
        updateRegions: (state, action: PayloadAction<Record<string, WorldRegion>>) => {
            state.regions = action.payload;
        },
        addPlayer: (state, action: PayloadAction<{
            id: string;
            username: string;
            characterName: string;
            characterClass: string;
            level: number;
            position: Position;
            rotation: number;
            isMoving: boolean;
            isInCombat: boolean;
            isDead: boolean;
            guildName?: string;
        }>) => {
            state.visiblePlayers[action.payload.id] = action.payload;
        },
        updatePlayerPosition: (state, action: PayloadAction<{ id: string; position: Position; isMoving: boolean; rotation: number }>) => {
            const { id, position, isMoving, rotation } = action.payload;
            if (state.visiblePlayers[id]) {
                state.visiblePlayers[id].position = position;
                state.visiblePlayers[id].isMoving = isMoving;
                state.visiblePlayers[id].rotation = rotation;
            }
        },
        removePlayer: (state, action: PayloadAction<string>) => {
            delete state.visiblePlayers[action.payload];
        },
        updateVisiblePlayers: (state, action: PayloadAction<Record<string, {
            id: string;
            username: string;
            characterName: string;
            characterClass: string;
            level: number;
            position: Position;
            rotation: number;
            isMoving: boolean;
            isInCombat: boolean;
            isDead: boolean;
            guildName?: string;
        }>>) => {
            state.visiblePlayers = action.payload;
        },
        updateNPCs: (state, action: PayloadAction<Record<string, NPC>>) => {
            state.npcs = action.payload;
        },
        updateMonsters: (state, action: PayloadAction<Record<string, Monster>>) => {
            state.monsters = action.payload;
        },
        updateMonsterPosition: (state, action: PayloadAction<{ id: string; position: Position; isMoving: boolean }>) => {
            const { id, position, isMoving } = action.payload;
            if (state.monsters[id]) {
                state.monsters[id].position = position;
                state.monsters[id].isMoving = isMoving;
            }
        },
        updateMonsterHealth: (state, action: PayloadAction<{ id: string; health: number; maxHealth: number }>) => {
            const { id, health, maxHealth } = action.payload;
            if (state.monsters[id]) {
                state.monsters[id].health = health;
                state.monsters[id].maxHealth = maxHealth;
                state.monsters[id].isDead = health <= 0;
            }
        },
        updateWorldObjects: (state, action: PayloadAction<Record<string, WorldObject>>) => {
            state.worldObjects = action.payload;
        },
        setWeather: (state, action: PayloadAction<'SUNNY' | 'RAINY' | 'FOGGY' | 'SNOWY'>) => {
            state.weather = action.payload;
        },
        setTimeOfDay: (state, action: PayloadAction<number>) => {
            state.timeOfDay = action.payload;
        },
        resetWorld: () => initialState,
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setCurrentRegion,
    addRegion,
    updateRegions,
    addPlayer,
    updatePlayerPosition,
    removePlayer,
    updateVisiblePlayers,
    updateNPCs,
    updateMonsters,
    updateMonsterPosition,
    updateMonsterHealth,
    updateWorldObjects,
    setWeather,
    setTimeOfDay,
    resetWorld,
    setLoading,
    setError,
} = worldSlice.actions;

export default worldSlice.reducer;