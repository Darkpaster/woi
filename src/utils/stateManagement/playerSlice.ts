// src/store/slices/playerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
    id: string;
    username: string;
    characterName: string;
    characterClass: CharacterClass;
    level: number;
    experience: number;
    experienceToNextLevel: number;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    stamina: number;
    maxStamina: number;
    position: Position;
    rotation: number;
    stats: Stats;
    equipment: Equipment;
    activeEffects: Array<{
        id: string;
        name: string;
        duration: number;
        startTime: number;
        effect: string;
        magnitude: number;
    }>;
    isMoving: boolean;
    isInCombat: boolean;
    isResting: boolean;
    isDead: boolean;
    targetId: string | null;
    regionId: string;
    gold: number;
    skillPoints: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: PlayerState = {
    id: '',
    username: '',
    characterName: '',
    characterClass: 'WARRIOR',
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    stamina: 100,
    maxStamina: 100,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    stats: {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        luck: 5,
        physicalAttack: 5,
        magicAttack: 5,
        physicalDefense: 5,
        magicDefense: 5,
        critChance: 5,
        critDamage: 150,
        attackSpeed: 100,
        movementSpeed: 5,
    },
    equipment: {
        helmet: null,
        chest: null,
        legs: null,
        boots: null,
        gloves: null,
        mainHand: null,
        offHand: null,
        necklace: null,
        ring1: null,
        ring2: null,
    },
    activeEffects: [],
    isMoving: false,
    isInCombat: false,
    isResting: false,
    isDead: false,
    targetId: null,
    regionId: 'starting_area',
    gold: 0,
    skillPoints: 0,
    isLoading: false,
    error: null,
};

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setPlayerData: (state, action: PayloadAction<Character>) => {
            const playerData = action.payload;
            return {
                ...state,
                ...playerData,
            };
        },
        updatePosition: (state, action: PayloadAction<Position>) => {
            state.position = action.payload;
        },
        setMovementState: (state, action: PayloadAction<boolean>) => {
            state.isMoving = action.payload;
        },
        setTarget: (state, action: PayloadAction<string | null>) => {
            state.targetId = action.payload;
        },
        updateHealth: (state, action: PayloadAction<number>) => {
            state.health = Math.max(0, Math.min(state.maxHealth, action.payload));
            state.isDead = state.health <= 0;
        },
        updateMana: (state, action: PayloadAction<number>) => {
            state.mana = Math.max(0, Math.min(state.maxMana, action.payload));
        },
        updateStamina: (state, action: PayloadAction<number>) => {
            state.stamina = Math.max(0, Math.min(state.maxStamina, action.payload));
        },
        gainExperience: (state, action: PayloadAction<number>) => {
            state.experience += action.payload;
            // Level up logic could be more complex, handled in a thunk or middleware
            if (state.experience >= state.experienceToNextLevel) {
                state.level += 1;
                state.experience -= state.experienceToNextLevel;
                state.experienceToNextLevel = Math.floor(state.experienceToNextLevel * 1.5);
                state.skillPoints += 3;
                state.maxHealth += 10;
                state.maxMana += 5;
                state.health = state.maxHealth;
                state.mana = state.maxMana;
            }
        },
        setRegion: (state, action: PayloadAction<string>) => {
            state.regionId = action.payload;
        },
        addEffect: (state, action: PayloadAction<{
            id: string;
            name: string;
            duration: number;
            effect: string;
            magnitude: number;
        }>) => {
            const effect = {
                ...action.payload,
                startTime: Date.now(),
            };
            state.activeEffects.push(effect);
        },
        removeEffect: (state, action: PayloadAction<string>) => {
            state.activeEffects = state.activeEffects.filter(
                (effect) => effect.id !== action.payload
            );
        },
        updateGold: (state, action: PayloadAction<number>) => {
            state.gold = Math.max(0, state.gold + action.payload);
        },
        setCombatState: (state, action: PayloadAction<boolean>) => {
            state.isInCombat = action.payload;
        },
        resetPlayer: () => initialState,
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setPlayerData,
    updatePosition,
    setMovementState,
    setTarget,
    updateHealth,
    updateMana,
    updateStamina,
    gainExperience,
    setRegion,
    addEffect,
    removeEffect,
    updateGold,
    setCombatState,
    resetPlayer,
    setLoading,
    setError,
} = playerSlice.actions;

export default playerSlice.reducer;