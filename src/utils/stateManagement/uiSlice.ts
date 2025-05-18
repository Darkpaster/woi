import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface ItemType  {
}

export interface SkillType {
    minDamage: number,
    maxDamage: number,
    cooldown: number,
}

export interface UIState {
    isInventoryOpen: boolean;
    isCharMenuOpen: boolean;
    gameState: 'mainMenu' | 'paused' | 'inGame';
    infoEntity: ItemType|SkillType|null,
    infoPosition: { left: number; top: number } | null;
    // playerHealth: number,
    // playerTotalHealth: number,
    // targetHealth: number,
    // targetTotalHealth: number,
    // canvasRef: HTMLCanvasElement | null;
}

const initialState: UIState = {
    isInventoryOpen: false,
    isCharMenuOpen: false,
    gameState: "mainMenu",
    infoEntity: null,
    infoPosition: null,
    // playerHealth: player!.HP,
    // playerTotalHealth: player!.HT,
    // targetHealth: player!.target.HP,
    // targetTotalHealth: player!.target.HT,
    // canvasRef: null,
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
        toggleCharMenu(state) {
            state.isCharMenuOpen = !state.isCharMenuOpen;
        },
        setInfoEntity(state, action: PayloadAction<ItemType | SkillType | null>) {
            state.infoEntity = action.payload;
        },
        setInfoPosition(state, action: PayloadAction<{ left: number; top: number } | null>) {
            state.infoPosition = action.payload;
        },
        // setCanvasRef(state, action: PayloadAction<WritableDraft<HTMLCanvasElement> | null>) {
        //     state.canvasRef = action.payload;
        // },
    },
});

export const { toggleInventory, toggleCharMenu, setInfoPosition, setInfoEntity } = uiSlice.actions;
export default uiSlice.reducer;
