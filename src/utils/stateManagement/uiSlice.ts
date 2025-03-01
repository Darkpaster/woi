import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Item} from "../../core/logic/items/item.ts";
import {Actor} from "../../core/logic/actors/actor.ts";
import {Skill} from "../../core/logic/skills/skill.ts";
import {WritableDraft} from "immer";

export interface UIState {
    isInventoryOpen: boolean;
    gameState: 'mainMenu' | 'paused' | 'inGame';
    infoEntity: WritableDraft<Item> | WritableDraft<Actor> | WritableDraft<Skill> | null,
    infoPosition: { left: number; top: number } | null;
    // playerHealth: number,
    // playerTotalHealth: number,
    // targetHealth: number,
    // targetTotalHealth: number,
    canvasRef: HTMLCanvasElement | null;
}

const initialState: UIState = {
    isInventoryOpen: false,
    gameState: "mainMenu",
    infoEntity: null,
    infoPosition: null,
    // playerHealth: player!.HP,
    // playerTotalHealth: player!.HT,
    // targetHealth: player!.target.HP,
    // targetTotalHealth: player!.target.HT,
    canvasRef: null,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setGameState(state, action: PayloadAction<'mainMenu' | 'paused' | 'inGame'>) {
            state.gameState = action.payload;
        },
        toggleInventory(state) {
            state.isInventoryOpen = !state.isInventoryOpen;
        },
        setInfoEntity(state, action: PayloadAction<WritableDraft<Item> | WritableDraft<Actor> | WritableDraft<Skill> | null>) {
            state.infoEntity = action.payload;
        },
        setInfoPosition(state, action: PayloadAction<{ left: number; top: number } | null>) {
            state.infoPosition = action.payload;
        },
        setCanvasRef(state, action: PayloadAction<WritableDraft<HTMLCanvasElement> | null>) {
            state.canvasRef = action.payload;
        },
    },
});

export const { setGameState, toggleInventory, setInfoPosition, setCanvasRef, setInfoEntity } = uiSlice.actions;
export default uiSlice.reducer;
